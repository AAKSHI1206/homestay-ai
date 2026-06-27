import { useState } from "react";
import { Button, Input, Modal, Loader, useToast } from "../components/ui";

const STATS = [
  { label: "Active Listings", value: "12" },
  { label: "Bookings this month", value: "34" },
  { label: "Occupancy rate", value: "78%" },
  { label: "Pending requests", value: "3" },
];

const BOOKINGS = [
  { guest: "Riya Sharma", stay: "Pine Cottage, Mussoorie", dates: "12–15 Jul", status: "Confirmed" },
  { guest: "James Carter", stay: "Valley View Homestay, Nainital", dates: "18–20 Jul", status: "Pending" },
  { guest: "Ananya Verma", stay: "Riverside Stay, Rishikesh", dates: "22–25 Jul", status: "Confirmed" },
];

export default function Dashboard() {
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listingName, setListingName] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  const [messageEmail, setMessageEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [bookingsLoading, setBookingsLoading] = useState(false);

  function handleSaveListing() {
    if (!listingPrice || Number(listingPrice) <= 0) {
      setPriceError("Enter a price greater than 0.");
      return;
    }
    setPriceError("");
    setIsModalOpen(false);
    toast(`"${listingName || "New listing"}" was added.`, { type: "success" });
    setListingName("");
    setListingPrice("");
  }

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

  function simulateRefresh() {
    setBookingsLoading(true);
    toast("Refreshing bookings…", { type: "info", duration: 1500 });
    setTimeout(() => setBookingsLoading(false), 1500);
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
        {STATS.map((stat) => (
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
        {/* Recent bookings */}
        <section className="lg:col-span-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
              Recent Bookings
            </h2>
            <Button variant="outline" size="sm" onClick={simulateRefresh}>
              {bookingsLoading ? <Loader size="sm" label="Refreshing" /> : "Refresh"}
            </Button>
          </div>

          <div className="mt-4">
            {bookingsLoading ? (
              <Loader variant="skeleton" lines={4} />
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-700">
                {BOOKINGS.map((b) => (
                  <li
                    key={b.guest}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">
                        {b.guest}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {b.stay} · {b.dates}
                      </p>
                    </div>
                    <span
                      className={[
                        "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
                        b.status === "Confirmed"
                          ? "bg-pine-100 text-pine-700 dark:bg-pine-700/30 dark:text-pine-100"
                          : "bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100",
                      ].join(" ")}
                    >
                      {b.status}
                    </span>
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
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSendMessage}>
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
          <Button variant="primary" size="sm">Primary sm</Button>
          <Button variant="primary" size="md">Primary md</Button>
          <Button variant="primary" size="lg">Primary lg</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Toast — notification types
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => toast("Listing saved.", { type: "success" })}>
            Success
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast("Booking request received.", { type: "info" })}>
            Info
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast("Low availability this weekend.", { type: "warning" })}>
            Warning
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast("Couldn't update listing.", { type: "error" })}>
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
            <Button onClick={handleSaveListing}>Save listing</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
