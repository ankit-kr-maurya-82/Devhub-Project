import { useEffect, useId, useRef } from 'react'

export default function ConfirmDialog({ title, description, busy = false, confirmLabel = 'Confirm', busyLabel = 'Working…', onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  function preventDismissWhileBusy(event) {
    if (busy) event.preventDefault()
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={preventDismissWhileBusy}
      onClose={onCancel}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-xl backdrop:bg-black/50"
    >
      <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
      <p id={descriptionId} className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button autoFocus type="button" disabled={busy} onClick={() => dialogRef.current?.close()} className="ui-button-secondary">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="ui-button-danger">{busy ? busyLabel : confirmLabel}</button>
      </div>
    </dialog>
  )
}
