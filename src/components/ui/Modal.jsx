import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Modal
 * -----
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is rendered/visible.
 * @param {() => void} props.onClose - Called on Escape key, backdrop click, or close button.
 * @param {string} [props.title] - Optional heading rendered in the modal header.
 * @param {React.ReactNode} props.children - Modal body content.
 *
 * Behavior:
 *  - Renders via a portal into document.body so it always sits above page content.
 *  - Traps Tab/Shift+Tab focus cycling within the modal while open.
 *  - Closes on Escape key and on backdrop click.
 *  - Restores focus to the element that was focused before the modal opened.
 *  - Locks body scroll while open.
 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Open/close lifecycle: remember + restore focus, lock scroll.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusables?.[0] ?? dialogRef.current)?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // Escape to close + Tab focus trap.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 px-5 py-4">
          {title && (
            <h2 id="modal-title" className="text-base font-semibold">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-auto rounded-md p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
