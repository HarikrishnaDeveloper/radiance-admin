import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { Icon } from '@/components/icons'
import { NavLinks } from '@/components/nav-links'
import { ThemeToggle, type Theme } from '@/components/theme-toggle'
import { ToastProvider } from '@/components/toast'
import { verifyAdminSession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Secure check — the proxy's cookie check is only optimistic (see proxy.ts).
  const session = await verifyAdminSession()
  const theme: Theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'

  return (
    <div className="themed flex min-h-screen bg-slate-50 text-slate-900">
      <ToastProvider>
        {/* Same gradient as the login page's greeting panel. Literal colors:
            inside .themed, white/slate are remapped for dark mode. */}
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#8e0a9a] via-[#5b0f8a] to-[#2d0c6b] text-[#fff]">
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-64"
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 160 L60 90 L110 60 L170 110 L200 160 Z" fill="#7a1a8f" fillOpacity="0.35" />
            <path d="M120 160 L230 70 L300 110 L400 160 Z" fill="#8a1f9c" fillOpacity="0.3" />
          </svg>

          <Link href="/" aria-label="Radiance Admin — dashboard" className="relative flex items-center gap-3 px-5 py-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff] shadow-lg shadow-black/20">
              <Image src="/logo-mark.png" alt="" width={256} height={256} priority className="h-7 w-7" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">Radiance</span>
              <span className="block text-xs text-[#fff]/70">Admin panel</span>
            </span>
          </Link>

          <div className="relative flex flex-1 flex-col">
            <NavLinks />

            <div className="space-y-3 px-3 pb-4">
              <ThemeToggle initial={theme} />
              <div className="flex items-center gap-3 rounded-lg bg-[#fff]/10 px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff] text-sm font-bold uppercase text-[#5b0f8a]">
                  {session.username.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{session.username}</span>
                  <span className="block text-xs text-[#fff]/60">Administrator</span>
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Sign out"
                    aria-label="Sign out"
                    className="rounded-md p-1.5 text-[#fff]/70 transition hover:bg-[#fff]/15 hover:text-[#fff]"
                  >
                    <Icon name="logout" className="h-[18px] w-[18px]" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </ToastProvider>
    </div>
  )
}
