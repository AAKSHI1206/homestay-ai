import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar
 * ------
 * App-level navigation bar. Hosts the route links, auth-aware
 * login/logout, the dark/light mode toggle, and a hamburger
 * menu trigger for the mobile sidebar.
 *
 * @param {Object} props
 * @param {() => void} [props.onMenuToggle] - Fires when the hamburger is clicked.
 * @param {boolean} [props.showMenuButton=false] - Whether to show the hamburger.
 */
const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

const AUTH_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/listings", label: "My Homestays" },
  { to: "/reviews", label: "Analyzer" },
];

export default function Navbar({ onMenuToggle, showMenuButton = false }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    [
      "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
        : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-925/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-md p-1.5 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 lg:hidden"
              aria-label="Toggle sidebar menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            </button>
          )}

          <NavLink
            to="/"
            className="text-base font-semibold text-stone-900 dark:text-white"
          >
            Homestay<span className="text-brand-500">AI</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Public links — always visible */}
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Auth-protected links — only when logged in (hidden on mobile — sidebar handles them) */}
          {user && (
            <div className="hidden md:flex md:items-center md:gap-1">
              {AUTH_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Auth actions */}
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-200">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
                <span className="hidden lg:inline">{user.name}</span>
              </NavLink>
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
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
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
