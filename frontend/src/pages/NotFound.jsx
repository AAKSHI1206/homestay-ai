import { Link } from "react-router-dom";
import { Button } from "../components/ui";

/**
 * NotFound Page (404)
 * ───────────────────
 * Displayed when the user visits an invalid or non-existent route.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-7xl font-extrabold text-brand-500 tracking-tight animate-bounce">
        404
      </span>
      <h1 className="mt-4 text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-base text-stone-500 dark:text-stone-400 leading-relaxed">
        We couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or is currently inaccessible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button size="lg">← Return to Homepage</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
