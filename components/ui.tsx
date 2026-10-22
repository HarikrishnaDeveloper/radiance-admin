import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from '@/components/icons'
import { SUBSCRIPTION_STATUS } from '@/lib/billing'

// Title row shared by every admin page: optional back link, big title, one
// short line of context, and actions on the right.
export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  back?: { href: string; label: string }
  actions?: ReactNode
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

// Dashboard-style tile: label, a round ↗ when it links somewhere, one big number.
export function StatCard({
  label,
  value,
  hint,
  href,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: ReactNode
  href?: string
  tone?: 'default' | 'good' | 'warn'
}) {
  const dot = tone === 'good' ? 'bg-emerald-500' : tone === 'warn' ? 'bg-amber-500' : null
  const body = (
    <div className="card flex h-full flex-col p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          {dot && <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />}
          {label}
        </p>
        {href && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500" aria-hidden>
            <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
  return href ? (
    <Link href={href} aria-label={`${label}: open`}>
      {body}
    </Link>
  ) : (
    body
  )
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function SubscriptionBadge({ status }: { status: string }) {
  const meta = SUBSCRIPTION_STATUS[status]
  return (
    <span
      title={meta?.hint}
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${meta?.className ?? 'bg-slate-100 text-slate-600'}`}
    >
      {meta?.label ?? status}
    </span>
  )
}

export function AutopayBadge({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> On
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Off
    </span>
  )
}

export function FilterTabs({
  basePath,
  current,
  options,
  params = {},
}: {
  basePath: string
  current: string
  options: { value: string; label: string; count?: number }[]
  params?: Record<string, string | undefined>
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => {
        const search = new URLSearchParams()
        for (const [k, v] of Object.entries(params)) if (v) search.set(k, v)
        if (option.value !== 'all') search.set('filter', option.value)
        const active = option.value === current
        return (
          <Link
            key={option.value}
            href={`${basePath}${search.size ? `?${search}` : ''}`}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1.5 tabular-nums ${active ? 'opacity-60' : 'text-slate-400'}`}>{option.count}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function SearchBox({ defaultValue, placeholder, hidden = {} }: { defaultValue?: string; placeholder: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form className="relative flex w-80 max-w-full items-center">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field mt-0 rounded-full py-2.5 pl-4 pr-12 shadow-sm"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition hover:opacity-85"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  )
}

export function Pagination({
  basePath,
  page,
  total,
  pageSize,
  params = {},
}: {
  basePath: string
  page: number
  total: number
  pageSize: number
  params?: Record<string, string | undefined>
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null
  const hrefFor = (p: number) => {
    const search = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v)
    search.set('page', String(p))
    return `${basePath}?${search}`
  }
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className="btn btn-secondary btn-sm">
            ‹ Previous
          </Link>
        )}
        {page < totalPages && (
          <Link href={hrefFor(page + 1)} className="btn btn-secondary btn-sm">
            Next ›
          </Link>
        )}
      </div>
    </div>
  )
}

export function userLabel(user: { name: string | null; phone: string | null; username: string | null; id: string }) {
  return user.name ?? user.phone ?? user.username ?? user.id
}
