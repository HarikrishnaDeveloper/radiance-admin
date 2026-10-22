'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/icons'

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/users', label: 'Users', icon: 'users' },
  { href: '/subscriptions', label: 'Subscriptions', icon: 'repeat' },
  { href: '/payments', label: 'Payments', icon: 'card' },
  { href: '/questions', label: 'Questions', icon: 'file' },
  { href: '/categories', label: 'Categories', icon: 'grid' },
]

// Sidebar navigation; highlights the section the current page belongs to.
// Colors are literals because the sidebar's gradient doesn't change with theme.
export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? 'bg-[#fff] text-[#5b0f8a] shadow-sm' : 'text-[#fff]/75 hover:bg-[#fff]/10 hover:text-[#fff]'
            }`}
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
