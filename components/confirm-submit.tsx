'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

// Submit button that asks for confirmation before its form's Server Action runs.
export function ConfirmSubmit({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {pending ? 'Working…' : children}
    </button>
  )
}
