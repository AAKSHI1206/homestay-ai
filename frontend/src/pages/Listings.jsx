import { useEffect, useState } from "react";
import { Button, Input, Loader, useToast } from "../components/ui";
import { fetchListings, searchListings, deleteListing } from "../api/listingsApi";

export default function Listings() {
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // ── Initial fetch ────────────────────────────────────────────
  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const res = await fetchListings();
      setListings(res.data);
    } catch (err) {
      toast(err.message || "Failed to load listings.", { type: "error" });
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
      setListings(res.data);
      if (res.data.length === 0) {
        toast("No listings match your search.", { type: "info" });
      }
    } catch (err) {
      toast(err.message || "Search failed.", { type: "error" });
    } finally {
      setSearching(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
            Browse Listings
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {loading ? "Loading…" : `${listings.length} properties available`}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-end gap-2">
          <Input
            placeholder="Search by keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!w-56"
          />
          <Button type="submit" size="sm" disabled={searching}>
            {searching ? <Loader size="sm" label="Searching" /> : "Search"}
          </Button>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                loadListings();
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Listings grid */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" label="Loading listings" />
          </div>
        ) : listings.length === 0 ? (
          <p className="py-16 text-center text-stone-500 dark:text-stone-400">
            No listings found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-lg dark:border-stone-700 dark:bg-stone-800"
              >
                {/* Image */}
                <div className="aspect-[3/2] w-full overflow-hidden bg-stone-100 dark:bg-stone-700">
                  <img
                    src={
                      listing.images?.[0] ||
                      `https://picsum.photos/seed/${listing.id}/600/400`
                    }
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
                      {listing.title}
                    </h2>
                    {listing.featured && (
                      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {listing.location}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-stone-600 dark:text-stone-300">
                    {listing.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <span>{listing.guests} guests</span>
                    <span>{listing.bedrooms} bd</span>
                    <span>{listing.bathrooms} ba</span>
                    {listing.rating > 0 && (
                      <span className="ml-auto font-medium text-stone-700 dark:text-stone-200">
                        ★ {listing.rating}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-700">
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">
                      ₹{listing.pricePerNight.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                        {" "}
                        / night
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(listing.id, listing.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
