'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Icon } from '@/components/icons'

// Shown in place of a page that failed to render (usually radiance-backend
// being down or erroring). The sidebar stays usable around it.
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // In production Next.js replaces server error messages with a generic one,
  // so the real message is only worth showing in development.
  const detail = process.env.NODE_ENV === 'development' ? error.message : null
  const backendDown = detail?.includes('Cannot reach radiance-backend')

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-lg p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Icon name="alert-triangle" className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          {backendDown ? 'Can’t reach the server' : 'This page couldn’t load'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {backendDown
            ? 'The Radiance backend isn’t responding. Make sure it’s running, then try again.'
            : 'Something went wrong while loading this page. Trying again usually fixes it.'}
        </p>
        {detail && (
          <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-left font-mono text-xs break-words text-slate-600">{detail}</p>
        )}
        {error.digest && <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="btn btn-secondary">
            <Icon name="home" /> Dashboard
          </Link>
          <button type="button" onClick={() => unstable_retry()} className="btn btn-primary">
            <Icon name="refresh" /> Try again
          </button>
        </div>
      </div>
    </div>
  )
}
