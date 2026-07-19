import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar
 * ------
 * App-level navigation bar. Hosts the route links, auth-aware
 * login/logout, and the dark/light mode toggle.
 */
const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

const AUTH_LINKS = [
  { to: "/listings", label: "Listings" },
  { to: "/reviews", label: "Reviews" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-925/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-base font-semibold text-stone-900 dark:text-white">
          Homestay<span className="text-brand-500">AI</span>
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Public links — always visible */}
          {PUBLIC_LINKS.map((link) => (
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

          {/* Auth-protected links — only when logged in */}
          {user &&
            AUTH_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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

          {/* Auth actions */}
          {user ? (
            <>
              <span className="hidden sm:inline-block rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors sm:px-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                      : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
                  ].join(" ")
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  [
                    "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                      : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
                  ].join(" ")
                }
              >
                Register
              </NavLink>
            </>
          )}

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
