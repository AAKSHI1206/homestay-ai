import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Sidebar
 * ───────
 * Responsive sidebar navigation for authenticated pages.
 *
 * Desktop: permanent sidebar on the left.
 * Mobile: overlay drawer toggled by the parent (via isOpen/onClose).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the mobile drawer is open.
 * @param {() => void} props.onClose - Closes the mobile drawer.
 */

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/listings", label: "My Homestays", icon: "🏡" },
  { to: "/reviews", label: "Review Analyzer", icon: "✨" },
  { to: "/history", label: "Review History", icon: "📋" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const navContent = (
    <div className="flex h-full flex-col">
      {/* User info */}
      <div className="border-b border-stone-200 px-4 py-5 dark:border-stone-700">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-200">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
              {user?.name || "Guest"}
            </p>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="text-base">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-200 px-4 py-3 dark:border-stone-700">
        <p className="text-[10px] text-stone-400 dark:text-stone-500">
          HomestayAI v1.0 · Week 8
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-stone-900 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Mobile navigation"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          aria-label="Close sidebar"
        >
          ✕
        </button>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-r lg:border-stone-200 lg:bg-white dark:lg:border-stone-700 dark:lg:bg-stone-900"
        aria-label="Desktop navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
