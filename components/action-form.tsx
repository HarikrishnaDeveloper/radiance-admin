'use client'

import { useActionState, useRef, useState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ConfirmDialog, type ConfirmOptions } from '@/components/confirm-dialog'
import { Icon } from '@/components/icons'
import { useToast } from '@/components/toast'
import type { ActionResult } from '@/lib/action-result'

// A <form> for a Server Action that returns an ActionResult (see
// lib/action-result.ts): shows a success or error toast with the outcome and,
// with `confirm`, asks first in a ConfirmDialog. Pair with <SubmitButton>.
export function ActionForm({
  action,
  successTitle = 'Saved',
  errorTitle = 'Something went wrong',
  confirm,
  className,
  id,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>
  successTitle?: string
  errorTitle?: string
  confirm?: ConfirmOptions
  className?: string
  id?: string
  children: ReactNode
}) {
  const toast = useToast()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const confirmed = useRef(false)
  const [asking, setAsking] = useState(false)

  const [, formAction] = useActionState(async (_prev: ActionResult | null, formData: FormData) => {
    let result: ActionResult
    try {
      result = await action(formData)
    } catch (e) {
      // redirect()/notFound() from the action: let Next.js navigate.
      if (typeof (e as { digest?: unknown })?.digest === 'string' && (e as { digest: string }).digest.startsWith('NEXT_')) {
        throw e
      }
      result = { ok: false, error: 'Could not reach the server. Check your connection and try again.' }
    }
    if (result.ok) {
      toast.success(successTitle, result.message)
      // Lets listeners on the form (e.g. UnsavedChangesGuard) know it saved.
      formRef.current?.dispatchEvent(new CustomEvent('action:success'))
      if (result.redirectTo) router.push(result.redirectTo)
    } else {
      toast.error(errorTitle, result.error)
    }
    return result
  }, null)

  return (
    <>
      <form
        ref={formRef}
        id={id}
        action={formAction}
        className={className}
        onSubmit={(e) => {
          if (!confirm) return
          if (confirmed.current) {
            confirmed.current = false
            return
          }
          e.preventDefault()
          setAsking(true)
        }}
      >
        {children}
      </form>
      {confirm && (
        <ConfirmDialog
          open={asking}
          {...confirm}
          onCancel={() => setAsking(false)}
          onConfirm={() => {
            setAsking(false)
            confirmed.current = true
            formRef.current?.requestSubmit()
          }}
        />
      )}
    </>
  )
}

// Submit button that disables itself and shows a spinner while its form's
// action runs. With several buttons in one form, give each a name/value: the
// pressed one is submitted with the form data and is the only one that spins.
export function SubmitButton({
  children,
  pendingLabel,
  className = 'btn btn-primary',
  name,
  value,
  title,
}: {
  children: ReactNode
  pendingLabel?: string
  className?: string
  name?: string
  value?: string
  title?: string
}) {
  const { pending, data } = useFormStatus()
  const mine = pending && (!name || data?.get(name) === value)
  return (
    <button
      type="submit"
      name={name}
      value={value}
      title={title}
      disabled={pending}
      aria-busy={mine}
      className={className}
    >
      {mine && <Icon name="spinner" className="h-4 w-4" />}
      {mine ? (pendingLabel ?? children) : children}
    </button>
  )
}
