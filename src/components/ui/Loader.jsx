/**
 * Loader
 * ------
 * @param {Object} props
 * @param {"spinner"|"skeleton"} [props.variant="spinner"] - Visual style.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Spinner diameter (ignored for skeleton).
 * @param {number} [props.lines=3] - Number of skeleton lines (skeleton variant only).
 * @param {string} [props.label="Loading"] - Accessible label announced to screen readers.
 * @param {string} [props.className] - Extra classes merged onto the root element.
 *
 * Use `spinner` for short, indeterminate waits (button/page loading), and
 * `skeleton` to hold the shape of content (cards, lists) while it fetches.
 */
const SPINNER_SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export default function Loader({
  variant = "spinner",
  size = "md",
  lines = 3,
  label = "Loading",
  className = "",
}) {
  if (variant === "skeleton") {
    return (
      <div
        role="status"
        aria-label={label}
        className={["w-full animate-pulse space-y-2.5", className].join(" ")}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 rounded bg-stone-200 dark:bg-stone-700"
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={["inline-flex items-center justify-center", className].join(
        " "
      )}
    >
      <span
        aria-hidden="true"
        className={[
          "animate-spin rounded-full border-stone-200 dark:border-stone-700 border-t-brand-500",
          SPINNER_SIZES[size] ?? SPINNER_SIZES.md,
        ].join(" ")}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
