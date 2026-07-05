import { createContext, useCallback, useContext, useRef, useState } from "react";

/**
 * Toast
 * -----
 * A self-contained toast notification system (no external dependency).
 *
 * Usage:
 *   1. Wrap the app once in <ToastProvider> (see main.jsx).
 *   2. From any component: const { toast } = useToast();
 *        toast("Saved successfully", { type: "success" });
 *        toast("Something went wrong", { type: "error", duration: 5000 });
 *
 * useToast() return value:
 *  - toast(message, options?) => id
 *      @param {string} message - Text to display.
 *      @param {Object} [options]
 *      @param {"info"|"success"|"error"|"warning"} [options.type="info"]
 *      @param {number} [options.duration=3500] - Auto-dismiss time in ms (0 disables auto-dismiss).
 *  - dismiss(id) => void - Manually dismiss a toast early.
 *
 * Rendering: toasts stack bottom-right, announced via aria-live="polite" so
 * screen readers pick up new messages without interrupting other content.
 */

const ToastContext = createContext(undefined);

const TYPE_STYLES = {
  info: "bg-stone-800 dark:bg-stone-700 text-white",
  success: "bg-pine-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-brand-500 text-white",
};

const TYPE_ICON = {
  info: "ℹ",
  success: "✓",
  error: "✕",
  warning: "!",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      const { type = "info", duration = 3500 } = options;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** useToast() — call toast(message, { type, duration }) from any component. */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/** Single toast item — internal, rendered by ToastProvider. */
function Toast({ message, type = "info", onDismiss }) {
  return (
    <div
      role="status"
      className={[
        "flex items-start gap-2.5 rounded-lg px-4 py-3 shadow-lg",
        "animate-[toast-in_0.18s_ease-out]",
        TYPE_STYLES[type] ?? TYPE_STYLES.info,
      ].join(" ")}
    >
      <span aria-hidden="true" className="mt-0.5 font-bold">
        {TYPE_ICON[type] ?? TYPE_ICON.info}
      </span>
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-1 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
