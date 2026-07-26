import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Loader,
  Badge,
  useToast,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { analyzeReview, fetchReviewHistory, toggleBookmark } from "../api/reviewApi";
import { fetchListings } from "../api/listingsApi";

const SAMPLES = [
  {
    label: "🌟 Outstanding Stay",
    text: "Our stay at Riverside Homestay in Manali was simply enchanting! The mountain view from the bedroom window was breathtaking. Rajesh and his family welcomed us like old friends, serving traditional Himachali meals that were incredible. Warm hospitality, pristine cleanliness, and super reliable Wi-Fi.",
  },
  {
    label: "⚠️ Mixed / Operational Friction",
    text: "The wooden cabin and mountain ambiance were lovely, and the homemade dinner was tasty. However, the check-in process was frustrating—nobody answered the phone for over an hour when we arrived in the rain, and there was no hot water in the morning due to a solar heater malfunction.",
  },
  {
    label: "🛑 Critical / Needs Attention",
    text: "We were very disappointed with our stay at this homestay. The room wasn't ready until 4 PM, clean bedsheets had to be requested twice, and night traffic noise from the highway was disruptive. Not worth the price charged per night.",
  },
];

const MAX_CHARS = 2000;

export default function ReviewAnalyzer() {
  const { token } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const [text, setText] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    loadInitialData();
    if (location.state?.sampleText) {
      setText(location.state.sampleText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialData() {
    setLoadingRecent(true);
    try {
      const [propsRes, histRes] = await Promise.all([
        fetchListings().catch(() => ({ data: [] })),
        fetchReviewHistory({ limit: 4 }).catch(() => ({ data: [] })),
      ]);
      setProperties(propsRes.data || []);
      setRecentAnalyses(histRes.data || []);
      if (propsRes.data && propsRes.data.length === 1) {
        setSelectedProperty(propsRes.data[0].id || propsRes.data[0]._id);
      }
    } finally {
      setLoadingRecent(false);
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please input or select a guest review message to evaluate.");
      return;
    }
    if (text.length > MAX_CHARS) {
      setError(`Review content exceeds maximum limit of ${MAX_CHARS} characters.`);
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeReview(text.trim(), token, selectedProperty || undefined);
      setResult(res.data);
      toast("AI Evaluation Complete & Saved to History!", { type: "success" });
      loadInitialData();
    } catch (err) {
      const msg = err.message || "Failed to analyze review via Gemini AI.";
      setError(msg);
      toast(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBookmark(id) {
    try {
      const res = await toggleBookmark(id);
      if (result && (result.id === id || result._id === id)) {
        setResult((prev) => ({ ...prev, isBookmarked: res.data.isBookmarked }));
      }
      toast(res.data.isBookmarked ? "Saved to Bookmarked reports!" : "Removed from bookmarks", {
        type: "info",
      });
      loadInitialData();
    } catch {
      toast("Failed to update bookmark status.", { type: "error" });
    }
  }

  function handleDownloadJson() {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `homestay_ai_review_${result._id || "report"}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast("Downloaded evaluation report as JSON.", { type: "success" });
  }

  const charCount = text.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header section */}
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          AI Guest Review Analyzer
        </h1>
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          Paste actual guest testimonials, OTA reviews (Airbnb, Booking.com), or feedback forms. Gemini AI will extract sentiments, operational themes, confidence ratings, and generate polite host responses.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Glassmorphic Input Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)]">
            <form onSubmit={handleAnalyze} className="flex flex-col gap-5">
              {/* Property Association Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Associate with Homestay (Optional)
                </label>
                <select
                  aria-label="Associate review with a homestay"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300/80 bg-white/60 px-4 py-3 text-sm font-medium text-stone-800 shadow-sm backdrop-blur-md focus:border-brand-500 focus:bg-white focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-stone-200 dark:focus:border-brand-500"
                >
                  <option value="">— Unassigned (General Portfolio Feedback) —</option>
                  {properties.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      🏡 {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Guest Review Feedback *
                  </label>
                  <span className={`text-[11px] font-mono ${charCount > MAX_CHARS ? "text-red-500 font-bold" : "text-stone-400"}`}>
                    {charCount}/{MAX_CHARS} chars
                  </span>
                </div>
                <textarea
                  rows={7}
                  placeholder="Paste guest review feedback here, or choose one of the quick sample evaluations below..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-2xl border border-stone-300/80 bg-white/50 p-4 text-sm text-stone-900 leading-relaxed placeholder-stone-400 shadow-inner backdrop-blur-md focus:border-brand-500 focus:bg-white focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.02] dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-brand-500"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setText("")} disabled={!text || loading} className="backdrop-blur-md">
                  Clear Form
                </Button>
                <Button type="submit" size="lg" disabled={loading || !text.trim() || charCount > MAX_CHARS} className="shadow-lg shadow-brand-500/20 px-8">
                  {loading ? <Loader size="sm" label="Evaluating with Gemini…" /> : "✨ Evaluate & Extract Insights"}
                </Button>
              </div>
            </form>

            {/* Quick Sample Selector with Clean Boundaries */}
            <div className="mt-8 border-t border-stone-200/70 pt-6 dark:border-white/[0.08]">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3.5">
                Or Test With Typical Guest Feedback Scenarios:
              </p>
              <div className="flex flex-col gap-3">
                {SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setText(s.text);
                      setError("");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-stone-200/70 bg-white/50 px-4 py-3.5 text-left backdrop-blur-md transition hover:border-brand-500/50 hover:bg-white hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.18] dark:hover:bg-white/[0.05]"
                  >
                    <div className="pr-3">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        {s.label}
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-normal">
                        {s.text}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 shrink-0">
                      Use →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Results & Live Activity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-white/70 p-12 text-center shadow-md backdrop-blur-xl dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl min-h-[420px]">
              <div className="h-16 w-16 animate-bounce text-5xl mb-4">🔮</div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Analyzing Sentiment Architecture...
              </h3>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed">
                Running natural language processing via Google Gemini to categorize operational keywords, sentiment weighting, and drafting polite host correspondence.
              </p>
            </div>
          ) : result ? (
            <div className="rounded-3xl border border-brand-500/40 bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-brand-500/30 dark:bg-stone-900/60 dark:backdrop-blur-2xl animate-fade-in transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📊</span>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white">
                    Evaluation Report
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(result.id || result._id)}
                    className="rounded-xl border border-stone-200/80 bg-white/60 p-2 text-stone-400 backdrop-blur-md hover:bg-white hover:text-amber-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:text-amber-400 transition"
                    title="Bookmark Evaluation"
                  >
                    {result.isBookmarked ? "⭐" : "☆"}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="rounded-xl border border-stone-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-stone-700 backdrop-blur-md hover:bg-white dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.08] transition"
                    title="Export JSON"
                  >
                    💾 Export JSON
                  </button>
                </div>
              </div>

              {/* Sentiment Pill */}
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-stone-200/70 bg-white/50 p-4.5 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Predicted Sentiment
                  </p>
                  <div className="mt-1.5">
                    <Badge variant={result.sentiment} confidence={result.confidenceScore} className="text-xs px-3 py-1 shadow-sm" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Confidence Rating
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-stone-900 dark:text-white">
                    {result.confidenceScore ? `${Math.round(result.confidenceScore * 100)}%` : "N/A"}
                  </p>
                </div>
              </div>

              {/* Identified Themes */}
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Key Operational Topics
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {(result.themes || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-stone-200/80 bg-stone-100/80 px-3 py-1 text-xs font-semibold text-stone-700 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-stone-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Executive Summary */}
              {result.summary && (
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Executive Summary
                  </p>
                  <p className="mt-2 rounded-2xl border border-stone-200/70 bg-white/50 p-4 text-xs text-stone-700 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-stone-300 leading-relaxed font-normal">
                    {result.summary}
                  </p>
                </div>
              )}

              {/* Suggested Host Response */}
              {result.suggestedReply && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      💡 AI Suggested Host Response
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.suggestedReply);
                        toast("Suggested reply copied to clipboard!", { type: "success" });
                      }}
                      className="text-[11px] font-extrabold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition"
                    >
                      📋 Copy Reply
                    </button>
                  </div>
                  <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-xs italic text-stone-800 backdrop-blur-md dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-stone-200 leading-relaxed">
                    &ldquo;{result.suggestedReply}&rdquo;
                  </div>
                </div>
              )}

              <div className="mt-7 flex items-center justify-between border-t border-stone-200/70 pt-4 dark:border-white/[0.08]">
                <Link
                  to={`/reviews/${result.id || result._id}`}
                  className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Full Detailed View →
                </Link>
                <Link
                  to="/history"
                  className="text-xs font-semibold text-stone-500 hover:underline dark:text-stone-400"
                >
                  View Archive ({recentAnalyses.length}) →
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)] flex flex-col justify-between min-h-[440px]">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  Recent Evaluations ({recentAnalyses.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Your recently persisted AI review assessments
                </p>

                <div className="mt-5">
                  {loadingRecent ? (
                    <div className="py-16 flex justify-center">
                      <Loader size="md" label="Loading recent analyses..." />
                    </div>
                  ) : recentAnalyses.length === 0 ? (
                    <div className="py-20 text-center">
                      <span className="text-4xl opacity-60">📭</span>
                      <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                        No evaluations recorded yet
                      </p>
                      <p className="mt-1.5 text-xs text-stone-400 max-w-[250px] mx-auto leading-relaxed">
                        Paste review text or pick a sample feedback option to generate your first AI evaluation report.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {recentAnalyses.map((rev) => (
                        <Link
                          key={rev._id || rev.id}
                          to={`/reviews/${rev._id || rev.id}`}
                          className="block rounded-2xl border border-stone-200/70 bg-white/50 p-4 backdrop-blur-md transition hover:border-brand-500/40 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.05]"
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={rev.sentiment}
                              confidence={rev.confidenceScore}
                              className="text-[10px] px-2.5 py-0.5"
                            />
                            <span className="text-[11px] font-mono text-stone-400">
                              {rev.confidenceScore ? `${Math.round(rev.confidenceScore * 100)}%` : ""}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-stone-700 dark:text-stone-300 font-normal leading-relaxed">
                            &ldquo;{rev.reviewText}&rdquo;
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-7 border-t border-stone-200/70 pt-4 text-center dark:border-white/[0.08]">
                <Link
                  to="/history"
                  className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Open Complete Review History →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
