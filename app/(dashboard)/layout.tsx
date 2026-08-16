import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import { verifyAdminSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/questions', label: 'Questions' },
  { href: '/categories', label: 'Categories' },
]

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Secure check — the proxy's cookie check is only optimistic (see proxy.ts).
  const session = await verifyAdminSession()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5">
          <p className="text-sm font-bold text-slate-900">Radiance Admin</p>
          <p className="mt-0.5 text-xs text-slate-500">{session.username}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="border-t border-slate-200 p-3">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  )
}
