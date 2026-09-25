import Link from 'next/link'
import type { ReactNode } from 'react'
import { SUBSCRIPTION_STATUS } from '@/lib/billing'

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
  const accent = tone === 'good' ? 'border-l-emerald-500' : tone === 'warn' ? 'border-l-amber-500' : 'border-l-transparent'
  const body = (
    <div className={`h-full rounded-2xl border border-l-4 border-slate-200 ${accent} bg-white p-5 transition hover:shadow-sm`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
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
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {options.map((option) => {
        const search = new URLSearchParams()
        for (const [k, v] of Object.entries(params)) if (v) search.set(k, v)
        if (option.value !== 'all') search.set('filter', option.value)
        const active = option.value === current
        return (
          <Link
            key={option.value}
            href={`${basePath}${search.size ? `?${search}` : ''}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className="ml-1.5 tabular-nums text-slate-400">{option.count}</span>}
          </Link>
        )
      })}
    </div>
  )
}

export function SearchBox({ defaultValue, placeholder, hidden = {} }: { defaultValue?: string; placeholder: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form className="flex gap-2">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input
        type="text"
        name="q"
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        Search
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
          <Link href={hrefFor(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link href={hrefFor(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
            Next
          </Link>
        )}
      </div>
    </div>
  )
}

export function userLabel(user: { name: string | null; phone: string | null; username: string | null; id: string }) {
  return user.name ?? user.phone ?? user.username ?? user.id
}
