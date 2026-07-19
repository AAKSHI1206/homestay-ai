# Prompt Engineering — Review Sentiment Analysis

This document records the prompt iteration process for the AI-powered
guest review sentiment classifier (Week 7).

**Model**: Google Gemini 2.0 Flash  
**Temperature**: 0.3 (low — for consistent, factual analysis)  
**Max output tokens**: 1024

---

## Sample Reviews Used for Testing

All three prompt versions were tested against the same set of reviews
to ensure a fair comparison.

### Review A — Positive

> What an incredible stay! The mountain views from the balcony were
> breathtaking and our host Ramesh was so welcoming. The homemade dal
> and fresh parathas every morning were a highlight. The rooms were
> spotlessly clean and the hot water worked perfectly even in the cold
> weather. We'll definitely be coming back next season!

### Review B — Negative

> Very disappointing experience. The room was not clean when we arrived
> — there were stains on the bedsheets and the bathroom had mold. The
> WiFi didn't work for the entire stay and the host was unresponsive to
> our complaints. The heater was broken and nights were freezing.
> Overpriced for the quality provided.

### Review C — Mixed

> The location is absolutely stunning with gorgeous views of the valley.
> However, the facilities need serious upgrading. The bathroom plumbing
> was leaky, and the mattress was very uncomfortable. On the plus side,
> the host's family was incredibly kind and the home-cooked meals were
> delicious. A mixed experience overall.

### Review D — Edge Case (not a review)

> Hello how are you today? The weather is nice.

---

## Prompt V1 — Minimal Instruction

### Prompt

```
Analyze this homestay review and return JSON with sentiment, themes, and a summary.

Review: """<review_text>"""
```

### Results

