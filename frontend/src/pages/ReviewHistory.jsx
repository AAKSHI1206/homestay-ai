import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Loader,
  useToast,
  Badge,
  EmptyState,
  ConfirmDialog,
} from "../components/ui";
import Card from "../components/Card";
import { fetchReviewHistory, deleteReview, toggleBookmark } from "../api/reviewApi";

export default function ReviewHistory() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Query & Pagination State ──────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Confirm Delete State ──────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    loading: false,
  });

  useEffect(() => {
    loadHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentimentFilter, bookmarkedOnly]);

  async function loadHistory(pageNumber = 1, searchKeyword = search) {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: 8,
        sentiment: sentimentFilter || undefined,
        bookmarked: bookmarkedOnly ? "true" : undefined,
        search: searchKeyword.trim() || undefined,
      };
      const res = await fetchReviewHistory(params);
      setReviews(res.data || []);
      setPage(res.page || pageNumber);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      toast(err.message || "Failed to load review history.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadHistory(1, search);
  }

  // ── Bookmark Toggle ───────────────────────────────────────
  async function handleBookmark(id, e) {
    e.stopPropagation();
    try {
      const res = await toggleBookmark(id);
      setReviews((prev) =>
        prev.map((r) => ((r.id || r._id) === id ? { ...r, bookmarked: res.data.bookmarked } : r))
      );
      toast(res.data.bookmarked ? "Bookmarked!" : "Removed from bookmarks.", {
        type: "success",
        duration: 1500,
      });
    } catch (err) {
      toast(err.message || "Could not update bookmark.", { type: "error" });
    }
  }

  // ── Delete confirm flow ───────────────────────────────────
  function promptDelete(id, e) {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, id, loading: false });
  }

  async function handleConfirmDelete() {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteReview(deleteDialog.id);
      setReviews((prev) => prev.filter((r) => (r.id || r._id) !== deleteDialog.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast("Review record deleted.", { type: "success" });
      setDeleteDialog({ isOpen: false, id: null, loading: false });
    } catch (err) {
      toast(err.message || "Delete failed.", { type: "error" });
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Top Bar / Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            Review History & Archive
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {loading
              ? "Fetching archives…"
              : `Showing ${totalCount} recorded AI sentiment evaluation${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link to="/reviews">
          <Button className="shrink-0 shadow-sm">✨ Analyze New Review</Button>
        </Link>
      </div>

      {/* Glassmorphic Filter Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-stone-200/80 bg-white/70 p-5 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.3)] md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 max-w-md">
          <Input
            placeholder="Search feedback text, theme, summary…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                loadHistory(1, "");
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Sentiment tabs & bookmark switch */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter reviews by sentiment"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="negative">Negative Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="mixed">Mixed Only</option>
          </select>

          <button
            type="button"
            onClick={() => setBookmarkedOnly((prev) => !prev)}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              bookmarkedOnly
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
                : "border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
            ].join(" ")}
          >
            <span>🔖</span> {bookmarkedOnly ? "Bookmarked Only" : "Filter Bookmarked"}
          </button>
        </div>
      </div>

      {/* Review List Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size="lg" label="Loading analysis archives…" />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon="📋"
            title={
              search || sentimentFilter || bookmarkedOnly
                ? "No review records match your filters"
                : "No saved review analyses yet"
            }
            description={
              search || sentimentFilter || bookmarkedOnly
                ? "Try clearing your search keyword or relaxing your sentiment filters."
                : "Any guest reviews you analyze will automatically be saved here for easy auditing."
            }
            action={
              search || sentimentFilter || bookmarkedOnly ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSentimentFilter("");
                    setBookmarkedOnly(false);
                  }}
                >
                  Reset All Filters
                </Button>
              ) : (
                <Link to="/reviews">
                  <Button>Launch AI Analyzer</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const rid = rev.id || rev._id;
              const sent = rev.sentiment || "neutral";
              const conf = Math.round((rev.confidence || 0) * 100);
              const propertyName = rev.listing?.title || "General Evaluation";

              return (
                <Card
                  key={rid}
                  variant="stat"
                  onClick={() => navigate(`/reviews/${rid}`)}
                  className="p-5 transition-all hover:translate-x-0.5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            sent === "positive"
                              ? "positive"
                              : sent === "negative"
                                ? "negative"
                                : sent === "mixed"
                                  ? "mixed"
                                  : "neutral"
                          }
                        >
                          {sent} ({conf}%)
                        </Badge>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          🏡 {propertyName}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          · {new Date(rev.analyzedAt || rev.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="mt-2 text-sm italic text-stone-800 dark:text-stone-200 line-clamp-2">
                        "{rev.reviewText}"
                      </p>

                      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                        <strong className="text-stone-700 dark:text-stone-300 font-semibold">
                          Summary:{" "}
                        </strong>
                        {rev.summary || "No executive summary available."}
                      </p>

                      {/* Themes chips */}
                      {rev.themes && rev.themes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {rev.themes.map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions side */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleBookmark(rid, e)}
                          title={rev.bookmarked ? "Remove bookmark" : "Add bookmark"}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-brand-500 dark:hover:bg-stone-700 transition-colors"
                        >
                          <span className="text-base">{rev.bookmarked ? "🔖" : "☆"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => promptDelete(rid, e)}
                          title="Delete record"
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                        >
                          <span className="text-base">🗑️</span>
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                        View Full Report →
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-700">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Page <span className="font-bold text-stone-700 dark:text-stone-200">{page}</span> of{" "}
              <span className="font-bold text-stone-700 dark:text-stone-200">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => loadHistory(page - 1)}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => loadHistory(page + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Archived Review"
        message="Are you sure you want to delete this AI analysis record? This action will permanently remove it from your history and statistics."
        confirmLabel="Delete Record"
        loading={deleteDialog.loading}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, loading: false })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
