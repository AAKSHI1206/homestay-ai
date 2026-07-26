import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Loader,
  useToast,
  EmptyState,
  Badge,
  ConfirmDialog,
} from "../components/ui";
import Card from "../components/Card";
import { fetchListings, deleteListing, createListing } from "../api/listingsApi";
import { fetchReviewHistory, fetchAnalytics } from "../api/reviewApi";

export default function Dashboard() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBedrooms, setNewBedrooms] = useState(1);
  const [newBathrooms, setNewBathrooms] = useState(1);
  const [newMaxGuests, setNewMaxGuests] = useState(2);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [listingsRes, reviewsRes, analyticsRes] = await Promise.all([
        fetchListings().catch(() => ({ data: [] })),
        fetchReviewHistory({ limit: 5 }).catch(() => ({ data: [] })),
        fetchAnalytics().catch(() => ({ data: null })),
      ]);

      setListings(listingsRes.data || []);
      setRecentReviews(reviewsRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      toast(err.message || "Failed to load dashboard data.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteListing(deleteId);
      toast("Homestay removed successfully", { type: "success" });
      setListings((prev) => prev.filter((l) => (l.id || l._id) !== deleteId));
    } catch (err) {
      toast(err.message || "Failed to delete homestay.", { type: "error" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleQuickCreate(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newPrice) {
      toast("Title, location, and price are required.", { type: "error" });
      return;
    }

    setCreating(true);
    try {
      const res = await createListing({
        title: newTitle.trim(),
        location: newLocation.trim(),
        pricePerNight: Number(newPrice),
        description: newDescription.trim() || "A wonderful Himalayan homestay experience with authentic local hospitality.",
        bedrooms: Number(newBedrooms),
        bathrooms: Number(newBathrooms),
        maxGuests: Number(newMaxGuests),
        images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1000"],
        amenities: ["Free Wi-Fi", "Home-cooked meals", "Mountain view", "Hot water"],
        isFeatured: false,
      });

      toast("New homestay created successfully!", { type: "success" });
      setListings((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      resetAddForm();
    } catch (err) {
      toast(err.message || "Failed to create homestay.", { type: "error" });
    } finally {
      setCreating(false);
    }
  }

  function resetAddForm() {
    setNewTitle("");
    setNewLocation("");
    setNewPrice("");
    setNewDescription("");
    setNewBedrooms(1);
    setNewBathrooms(1);
    setNewMaxGuests(2);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader size="lg" label="Loading live host analytics…" />
      </div>
    );
  }

  const featuredCount = listings.filter((l) => l.isFeatured).length;
  const totalReviews = analytics?.totalReviews || 0;
  const posReviews = analytics?.distribution?.positive || 0;
  const avgPrice =
    listings.length > 0
      ? Math.round(
          listings.reduce((acc, l) => acc + (l.price || l.pricePerNight || 0), 0) /
            listings.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Host Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Welcome back! Here is a real-time glassmorphic overview of your homestays and AI analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="backdrop-blur-md">
            🔄 Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="shadow-lg shadow-brand-500/20">
            + Add Listing
          </Button>
        </div>
      </div>

      {/* Glassmorphic KPI Stats Grid with Perfect Boundary Spacing */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="stat" className="flex min-h-[11rem] flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
              My Homestays
            </span>
            <span className="text-xl">🏡</span>
          </div>
          <p className="my-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {listings.length}
          </p>
          <div className="flex items-center justify-between text-xs font-medium text-brand-600 dark:text-brand-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">
            <span>{featuredCount} featured</span>
            <Link to="/listings" className="hover:underline font-semibold text-stone-600 dark:text-stone-300">
              Manage →
            </Link>
          </div>
        </Card>

        <Card variant="stat" className="flex min-h-[11rem] flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
              Analyzed Reviews
            </span>
            <span className="text-xl">📋</span>
          </div>
          <p className="my-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {totalReviews}
          </p>
          <div className="flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">
            <span>Persisted in AI history</span>
            <Link to="/history" className="hover:underline font-semibold text-stone-600 dark:text-stone-300">
              History →
            </Link>
          </div>
        </Card>

        <Card variant="stat" className="flex min-h-[11rem] flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
              Positive Sentiment
            </span>
            <span className="text-xl">☺️</span>
          </div>
          <p className="my-2 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {totalReviews ? `${Math.round((posReviews / totalReviews) * 100)}%` : "—"}
          </p>
          <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">
            <span>{posReviews} positive evaluations</span>
            <Link to="/analytics" className="hover:underline font-semibold text-stone-600 dark:text-stone-300">
              Charts →
            </Link>
          </div>
        </Card>

        <Card variant="stat" className="flex min-h-[11rem] flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
              Avg. Price / Night
            </span>
            <span className="text-xl">💰</span>
          </div>
          <p className="my-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            {avgPrice > 0 ? `₹${avgPrice}` : "—"}
          </p>
          <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">
            <span>Across active listings</span>
            <Link to="/listings" className="hover:underline font-semibold text-stone-600 dark:text-stone-300">
              View →
            </Link>
          </div>
        </Card>
      </div>

      {/* Two-Column Grid: Portfolio vs AI Tools & Activity Feed */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Properties Panel */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 dark:border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  Your Homestays ({listings.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage properties and featured visibility
                </p>
              </div>
              <Link
                to="/listings"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition"
              >
                View All ({listings.length}) →
              </Link>
            </div>

            <div className="mt-6">
              {listings.length === 0 ? (
                <EmptyState
                  icon="🏡"
                  title="No homestays created yet"
                  description="Start building your portfolio by adding your first homestay listing."
                  action={
                    <Button onClick={() => setShowAddModal(true)}>
                      + Add Your First Homestay
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {listings.slice(0, 4).map((listing) => {
                    const id = listing.id || listing._id;
                    const price = listing.price || listing.pricePerNight || 0;
                    const image =
                      listing.images?.[0] ||
                      listing.image ||
                      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800";

                    return (
                      <Card
                        key={id}
                        noPadding={true}
                        className="flex flex-col border border-stone-200/70 bg-white/50 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.16] transition-all hover:shadow-lg"
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                          <img
                            src={image}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                            {listing.isFeatured && (
                              <Badge variant="featured" className="shadow-md backdrop-blur-md">
                                ★ Featured
                              </Badge>
                            )}
                            <span className="rounded-lg bg-stone-900/80 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-md shadow-sm">
                              ₹{price}/night
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <h3 className="font-bold text-stone-900 dark:text-white truncate">
                              {listing.title}
                            </h3>
                            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                              📍 {listing.location}
                            </p>
                            <p className="mt-2.5 line-clamp-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                              {listing.description}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-stone-200/60 pt-3.5 dark:border-white/[0.06] text-xs">
                            <span className="text-stone-500 dark:text-stone-400 font-medium">
                              🛏️ {listing.bedrooms || 1} bed · 🛁 {listing.bathrooms || 1} bath
                            </span>
                            <button
                              onClick={() => setDeleteId(id)}
                              className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                              title="Remove Homestay"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: AI Tools & Feed */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick AI Actions Glass Panel */}
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)]">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Quick AI Actions
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Jump straight into AI productivity tools
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Link to="/reviews" className="block">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-brand-600 hover:to-brand-700 active:scale-[0.99]">
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">✨</span> Analyze New Review
                  </span>
                  <span className="text-white/80 font-normal">→</span>
                </div>
              </Link>
              <Link to="/analytics" className="block">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/60 px-4 py-3.5 text-sm font-semibold text-stone-700 backdrop-blur-md transition hover:border-brand-500/40 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-200 dark:hover:border-white/[0.18] dark:hover:bg-white/[0.06]">
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">📈</span> Sentiment Analytics
                  </span>
                  <span className="text-stone-400">→</span>
                </div>
              </Link>
              <Link to="/history" className="block">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/60 px-4 py-3.5 text-sm font-semibold text-stone-700 backdrop-blur-md transition hover:border-brand-500/40 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-200 dark:hover:border-white/[0.18] dark:hover:bg-white/[0.06]">
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">📋</span> Browse Review History
                  </span>
                  <span className="text-stone-400">→</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent AI Analyses Glass Panel */}
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)] flex-1">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 dark:border-white/[0.08]">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Recent AI Analyses
              </h2>
              <Link
                to="/history"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                All →
              </Link>
            </div>

            <div className="mt-4">
              {recentReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <span className="text-3xl opacity-60">📑</span>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    No analyzed reviews yet. Try running your first feedback evaluation!
                  </p>
                  <Link to="/reviews" className="mt-3.5 inline-block">
                    <span className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-500/20 dark:text-brand-400 transition">
                      Run AI Analyzer →
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentReviews.map((rev) => (
                    <Link
                      key={rev._id || rev.id}
                      to={`/reviews/${rev._id || rev.id}`}
                      className="block rounded-2xl border border-stone-200/60 bg-white/50 p-4 backdrop-blur-md transition hover:border-brand-400 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.15] dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={rev.sentiment}
                          confidence={rev.confidenceScore}
                          className="text-[10px] px-2 py-0.5"
                        />
                        <span className="text-[11px] text-stone-400 font-mono">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-stone-700 dark:text-stone-300 font-normal leading-relaxed">
                        &ldquo;{rev.reviewText}&rdquo;
                      </p>
                      {rev.property && (
                        <p className="mt-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                          🏡 {rev.property.title || "Homestay"}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Homestay?"
        message="Are you sure you want to remove this property from your portfolio? This action cannot be undone."
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Quick Add Homestay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border border-stone-200/80 bg-white p-7 shadow-2xl dark:border-white/[0.12] dark:bg-stone-900/95 dark:backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-3.5 dark:border-white/[0.08]">
              <h3 id="modal-title" className="text-lg font-bold text-stone-900 dark:text-white">
                Add New Homestay
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickCreate} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Property Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Himalayan Pine Valley Lodge"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-800 focus:border-brand-500 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Location / City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manali, Himachal Pradesh"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-800 focus:border-brand-500 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Price / Night (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-800 focus:border-brand-500 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the peaceful atmosphere, scenic views, and traditional warm hospitality..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-800 focus:border-brand-500 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white dark:focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBedrooms}
                    onChange={(e) => setNewBedrooms(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBathrooms}
                    onChange={(e) => setNewBathrooms(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxGuests}
                    onChange={(e) => setNewMaxGuests(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 dark:border-white/[0.1] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-stone-200/70 pt-4 dark:border-white/[0.08]">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={creating} className="px-6">
                  {creating ? <Loader size="sm" label="Creating..." /> : "Create Homestay"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
