import { useState } from "react";
import { Button, Loader, useToast } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { analyzeReview } from "../api/reviewApi";

/**
 * ReviewAnalyzer
 * ──────────────
 * Week 7 — AI-powered guest review sentiment analysis page.
 *
 * Flow:
 *  1. User enters a guest review in the textarea
 *  2. Clicks "Analyze Review"
 *  3. Backend sends the review to Gemini AI
 *  4. Results are displayed: sentiment, confidence, themes,
 *     summary, and a suggested management response
 */

// ── Sample reviews for quick testing ─────────────────────────
const SAMPLE_REVIEWS = [
  {
    label: "Positive",
    text: "What an incredible stay! The mountain views from the balcony were breathtaking and our host Ramesh was so welcoming. The homemade dal and fresh parathas every morning were a highlight. The rooms were spotlessly clean and the hot water worked perfectly even in the cold weather. We'll definitely be coming back next season!",
  },
  {
    label: "Negative",
    text: "Very disappointing experience. The room was not clean when we arrived — there were stains on the bedsheets and the bathroom had mold. The WiFi didn't work for the entire stay and the host was unresponsive to our complaints. The heater was broken and nights were freezing. Overpriced for the quality provided.",
  },
  {
    label: "Mixed",
    text: "The location is absolutely stunning with gorgeous views of the valley. However, the facilities need serious upgrading. The bathroom plumbing was leaky, and the mattress was very uncomfortable. On the plus side, the host's family was incredibly kind and the home-cooked meals were delicious. A mixed experience overall.",
  },
];

// ── Sentiment styling ────────────────────────────────────────
const SENTIMENT_CONFIG = {
  positive: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200",
    bar: "bg-emerald-500",
    icon: "😊",
  },
  negative: {
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-200",
    bar: "bg-red-500",
    icon: "😟",
  },
  neutral: {
    bg: "bg-stone-50 dark:bg-stone-800/50",
    border: "border-stone-200 dark:border-stone-700",
    text: "text-stone-700 dark:text-stone-300",
    badge: "bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200",
    bar: "bg-stone-400",
    icon: "😐",
  },
  mixed: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200",
    bar: "bg-amber-500",
    icon: "🤔",
  },
};

export default function ReviewAnalyzer() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const charCount = reviewText.length;
  const isValid = charCount >= 10 && charCount <= 5000;

  // ── Analyze review ─────────────────────────────────────────
  async function handleAnalyze() {
    if (!isValid) {
      toast("Review must be between 10 and 5,000 characters.", {
        type: "warning",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeReview(reviewText, token);
      setResult(res.data);
      toast("Review analyzed successfully!", { type: "success" });
    } catch (err) {
      toast(err.message || "Analysis failed. Please try again.", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  // ── Load sample review ────────────────────────────────────
  function loadSample(text) {
    setReviewText(text);
    setResult(null);
  }

  // ── Copy to clipboard ─────────────────────────────────────
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard!", { type: "success", duration: 2000 });
    } catch {
      toast("Failed to copy.", { type: "error" });
    }
  }

  // ── Derived styling ───────────────────────────────────────
  const sentiment = result?.analysis?.sentiment || "neutral";
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
          Review Analyzer
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Paste a guest review below and get AI-powered sentiment analysis,
          theme classification, and a suggested response.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Input Panel ────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          {/* Textarea card */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
            <label
              htmlFor="review-input"
              className="mb-2 block text-sm font-medium text-stone-900 dark:text-white"
            >
              Guest Review
            </label>
            <textarea
              id="review-input"
              rows={8}
              placeholder="Paste or type a guest review here…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-brand-500 dark:focus:ring-brand-700/40"
              maxLength={5000}
            />

            {/* Character count */}
            <div className="mt-1.5 flex items-center justify-between">
              <p
                className={[
                  "text-xs",
                  charCount > 5000
                    ? "text-red-500"
                    : charCount > 0 && charCount < 10
                      ? "text-amber-500"
                      : "text-stone-400 dark:text-stone-500",
                ].join(" ")}
              >
                {charCount.toLocaleString()} / 5,000 characters
              </p>
              {reviewText && (
                <button
                  type="button"
                  onClick={() => {
                    setReviewText("");
                    setResult(null);
                  }}
                  className="text-xs font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Analyze button */}
            <Button
              className="mt-4 w-full"
              onClick={handleAnalyze}
              disabled={loading || !isValid}
            >
              {loading ? (
                <Loader size="sm" label="Analyzing" />
              ) : (
                "✨ Analyze Review"
              )}
            </Button>
          </div>

          {/* Sample reviews */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Try a sample review
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_REVIEWS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => loadSample(sample.text)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Results Panel ───────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white p-12 dark:border-stone-700 dark:bg-stone-800">
              <Loader size="lg" label="Analyzing review with AI" />
              <p className="text-xs text-stone-500 dark:text-stone-400 animate-pulse">
                This may take a few seconds…
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-12 dark:border-stone-600 dark:bg-stone-800/50">
              <span className="text-4xl" aria-hidden="true">
                🔍
              </span>
              <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
                Enter a guest review and click{" "}
                <span className="font-medium text-stone-700 dark:text-stone-200">
                  Analyze Review
                </span>{" "}
                to get AI-powered insights.
              </p>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Sentiment badge */}
              <div
                className={`rounded-xl border ${config.border} ${config.bg} p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {config.icon}
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                        Sentiment
                      </p>
                      <p
                        className={`text-lg font-semibold capitalize ${config.text}`}
                      >
                        {result.analysis.sentiment}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${config.badge}`}
                  >
                    {Math.round(result.analysis.confidence * 100)}% confident
                  </span>
                </div>

                {/* Confidence bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                  <div
                    className={`h-full rounded-full ${config.bar} transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.round(result.analysis.confidence * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Themes */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Themes Identified
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {result.analysis.themes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {result.analysis.summary}
                </p>
              </div>

              {/* Suggested Response */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Suggested Response
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(result.analysis.suggestedResponse)
                    }
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                  >
                    <span aria-hidden="true">📋</span> Copy
                  </button>
                </div>
                <p className="mt-2 rounded-lg border border-stone-100 bg-stone-50 p-3 text-sm leading-relaxed text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300">
                  {result.analysis.suggestedResponse}
                </p>
              </div>

              {/* Metadata footer */}
              <p className="text-right text-[11px] text-stone-400 dark:text-stone-500">
                Analyzed at{" "}
                {new Date(result.analyzedAt).toLocaleString()}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
