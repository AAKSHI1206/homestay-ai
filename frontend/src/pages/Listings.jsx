import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Modal,
  Loader,
  useToast,
  Badge,
  EmptyState,
  ConfirmDialog,
} from "../components/ui";
import {
  fetchListings,
  searchListings,
  createListing,
  updateListing,
  deleteListing,
} from "../api/listingsApi";

export default function Listings() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Main State ───────────────────────────────────────────────
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // ── Modal State (Create / Edit) ──────────────────────────────
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | null
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    pricePerNight: "",
    description: "",
    guests: "2",
    bedrooms: "1",
    bathrooms: "1",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Delete Confirm Dialog State ──────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    id: null,
    title: "",
    loading: false,
  });

  // ── Initial fetch ────────────────────────────────────────────
  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const res = await fetchListings();
      setListings(res.data || []);
    } catch (err) {
      toast(err.message || "Failed to load homestays.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // ── Search ───────────────────────────────────────────────────
  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadListings();
      return;
    }
    setSearching(true);
    try {
      const res = await searchListings({ q: searchQuery.trim() });
      setListings(res.data || []);
      if ((res.data || []).length === 0) {
        toast("No properties match your keyword.", { type: "info" });
      }
    } catch (err) {
      toast(err.message || "Search failed.", { type: "error" });
    } finally {
      setSearching(false);
    }
  }

  // ── Open Create / Edit Modal ─────────────────────────────────
  function openCreateModal() {
    setSelectedId(null);
    setFormData({
      title: "",
      location: "",
      pricePerNight: "",
      description: "",
      guests: "2",
      bedrooms: "1",
      bathrooms: "1",
    });
    setFormError("");
    setModalMode("create");
  }

  function openEditModal(listing) {
    setSelectedId(listing.id || listing._id);
    setFormData({
      title: listing.title || "",
      location: listing.location || "",
      pricePerNight: String(listing.pricePerNight || ""),
      description: listing.description || "",
      guests: String(listing.guests || 2),
      bedrooms: String(listing.bedrooms || 1),
      bathrooms: String(listing.bathrooms || 1),
    });
    setFormError("");
    setModalMode("edit");
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmitModal(e) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim()) {
      setFormError("Title and Location are required.");
      return;
    }
    const price = Number(formData.pricePerNight);
    if (isNaN(price) || price <= 0) {
      setFormError("Price per night must be greater than zero.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      pricePerNight: price,
      guests: Number(formData.guests) || 1,
      bedrooms: Number(formData.bedrooms) || 1,
      bathrooms: Number(formData.bathrooms) || 1,
    };

    try {
      if (modalMode === "create") {
        const res = await createListing(payload);
        setListings((prev) => [res.data, ...prev]);
        toast(`"${res.data.title}" created successfully!`, { type: "success" });
      } else {
        const res = await updateListing(selectedId, payload);
        setListings((prev) =>
          prev.map((l) =>
            (l.id || l._id) === selectedId ? { ...l, ...res.data } : l
          )
        );
        toast(`Property updated successfully!`, { type: "success" });
      }
      setModalMode(null);
    } catch (err) {
      toast(err.message || "Operation failed.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete Flow ──────────────────────────────────────────────
  function promptDelete(id, title) {
    setDeleteDialog({ isOpen: true, id, title, loading: false });
  }

  async function handleConfirmDelete() {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteListing(deleteDialog.id);
      setListings((prev) => prev.filter((l) => (l.id || l._id) !== deleteDialog.id));
      toast(`"${deleteDialog.title}" has been deleted.`, { type: "success" });
      setDeleteDialog({ isOpen: false, id: null, title: "", loading: false });
    } catch (err) {
      toast(err.message || "Delete failed.", { type: "error" });
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  }

  // ── Toggle Featured ──────────────────────────────────────────
  async function handleToggleFeatured(listing) {
    const id = listing.id || listing._id;
    try {
      const res = await updateListing(id, { featured: !listing.featured });
      setListings((prev) =>
        prev.map((l) => ((l.id || l._id) === id ? res.data : l))
      );
      toast(`"${listing.title}" status updated.`, { type: "success" });
    } catch (err) {
      toast(err.message || "Update failed.", { type: "error" });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Top Bar / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            My Homestays
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {loading
              ? "Fetching your properties…"
              : `Managing ${listings.length} homestay listing${
                  listings.length === 1 ? "" : "s"
                } in your portfolio`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder="Search properties, location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!w-52 sm:!w-64"
            />
            <Button type="submit" size="sm" disabled={searching}>
              {searching ? <Loader size="sm" label="Go" /> : "Search"}
            </Button>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  loadListings();
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <Button onClick={openCreateModal} className="shrink-0">
            + Add Homestay
          </Button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size="lg" label="Loading homestays" />
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon="🏡"
            title={
              searchQuery
                ? `No properties found matching "${searchQuery}"`
                : "No homestays created yet"
            }
            description={
              searchQuery
                ? "Try searching for a different keyword or location."
                : "Add your very first homestay to manage bookings, reviews, and AI insights."
            }
            action={
              searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    loadListings();
                  }}
                >
                  Clear Search
                </Button>
              ) : (
                <Button onClick={openCreateModal}>+ Create First Homestay</Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const lid = listing.id || listing._id;
              return (
                <article
                  key={lid}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white/80 shadow-sm backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.3)] dark:hover:border-white/[0.18]"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={
                        listing.images?.[0] ||
                        `https://picsum.photos/seed/${lid}/600/400`
                      }
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(listing)}
                        title={listing.featured ? "Unfeature" : "Mark as featured"}
                        className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur transition hover:bg-white dark:bg-stone-900/80 dark:text-stone-200 dark:hover:bg-stone-900"
                      >
                        {listing.featured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-bold text-stone-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors">
                          {listing.title}
                        </h2>
                        <span className="shrink-0 text-right">
                          <p className="text-sm font-bold text-stone-900 dark:text-white">
                            ₹{listing.pricePerNight.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-stone-400">per night</p>
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <span>📍</span> {listing.location}
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {listing.description || "No property description provided."}
                      </p>

                      {/* Property specs badge row */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                          👥 {listing.guests} guests
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                          🛏️ {listing.bedrooms} bed
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                          🚿 {listing.bathrooms} bath
                        </span>
                        {listing.rating > 0 && (
                          <span className="ml-auto flex items-center gap-1 font-semibold text-amber-500">
                            ★ {listing.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-700/80">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/reviews?property=${encodeURIComponent(listing.title)}`)}
                        className="!px-2.5 !py-1 !text-xs font-semibold text-brand-600 border-brand-200 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-700/50 dark:hover:bg-brand-900/30"
                      >
                        ✨ Analyze Reviews
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(listing)}
                          className="!px-2 !py-1 !text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promptDelete(lid, listing.title)}
                          className="!px-2 !py-1 !text-xs text-red-600 border-stone-200 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-stone-700 dark:hover:bg-red-950/40"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "create" ? "Add New Homestay" : "Edit Homestay Details"}
      >
        <form onSubmit={handleSubmitModal} className="flex flex-col gap-3.5">
          {formError && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </div>
          )}
          <Input
            label="Title"
            name="title"
            placeholder="e.g., Riverside Heritage Retreat"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Location"
            name="location"
            placeholder="e.g., Rishikesh, Uttarakhand"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Price per night (₹)"
            name="pricePerNight"
            type="number"
            placeholder="2200"
            value={formData.pricePerNight}
            onChange={handleInputChange}
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide a welcoming overview of the amenities, atmosphere, and surroundings..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Guests"
              name="guests"
              type="number"
              value={formData.guests}
              onChange={handleInputChange}
            />
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleInputChange}
            />
            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-stone-200 pt-3 dark:border-stone-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalMode(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader size="sm" label="Saving..." />
              ) : modalMode === "create" ? (
                "Create Homestay"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Remove Property Listing"
        message={`Are you certain you wish to delete "${deleteDialog.title}"? This property will be permanently removed from your dashboard.`}
        confirmLabel="Remove"
        loading={deleteDialog.loading}
        onClose={() =>
          setDeleteDialog({ isOpen: false, id: null, title: "", loading: false })
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
