'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/icons'

type NavItem = { href: string; label: string; icon: IconName }

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ href: '/', label: 'Dashboard', icon: 'dashboard' }] },
  {
    title: 'People',
    items: [
      { href: '/users', label: 'Users', icon: 'users' },
      { href: '/audience', label: 'Audience', icon: 'pie' },
    ],
  },
  { title: 'Learning', items: [{ href: '/attempts', label: 'Tests & practice', icon: 'clipboard' }] },
  {
    title: 'Billing',
    items: [
      { href: '/subscriptions', label: 'Subscriptions', icon: 'repeat' },
      { href: '/payments', label: 'Payments', icon: 'card' },
      { href: '/streak-freezes', label: 'Streak freezes', icon: 'snowflake' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/questions', label: 'Questions', icon: 'file' },
      { href: '/categories', label: 'Categories', icon: 'grid' },
    ],
  },
]

// Sidebar navigation in titled groups; highlights the section the current
// page belongs to. When the sidebar is collapsed, group titles become thin
// dividers and item names become tooltips. Colors are literals because the
// sidebar's gradient doesn't change with theme.
export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-3 [scrollbar-width:none]">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.title}>
          <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#fff]/45 collapsed:sr-only">
            {group.title}
          </p>
          {gi > 0 && <div className="mx-auto mb-2 hidden h-px w-8 bg-[#fff]/20 collapsed:block" aria-hidden />}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  // The name shows as a tooltip, which is all there is when collapsed.
                  title={item.label}
                  className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition collapsed:justify-center collapsed:px-0 ${
                    active ? 'bg-[#fff] text-[#5b0f8a] shadow-sm' : 'text-[#fff]/75 hover:bg-[#fff]/10 hover:text-[#fff]'
                  }`}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                  <span className="whitespace-nowrap collapsed:sr-only">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
