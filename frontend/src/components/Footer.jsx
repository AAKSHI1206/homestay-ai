import { Link } from "react-router-dom";

/**
 * Footer
 * ------
 * Modern SaaS-style footer with columns: Product, Resources, Legal.
 */
export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-base font-semibold text-stone-900 dark:text-white">
              Homestay<span className="text-brand-500">AI</span>
            </p>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 max-w-[200px]">
              AI-powered guest review sentiment analysis for homestay owners.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-900 dark:text-stone-200">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  AI Analyzer
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-900 dark:text-stone-200">
              Resources
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li>
                <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Gemini AI
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-900 dark:text-stone-200">
              Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
          © {new Date().getFullYear()} HomestayAI — built by Aakshi. Internship
          Week 8.
        </div>
      </div>
    </footer>
  );
}
