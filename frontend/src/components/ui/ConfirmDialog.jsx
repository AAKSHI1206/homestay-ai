import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog
 * ─────────────
 * Styled confirmation dialog that replaces window.confirm().
 * Uses the existing Modal component internally.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible.
 * @param {() => void} props.onClose - Cancel handler.
 * @param {() => void} props.onConfirm - Confirm handler.
 * @param {string} [props.title="Confirm Action"] - Dialog heading.
 * @param {string} [props.message] - Description text.
 * @param {string} [props.confirmLabel="Confirm"] - Confirm button text.
 * @param {string} [props.cancelLabel="Cancel"] - Cancel button text.
 * @param {"primary"|"danger"} [props.variant="danger"] - Confirm button style.
 * @param {boolean} [props.loading=false] - Show loading state on confirm.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure? This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "danger"
                ? "!bg-red-600 !hover:bg-red-700 !active:bg-red-800 !focus-visible:outline-red-600"
                : ""
            }
          >
            {loading ? "Processing…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
