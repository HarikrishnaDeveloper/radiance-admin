import Link from 'next/link'
import { Icon } from '@/components/icons'

// For notFound() calls in admin pages, e.g. a user or paper that doesn't exist.
export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-lg p-8 text-center">
        <p className="bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a] bg-clip-text text-5xl font-extrabold text-transparent">404</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">We couldn’t find that</h1>
        <p className="mt-2 text-sm text-slate-500">It may have been removed, or the link is wrong.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="btn btn-primary">
            <Icon name="home" /> Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
