'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'

// Unsaved-edit protection for the one-question-at-a-time editor. The guard
// compares its form's current values with what was last loaded or saved, so
// typing something and deleting it again doesn't count as a change.

const unsaved = { dirty: false }

function serialize(form: HTMLFormElement): string {
  return JSON.stringify([...new FormData(form).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name]))
}

// Place inside the <form> it protects, after its fields, so the baseline is
// taken once they have all mounted.
export function UnsavedChangesGuard() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const form = ref.current?.closest('form')
    if (!form) return
    let baseline = serialize(form)
    const check = () => {
      unsaved.dirty = serialize(form) !== baseline
    }
    const saved = () => {
      baseline = serialize(form)
      unsaved.dirty = false
    }
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (unsaved.dirty) e.preventDefault()
    }
    form.addEventListener('input', check)
    form.addEventListener('change', check)
    form.addEventListener('action:success', saved)
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      unsaved.dirty = false
      form.removeEventListener('input', check)
      form.removeEventListener('change', check)
      form.removeEventListener('action:success', saved)
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [])

  return <span ref={ref} hidden />
}

// A Link that asks before leaving a question with unsaved edits.
export function GuardedLink({
  href,
  className,
  title,
  children,
  'aria-current': ariaCurrent,
}: {
  href: string
  className?: string
  title?: string
  children: ReactNode
  'aria-current'?: 'page'
}) {
  const router = useRouter()
  const [asking, setAsking] = useState(false)

  return (
    <>
      <Link
        href={href}
        title={title}
        aria-current={ariaCurrent}
        className={className}
        onClick={(e) => {
          if (!unsaved.dirty || e.metaKey || e.ctrlKey) return
          e.preventDefault()
          setAsking(true)
        }}
      >
        {children}
      </Link>
      <ConfirmDialog
        open={asking}
        title="Discard unsaved changes?"
        message="You've edited this question but haven't saved it. Leave without saving?"
        confirmLabel="Discard changes"
        tone="danger"
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false)
          unsaved.dirty = false
          router.push(href)
        }}
      />
    </>
  )
}
