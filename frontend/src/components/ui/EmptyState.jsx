/**
 * EmptyState
 * ----------
 * Reusable empty state component shown when no data is available.
 *
 * @param {Object} props
 * @param {string} [props.icon="📭"] - Emoji or icon to display.
 * @param {string} props.title - Heading text.
 * @param {string} [props.description] - Supporting text.
 * @param {React.ReactNode} [props.action] - Optional action element (e.g. Button).
 * @param {string} [props.className] - Extra classes.
 */
export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-stone-200/80 bg-stone-50/40 p-10 text-center transition-colors dark:border-stone-800/80 dark:bg-stone-950/30",
        className,
      ].join(" ")}
    >
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
        {title}
      </h3>
      {description && (
        <p className="max-w-xs text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
