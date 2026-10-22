'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/icons'

export type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'primary'
}

// Branded replacement for window.confirm(). Escape or the backdrop cancels;
// focus starts on Cancel so a stray Enter never confirms a destructive action.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmOptions & { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  // Portaled into the themed shell so dark mode colors still apply.
  const root = document.querySelector('.themed') ?? document.body
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-overlay-in absolute inset-0 bg-[#1b0b2e]/50 backdrop-blur-[2px]" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="animate-dialog-in card relative w-full max-w-md p-6 shadow-xl"
      >
        <div className="flex gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-[#7b0f91]/10 text-[#7b0f91] dark:text-[#c77dd8]'
            }`}
          >
            <Icon name={tone === 'danger' ? 'alert-triangle' : 'info'} className="h-5 w-5" />
          </span>
          <div>
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p id="confirm-message" className="mt-1 text-sm text-slate-500">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    root
  )
}
