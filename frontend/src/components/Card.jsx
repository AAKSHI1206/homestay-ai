/**
 * Card
 * ----
 * Reusable card container with glassmorphic styling, hover animations,
 * proper overflow boundaries, and optional click handling.
 *
 * @param {Object} props
 * @param {"default"|"stat"|"glass"} [props.variant="default"] - Visual style.
 * @param {boolean} [props.noPadding=false] - If true, removes default internal p-6 padding.
 * @param {() => void} [props.onClick] - Click handler (makes the card interactive).
 * @param {React.ReactNode} props.children - Card content.
 * @param {string} [props.className] - Extra classes.
 */

const VARIANT_CLASSES = {
  default:
    "rounded-2xl border border-stone-200/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.28)]",
  stat:
    "rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white/95 to-stone-50/80 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-500/40 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-white/[0.07] dark:via-white/[0.03] dark:to-transparent dark:backdrop-blur-2xl dark:hover:border-white/[0.18] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
  glass:
    "rounded-2xl border border-white/30 bg-white/20 backdrop-blur-2xl shadow-lg dark:border-white/[0.14] dark:bg-white/[0.05] dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]",
};

export default function Card({
  variant = "default",
  noPadding = false,
  onClick,
  children,
  className = "",
  ...rest
}) {
  const isClickable = typeof onClick === "function";
  const paddingClass = noPadding ? "" : "p-6 sm:p-7";

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        "relative overflow-hidden transition-all duration-200",
        paddingClass,
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
        isClickable
          ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
