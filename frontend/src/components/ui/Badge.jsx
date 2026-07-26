/**
 * Badge
 * -----
 * Reusable status/sentiment badge.
 *
 * @param {Object} props
 * @param {"positive"|"negative"|"neutral"|"mixed"|"featured"|"default"} [props.variant="default"]
 * @param {React.ReactNode} props.children - Badge label.
 * @param {string} [props.className] - Extra classes.
 */

const VARIANT_CLASSES = {
  positive:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200",
  negative:
    "bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-200",
  neutral:
    "bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200",
  mixed:
    "bg-amber-100 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200",
  featured:
    "bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200",
  default:
    "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300",
};

export default function Badge({ variant = "default", children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
