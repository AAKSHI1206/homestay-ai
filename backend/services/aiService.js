import { GoogleGenAI } from '@google/genai';

/**
 * AI Service — Gemini Review Analyzer
 * ────────────────────────────────────
 * Encapsulates all Google Gemini API interaction for the application.
 *
 * Exports a single function:
 *   analyzeReview(reviewText) → structured analysis object
 *
 * The service handles:
 *  - Prompt engineering (role, schema, few-shot examples)
 *  - API call with timeout protection
 *  - JSON parsing with validation and fallback
 *  - Meaningful error propagation
 *
 * Designed for extensibility: future weeks can add batch processing,
 * multi-model support, or caching by extending this module.
 */

const MODEL_NAME = 'gemini-3-flash-preview';
const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds

// ─── Prompt Engineering ───────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert homestay and hospitality review analyst. Your job is to analyze guest reviews for homestay properties and provide actionable insights to property managers.

You MUST respond with valid JSON only — no markdown, no code fences, no extra text.

The JSON MUST follow this exact schema:

{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": <number between 0 and 1, e.g. 0.92>,
  "themes": [<array of 1–5 short theme strings, e.g. "cleanliness", "hospitality", "location">],
  "summary": "<1–2 sentence summary of the review>",
  "suggestedResponse": "<a professional, empathetic management response to the guest, 2–4 sentences>"
}

Rules:
- "sentiment" must be exactly one of: "positive", "negative", "neutral", "mixed"
- "confidence" must be a number between 0 and 1
- "themes" must contain 1–5 strings, each being a short category tag relevant to homestays (e.g. "cleanliness", "food quality", "hospitality", "value for money", "location", "amenities", "noise", "check-in experience", "scenery", "safety")
- "summary" must be a concise 1–2 sentence summary of the guest's feedback
- "suggestedResponse" must be a professional management response that acknowledges the feedback, thanks the guest, and addresses any concerns raised
- If the text is not a review or is unintelligible, set sentiment to "neutral", confidence to 0.5, themes to ["uncategorized"], and explain in the summary
- Do NOT wrap the JSON in markdown code fences or add any text outside the JSON object`;

/**
 * analyzeReview
 * ─────────────
 * Sends a guest review to Gemini for sentiment analysis.
 *
 * @param  {string}  reviewText — the guest review (1–5000 chars)
 * @returns {Promise<object>}  structured analysis result
 * @throws  {Error}  with descriptive message on failure
 */
export async function analyzeReview(reviewText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const err = new Error(
      'Gemini API key is not configured. Add a valid GEMINI_API_KEY to your .env file.'
    );
    err.statusCode = 503;
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `Analyze the following homestay guest review and respond with the JSON schema described in your instructions.\n\nReview:\n"""${reviewText}"""`;

  try {
    // Call Gemini with timeout protection
    const responsePromise = ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3, // Low temperature for consistent, factual analysis
        maxOutputTokens: 1024,
      },
    });

    const response = await Promise.race([
      responsePromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('AI request timed out. Please try again.')),
          REQUEST_TIMEOUT_MS
        )
      ),
    ]);

    const rawText = response.text?.trim() || '';

    if (!rawText) {
      throw new Error('AI returned an empty response.');
    }

    // Parse and validate the JSON response
    const analysis = parseAIResponse(rawText);
    return analysis;
  } catch (err) {
    // Re-throw our own errors (timeout, parse, config)
    if (err.statusCode) throw err;

    // Wrap Gemini API errors with a user-friendly message
    const wrappedErr = new Error(
      `AI analysis failed: ${err.message || 'Unknown error'}`
    );
    wrappedErr.statusCode = 502;
    throw wrappedErr;
  }
}

// ─── Response Parsing & Validation ────────────────────────────

/**
 * parseAIResponse
 * ───────────────
 * Extracts and validates JSON from the raw Gemini response.
 * Handles cases where the model wraps output in code fences.
 */
function parseAIResponse(rawText) {
  // Strip markdown code fences if present
  let cleaned = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw createParseError(
      'AI response was not valid JSON. Please try again.'
    );
  }

  // Validate required fields
  return validateAnalysis(parsed);
}

/**
 * validateAnalysis
 * ────────────────
 * Ensures the parsed object conforms to the expected schema.
 * Applies sensible defaults for missing/invalid fields rather
 * than rejecting the entire response.
 */
function validateAnalysis(obj) {
  const VALID_SENTIMENTS = ['positive', 'negative', 'neutral', 'mixed'];

  const sentiment = VALID_SENTIMENTS.includes(obj.sentiment)
    ? obj.sentiment
    : 'neutral';

  const confidence =
    typeof obj.confidence === 'number' &&
      obj.confidence >= 0 &&
      obj.confidence <= 1
      ? Math.round(obj.confidence * 100) / 100 // Round to 2 decimals
      : 0.5;

  const themes = Array.isArray(obj.themes) && obj.themes.length > 0
    ? obj.themes.slice(0, 5).map(String)
    : ['uncategorized'];

  const summary =
    typeof obj.summary === 'string' && obj.summary.trim()
      ? obj.summary.trim()
      : 'Unable to generate summary.';

  const suggestedResponse =
    typeof obj.suggestedResponse === 'string' && obj.suggestedResponse.trim()
      ? obj.suggestedResponse.trim()
      : 'Thank you for your review. We appreciate your feedback and will use it to improve our services.';

  return { sentiment, confidence, themes, summary, suggestedResponse };
}

function createParseError(message) {
  const err = new Error(message);
  err.statusCode = 502;
  return err;
}
