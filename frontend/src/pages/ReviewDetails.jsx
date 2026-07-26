import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Loader, useToast, Badge, ConfirmDialog } from "../components/ui";
import Card from "../components/Card";
import { fetchReviewById, deleteReview, toggleBookmark } from "../api/reviewApi";

export default function ReviewDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    loadReviewDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadReviewDetails() {
    setLoading(true);
    try {
      const res = await fetchReviewById(id);
      setReview(res.data || null);
    } catch (err) {
      toast(err.message || "Failed to load review details.", { type: "error" });
      navigate("/history", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBookmark() {
    if (!review) return;
    setBookmarking(true);
    try {
      const res = await toggleBookmark(review.id || review._id);
      setReview((prev) => ({ ...prev, bookmarked: res.data.bookmarked }));
      toast(res.data.bookmarked ? "Bookmarked!" : "Bookmark removed.", {
        type: "success",
      });
    } catch (err) {
      toast(err.message || "Bookmark action failed.", { type: "error" });
    } finally {
      setBookmarking(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteReview(review.id || review._id);
      toast("Review record deleted.", { type: "success" });
      navigate("/history");
    } catch (err) {
      toast(err.message || "Delete failed.", { type: "error" });
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  async function copyResponse() {
    if (!review?.suggestedResponse) return;
    try {
      await navigator.clipboard.writeText(review.suggestedResponse);
      toast("Suggested host reply copied to clipboard!", { type: "success" });
    } catch {
      toast("Copy failed.", { type: "error" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-36">
        <Loader size="lg" label="Loading AI analysis report…" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="mx-auto max-w-2xl text-center py-20">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">
          Review Record Not Found
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          The requested AI analysis report does not exist or was removed.
        </p>
        <Link to="/history" className="mt-6 inline-block">
          <Button>← Return to Review History</Button>
        </Link>
      </div>
    );
  }

  const sent = review.sentiment || "neutral";
  const conf = Math.round((review.confidence || 0) * 100);
  const propertyName = review.listing?.title || "General Evaluation (No Property Specified)";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Navigation header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-700">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-brand-600 dark:text-stone-400 dark:hover:text-brand-400 transition-colors"
        >
          <span>←</span> Back to Review Archives
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBookmark}
            disabled={bookmarking}
          >
            {review.bookmarked ? "🔖 Bookmarked" : "☆ Bookmark"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
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
            className="text-sm px-3 py-1"
          >
            {sent} Sentiment ({conf}% Confidence)
          </Badge>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Recorded on {new Date(review.analyzedAt || review.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
          AI Evaluation Report for {propertyName}
        </h1>
      </div>

      {/* Main content sections */}
      <div className="mt-8 space-y-6">
        {/* Original Review Text */}
        <Card className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Original Guest Feedback
          </h2>
          <p className="mt-3 text-base italic leading-relaxed text-stone-800 dark:text-stone-200 bg-stone-50 p-4 rounded-xl border border-stone-200/60 dark:bg-stone-900 dark:border-stone-800">
            "{review.reviewText}"
          </p>
        </Card>

        {/* Identified Themes */}
        <Card className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Extracted Operational Themes
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {review.themes && review.themes.length > 0 ? (
              review.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 border border-brand-200/70 dark:bg-brand-950/50 dark:text-brand-200 dark:border-brand-800/70"
                >
                  🏷️ {theme}
                </span>
              ))
            ) : (
              <span className="text-xs text-stone-400">No specific themes identified.</span>
            )}
          </div>
        </Card>

        {/* Executive Summary */}
        <Card className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Executive Summary & AI Diagnosis
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            {review.summary || "No summary recorded."}
          </p>
        </Card>

        {/* Suggested Response */}
        <Card className="p-6 border-brand-200/80 dark:border-brand-800/80 bg-gradient-to-br from-brand-50/20 to-transparent dark:from-brand-950/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Ready-to-Send Host Reply
            </h2>
            <Button size="sm" onClick={copyResponse} className="!py-1 !px-3 !text-xs">
              📋 Copy Host Reply
            </Button>
          </div>
          <div className="mt-3 rounded-xl border border-stone-200/80 bg-white p-4 text-sm leading-relaxed text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
            <p className="whitespace-pre-wrap">{review.suggestedResponse || "No suggested response generated."}</p>
          </div>
        </Card>
      </div>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Evaluation Record"
        message="Are you certain you wish to permanently delete this AI review analysis from your archive?"
        confirmLabel="Yes, Delete"
        loading={deleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
