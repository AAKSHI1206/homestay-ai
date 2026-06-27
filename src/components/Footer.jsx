/**
 * Footer
 * ------
 * Minimal app-level footer shown on every page.
 */
export default function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
      © {new Date().getFullYear()} HomestayAI — built by Astik Tripathi.
    </footer>
  );
}
