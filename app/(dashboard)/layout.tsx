import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { ThemeToggle, type Theme } from '@/components/theme-toggle'
import { verifyAdminSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/payments', label: 'Payments' },
  { href: '/questions', label: 'Questions' },
  { href: '/categories', label: 'Categories' },
]

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Secure check — the proxy's cookie check is only optimistic (see proxy.ts).
  const session = await verifyAdminSession()
  const theme: Theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'

  return (
    <div className="themed flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5">
          {/* The logo's dark wordmark needs a light backing in dark mode.
              Literal #fff: inside .themed, bg-white is the dark card color. */}
          <Link href="/" aria-label="Radiance Admin — dashboard" className="inline-block dark:rounded-lg dark:bg-[#fff] dark:px-2.5 dark:py-1.5">
            <Image src="/logo.png" alt="Radiance" width={900} height={212} priority className="h-auto w-36" />
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            Admin · <span className="font-medium text-slate-700">{session.username}</span>
          </p>
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
        <div className="px-3 pb-3">
          <ThemeToggle initial={theme} />
        </div>
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
