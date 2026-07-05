import { useEffect, useState } from "react";
import { Button, Input, Modal, Loader, useToast } from "../components/ui";
import {
  fetchListings,
  createListing,
  deleteListing,
  updateListing,
} from "../api/listingsApi";

export default function Dashboard() {
  const { toast } = useToast();

  // ── API-driven state ──────────────────────────────────────
  const [listings, setListings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // ── Add-listing modal ─────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listingName, setListingName] = useState("");
  const [listingLocation, setListingLocation] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingDesc, setListingDesc] = useState("");
  const [priceError, setPriceError] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Message form (unchanged from Week 3) ──────────────────
  const [messageEmail, setMessageEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // ── Refresh animation ─────────────────────────────────────
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // ── Fetch listings on mount ───────────────────────────────
  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadListings() {
    setPageLoading(true);
    try {
      const res = await fetchListings();
      setListings(res.data);
    } catch (err) {
      toast(err.message || "Failed to load listings.", { type: "error" });
    } finally {
      setPageLoading(false);
    }
  }

  // ── Computed stats (derived from API data) ────────────────
  const stats = [
    { label: "Active Listings", value: String(listings.length) },
    {
      label: "Featured",
      value: String(listings.filter((l) => l.featured).length),
    },
    {
      label: "Avg. Price / Night",
      value:
        listings.length > 0
          ? `₹${Math.round(listings.reduce((s, l) => s + l.pricePerNight, 0) / listings.length).toLocaleString("en-IN")}`
          : "—",
    },
    {
      label: "Total Reviews",
      value: String(
        listings.reduce((s, l) => s + (l.reviewCount || 0), 0)
      ),
    },
  ];

  // ── Create listing ────────────────────────────────────────
  async function handleSaveListing() {
    if (!listingPrice || Number(listingPrice) <= 0) {
      setPriceError("Enter a price greater than 0.");
      return;
    }
    setPriceError("");
    setSaving(true);

    try {
      const res = await createListing({
        title: listingName.trim() || "New listing",
        location: listingLocation.trim() || "Unknown",
        description: listingDesc.trim(),
        pricePerNight: Number(listingPrice),
      });
      setListings((prev) => [...prev, res.data]);
      toast(`"${res.data.title}" was added.`, { type: "success" });
      setIsModalOpen(false);
      setListingName("");
      setListingLocation("");
      setListingPrice("");
      setListingDesc("");
    } catch (err) {
      toast(err.message || "Failed to create listing.", { type: "error" });
    } finally {
      setSaving(false);
    }
  }

  // ── Delete listing ────────────────────────────────────────
  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast(`"${title}" deleted.`, { type: "success" });
    } catch (err) {
      toast(err.message || "Delete failed.", { type: "error" });
    }
  }

  // ── Toggle featured ───────────────────────────────────────
  async function handleToggleFeatured(listing) {
    try {
      const res = await updateListing(listing.id, {
        featured: !listing.featured,
      });
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? res.data : l))
      );
      toast(
        `"${listing.title}" ${res.data.featured ? "featured" : "unfeatured"}.`,
        { type: "success" }
      );
    } catch (err) {
      toast(err.message || "Update failed.", { type: "error" });
    }
  }

  // ── Send message (unchanged from Week 3) ──────────────────
  function handleSendMessage(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(messageEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    toast("Message sent to guest.", { type: "success" });
    setMessageEmail("");
  }

  // ── Refresh animation (simulated — keeps Week 3 behaviour)
  function simulateRefresh() {
    setBookingsLoading(true);
    toast("Refreshing bookings…", { type: "info", duration: 1500 });
    setTimeout(() => setBookingsLoading(false), 1500);
  }

  // ── Full-page loader ──────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size="lg" label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
            Host Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            A quick look at your homestay listings and bookings.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Listing</Button>
      </div>

      {/* Stats grid — 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Listings table */}
        <section className="lg:col-span-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
              Your Listings
            </h2>
            <Button variant="outline" size="sm" onClick={simulateRefresh}>
              {bookingsLoading ? (
                <Loader size="sm" label="Refreshing" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          <div className="mt-4">
            {bookingsLoading ? (
              <Loader variant="skeleton" lines={4} />
            ) : listings.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                No listings yet. Click &quot;+ Add Listing&quot; to create one.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-700">
                {listings.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900 dark:text-white">
                        {l.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {l.location} · ₹
                        {l.pricePerNight.toLocaleString("en-IN")}/night
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(l)}
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          l.featured
                            ? "bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200"
                            : "bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400",
                        ].join(" ")}
                      >
                        {l.featured ? "★ Featured" : "☆ Feature"}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(l.id, l.title)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Quick message form */}
        <section className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5">
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">
            Message a Guest
          </h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={handleSendMessage}
          >
            <Input
              label="Guest email"
              type="email"
              placeholder="guest@example.com"
              value={messageEmail}
              onChange={(e) => setMessageEmail(e.target.value)}
              error={emailError}
              required
            />
            <Button type="submit" className="w-full">
              Send message
            </Button>
          </form>
        </section>
      </div>

      {/* Component showcase: button variants/sizes + toast triggers */}
      <section className="mt-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">
          Component Showcase
        </h2>

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Button — variants &amp; sizes
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm">
            Primary sm
          </Button>
          <Button variant="primary" size="md">
            Primary md
          </Button>
          <Button variant="primary" size="lg">
            Primary lg
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Toast — notification types
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => toast("Listing saved.", { type: "success" })}
          >
            Success
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast("Booking request received.", { type: "info" })
            }
          >
            Info
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              toast("Low availability this weekend.", { type: "warning" })
            }
          >
            Warning
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast("Couldn't update listing.", { type: "error" })
            }
          >
            Error
          </Button>
        </div>
      </section>

      {/* Add Listing modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add a new listing"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Listing name"
            placeholder="e.g. Pine Cottage, Mussoorie"
            value={listingName}
            onChange={(e) => setListingName(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="e.g. Manali, Himachal Pradesh"
            value={listingLocation}
            onChange={(e) => setListingLocation(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="A brief description of the property"
            value={listingDesc}
            onChange={(e) => setListingDesc(e.target.value)}
          />
          <Input
            label="Price per night (₹)"
            type="number"
            placeholder="2500"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            error={priceError}
            required
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveListing} disabled={saving}>
              {saving ? (
                <Loader size="sm" label="Saving" />
              ) : (
                "Save listing"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
