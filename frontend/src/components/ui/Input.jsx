import { useId } from "react";

/**
 * Input
 * -----
 * @param {Object} props
 * @param {string} [props.label] - Optional label rendered above the field.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.type="text"] - Native input type (text, email, password, ...).
 * @param {string} [props.value] - Controlled value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Change handler.
 * @param {string} [props.error] - Error message; when present the field is styled as invalid.
 * @param {string} [props.id] - Optional id; auto-generated if omitted (kept stable for label/aria linkage).
 * @param {string} [props.name] - Input name.
 * @param {boolean} [props.required=false] - Marks the field required and shows a "*" next to the label.
 * @param {boolean} [props.disabled=false] - Disables the field.
 * @param {string} [props.className] - Extra classes merged onto the <input>.
 */
export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  id,
  name,
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-stone-700 dark:text-stone-200"
        >
          {label}
          {required && <span className="text-brand-600 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={[
          "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
          "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100",
          "placeholder:text-stone-400 dark:placeholder:text-stone-500",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-100 dark:disabled:bg-stone-900",
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-500"
            : "border-stone-300 dark:border-stone-600 focus:ring-2 focus:ring-brand-300 focus:border-brand-500",
          className,
        ].join(" ")}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
