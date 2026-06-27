import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

/**
 * Navbar
 * ------
 * App-level navigation bar. Hosts the route links and the dark/light mode
 * toggle (persisted via ThemeContext -> localStorage).
 */
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
  { to: "/login", label: "Login" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-925/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-base font-semibold text-stone-900 dark:text-white">
          Homestay<span className="text-brand-500">AI</span>
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
