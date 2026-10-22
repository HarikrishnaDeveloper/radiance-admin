'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/icons'

type ToastTone = 'success' | 'error' | 'info'
type Toast = { id: number; tone: ToastTone; title: string; message?: string }

type ToastApi = {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

// Errors stay up longer: they usually need reading, and often acting on.
const DURATION_MS: Record<ToastTone, number> = { success: 3500, info: 4500, error: 8000 }

const TONE = {
  success: { icon: 'check-circle', accent: 'text-emerald-500', bar: 'bg-emerald-500' },
  error: { icon: 'alert-circle', accent: 'text-red-500', bar: 'bg-red-500' },
  info: { icon: 'info', accent: 'text-[#7b0f91] dark:text-[#c77dd8]', bar: 'bg-[#7b0f91]' },
} as const

// Popup notifications for the signed-in area. Wrap the layout in
// <ToastProvider> and call useToast() from any client component.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const push = useCallback((tone: ToastTone, title: string, message?: string) => {
    const id = nextId.current++
    // Keep the stack short; the oldest goes first.
    setToasts((all) => [...all.slice(-3), { id, tone, title, message }])
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:top-6"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false)
  const tone = TONE[toast.tone]

  useEffect(() => {
    if (paused) return
    const timer = setTimeout(onDismiss, DURATION_MS[toast.tone])
    return () => clearTimeout(timer)
  }, [paused, onDismiss, toast.tone])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="animate-toast-in pointer-events-auto relative flex w-full max-w-sm gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 shadow-lg shadow-black/10"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} aria-hidden />
      <Icon name={tone.icon} className={`mt-0.5 h-5 w-5 shrink-0 ${tone.accent}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.message && <p className="mt-0.5 break-words text-sm text-slate-500">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
