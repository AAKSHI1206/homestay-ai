/**
 * Button
 * ------
 * @param {Object} props
 * @param {"primary"|"secondary"|"outline"} [props.variant="primary"] - Visual style.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Button size.
 * @param {boolean} [props.disabled=false] - Disables interaction and dims the button.
 * @param {() => void} [props.onClick] - Click handler. Ignored while disabled.
 * @param {"button"|"submit"|"reset"} [props.type="button"] - Native button type.
 * @param {React.ReactNode} props.children - Button label/content.
 * @param {string} [props.className] - Extra classes merged onto the root element.
 */
const VARIANT_CLASSES = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus-visible:outline-brand-600 disabled:hover:bg-brand-500",
  secondary:
    "bg-pine-500 text-white hover:bg-pine-600 active:bg-pine-700 focus-visible:outline-pine-600 disabled:hover:bg-pine-500",
  outline:
    "bg-transparent text-stone-800 border border-stone-300 hover:bg-stone-100 active:bg-stone-200 focus-visible:outline-stone-500 dark:text-stone-100 dark:border-stone-600 dark:hover:bg-stone-800 dark:active:bg-stone-700",
};

const SIZE_CLASSES = {
  sm: "text-sm px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-base px-5 py-3 rounded-lg gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={[
        "inline-flex items-center justify-center font-medium transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
