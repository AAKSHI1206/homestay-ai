import { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext
 * ------------
 * Provides app-wide dark/light theme state.
 *
 * Context value:
 *  - theme: "light" | "dark"           current active theme
 *  - toggleTheme: () => void           flips theme and persists choice
 *  - setTheme: (theme: string) => void explicitly set "light" | "dark"
 *
 * Persistence: the chosen theme is saved to localStorage under the key
 * "homestay-ai-theme" and re-applied on next load. If no choice has been
 * made yet, it falls back to the user's OS-level prefers-color-scheme.
 *
 * Mechanism: Tailwind's dark: utilities are configured (see index.css,
 * @custom-variant dark) to key off a `.dark` class on the <html> element,
 * which this provider adds/removes whenever the theme changes.
 */

const STORAGE_KEY = "homestay-ai-theme";
const ThemeContext = createContext(undefined);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next) => {
    if (next === "light" || next === "dark") setThemeState(next);
  };

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** useTheme() — read { theme, toggleTheme, setTheme } from any component. */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