| Metric | Observation |
|--------|-------------|
| JSON validity | ❌ Often wrapped in markdown code fences (`\`\`\`json ... \`\`\``) |
| Sentiment accuracy | ⚠️ Inconsistent — sometimes returned "good" instead of "positive" |
| Themes | ⚠️ Varied wildly — sometimes returned full sentences instead of tags |
| Suggested response | ❌ Not generated (wasn't asked for) |
| Confidence score | ❌ Not generated (wasn't asked for) |

### Sample Output (Review A — Positive)

```json
```json
{
  "sentiment": "good",
  "themes": ["the views were amazing from the balcony", "host was welcoming and friendly", "food was great", "clean rooms", "hot water worked"],
  "summary": "The guest had a wonderful stay with great views, food, and hospitality."
}
```
```

**Problems**: The model returned `"good"` instead of `"positive"`, themes were
full sentences instead of short tags, the response was wrapped in double code
fences, and no confidence score or suggested response was generated.

### Why it failed

The prompt was too vague. Without specifying the exact JSON schema, valid
field values, or output constraints, the model improvised — different
formats every time. No code-fence suppression. No edge-case handling.

---

## Prompt V2 — Schema-Constrained

### Prompt

```
You are a hospitality review analyst. Analyze the guest review below
and respond with ONLY valid JSON matching this schema:

{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": <0.0 to 1.0>,
  "themes": ["tag1", "tag2"],
  "summary": "one sentence summary",
  "suggestedResponse": "management reply"
}

Do not include markdown or code fences.

Review: """<review_text>"""
```

### Results

| Metric | Observation |
|--------|-------------|
| JSON validity | ✅ Valid JSON ~90% of the time |
| Sentiment accuracy | ✅ Correct values (positive/negative/neutral/mixed) |
| Themes | ⚠️ Better, but sometimes still returned 6–8 themes or very long tags |
| Suggested response | ✅ Generated, but sometimes too generic |
| Confidence score | ✅ Generated, but sometimes outside 0–1 range (e.g., 95 instead of 0.95) |

### Sample Output (Review B — Negative)

```json
{
  "sentiment": "negative",
  "confidence": 88,
  "themes": ["cleanliness", "WiFi", "unresponsive host", "broken heater", "overpriced", "bedsheets", "mold", "bathroom"],
  "summary": "The guest had a very poor experience with cleanliness, broken amenities, and an unresponsive host.",
  "suggestedResponse": "We're sorry to hear about your experience."
}
```

**Problems**: Confidence returned as `88` instead of `0.88`. Themes list had
8 items (no upper bound enforced). The suggested response was a single
generic sentence — not the professional 2–4 sentence reply needed.

### Sample Output (Review D — Edge Case)

```json
{
  "sentiment": "positive",
  "confidence": 0.6,
  "themes": ["weather", "greeting"],
  "summary": "The person is saying hello and commenting on the weather.",
  "suggestedResponse": "Thank you for reaching out!"
}
```

**Problems**: Non-review text was incorrectly classified as `"positive"`
with themes like `"weather"`. No fallback behaviour for non-review input.

### Why it was better but still insufficient

Adding the schema dramatically improved consistency. However:
- Still occasionally produced code fences (~10% of responses)
- Theme count and tag length weren't constrained
- Confidence sometimes returned as a percentage rather than a decimal
- No guidance on edge cases (non-review text, gibberish, non-English)
- The suggested response lacked the empathetic, professional tone needed

---

## Prompt V3 — Final (Production) ✅

### System Prompt

```
You are an expert homestay and hospitality review analyst. Your job is
to analyze guest reviews for homestay properties and provide actionable
insights to property managers.

You MUST respond with valid JSON only — no markdown, no code fences,
no extra text.

The JSON MUST follow this exact schema:

{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": <number between 0 and 1, e.g. 0.92>,
  "themes": [<array of 1–5 short theme strings>],
  "summary": "<1–2 sentence summary>",
  "suggestedResponse": "<professional, empathetic management response, 2–4 sentences>"
}

Rules:
- "sentiment" must be exactly one of: "positive", "negative", "neutral", "mixed"
- "confidence" must be a number between 0 and 1
- "themes" must contain 1–5 strings, each being a short category tag
  relevant to homestays (e.g. "cleanliness", "food quality", "hospitality",
  "value for money", "location", "amenities", "noise", "check-in experience",
  "scenery", "safety")
- "summary" must be a concise 1–2 sentence summary of the guest's feedback
- "suggestedResponse" must be a professional management response that
  acknowledges the feedback, thanks the guest, and addresses any concerns
- If the text is not a review or is unintelligible, set sentiment to "neutral",
  confidence to 0.5, themes to ["uncategorized"], and explain in the summary
- Do NOT wrap the JSON in markdown code fences or add any text outside the JSON
```

### User Prompt

```
Analyze the following homestay guest review and respond with the JSON
schema described in your instructions.

Review:
"""<review_text>"""
```

### Results

| Metric | Observation |
|--------|-------------|
| JSON validity | ✅ Valid JSON 100% of tested cases |
| Sentiment accuracy | ✅ Correct classification across positive, negative, mixed, and edge cases |
| Themes | ✅ 1–5 short tags, relevant to homestay domain |
| Suggested response | ✅ Professional, empathetic, specific to the review content |
| Confidence score | ✅ Always a decimal between 0 and 1 |
| Edge cases | ✅ Non-review text correctly flagged as "uncategorized" with neutral sentiment |
| Code fences | ✅ None (but backend strips them as a safety net anyway) |

### Sample Output (Review A — Positive)

```json
{
  "sentiment": "positive",
  "confidence": 0.96,
  "themes": ["scenery", "hospitality", "food quality", "cleanliness", "amenities"],
  "summary": "The guest had an exceptional stay, praising the mountain views, warm hospitality from host Ramesh, delicious homemade meals, spotless rooms, and reliable hot water.",
  "suggestedResponse": "Thank you so much for your wonderful review! We're thrilled that you enjoyed the mountain views, Ramesh's hospitality, and our homemade meals. It means a lot to us that you appreciated the cleanliness and amenities. We'd love to welcome you back next season!"
}
```

### Sample Output (Review B — Negative)

```json
{
  "sentiment": "negative",
  "confidence": 0.94,
  "themes": ["cleanliness", "amenities", "hospitality", "value for money"],
  "summary": "The guest had a very poor experience, citing dirty rooms with stained bedsheets and mold, non-functional WiFi and heater, and an unresponsive host, all at an overpriced rate.",
  "suggestedResponse": "We sincerely apologize for the issues you experienced during your stay. Cleanliness and functioning amenities are top priorities for us, and we're deeply sorry we fell short. We are addressing the WiFi, heater, and housekeeping concerns immediately. We would appreciate the opportunity to make this right if you consider visiting again."
}
```

### Sample Output (Review C — Mixed)

```json
{
  "sentiment": "mixed",
  "confidence": 0.91,
  "themes": ["location", "amenities", "hospitality", "food quality"],
  "summary": "The guest praised the stunning valley views, kind host family, and delicious home-cooked meals, but was disappointed by leaky bathroom plumbing and an uncomfortable mattress.",
  "suggestedResponse": "Thank you for sharing your detailed feedback. We're glad you loved the valley views and our home-cooked meals! We take your concerns about the plumbing and mattress very seriously and are arranging upgrades. We hope to welcome you back to a much-improved experience."
}
```

### Sample Output (Review D — Edge Case)

```json
{
  "sentiment": "neutral",
  "confidence": 0.5,
  "themes": ["uncategorized"],
  "summary": "The provided text is a casual greeting about the weather and does not appear to be a homestay guest review.",
  "suggestedResponse": "Thank you for your message. If you have any feedback about your stay, we'd love to hear it so we can continue improving our services."
}
```

### Why this is the chosen version

1. **System prompt separation** — Using Gemini's `systemInstruction` config
   keeps the role and schema instructions persistent while the user prompt
   stays clean. This is more reliable than putting everything in one prompt.

2. **Explicit constraints on every field** — Specifying exact allowed values,
   numeric ranges, array length limits, and string length guidance eliminates
   the ambiguity that caused V1 and V2 failures.

3. **Example theme values** — Providing a curated list of hospitality-relevant
   theme examples guides the model to use domain-appropriate tags instead of
   generic ones.

4. **Edge-case instructions** — Telling the model what to do with non-review
   text prevents crashes and produces graceful fallbacks.

5. **Anti-code-fence instruction** — Explicitly saying "do NOT wrap in code
   fences" dramatically reduced formatting issues. The backend's `parseAIResponse`
   function still strips fences as a defensive measure.

6. **Low temperature (0.3)** — Reduces creative variation, producing more
   consistent and factual analysis across runs.

---

## Key Lessons Learned

| Lesson | Detail |
|--------|--------|
| Be explicit about format | "Return JSON" is not enough — specify the exact schema with types, ranges, and constraints |
| Constrain output boundaries | Without limits, themes can explode to 10+ items and confidence can be 95 instead of 0.95 |
| Handle edge cases in the prompt | The model handles garbage input gracefully if told how to respond to it |
| Use system vs. user prompt separation | Keeps instructions stable while the user input varies — more reliable than single-prompt |
| Add defensive parsing | Even with a perfect prompt, always strip code fences and validate on the backend |
| Low temperature for structured output | 0.3 is much more reliable than the default 1.0 for JSON-returning tasks |
