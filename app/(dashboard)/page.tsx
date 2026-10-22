import Link from 'next/link'
import type { ReactNode } from 'react'
import { backendApi } from '@/lib/backend-api'
import { formatRupees } from '@/lib/billing'
import { verifyAdminSession } from '@/lib/dal'
import { Icon, type IconName } from '@/components/icons'
import { RevenueChart } from '@/components/revenue-chart'

// Bento-style overview: one headline number per tile, a round ↗ button to the
// page behind it, and as little supporting text as possible.
export default async function DashboardPage() {
  const [session, stats] = await Promise.all([verifyAdminSession(), backendApi.stats()])
  const { users, subscriptions: subs, revenue, usage, content } = stats
  const conversionPct = Math.round(subs.conversionRate * 1000) / 10
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const userSplit = [
    { label: 'Premium', value: users.premium, className: 'bg-[#7b0f91] dark:bg-[#c77dd8]' },
    { label: 'Free', value: users.free, className: 'bg-slate-300' },
    { label: 'Test', value: users.test, className: 'bg-amber-400' },
  ]
  const splitTotal = Math.max(userSplit.reduce((n, s) => n + s.value, 0), 1)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-4 md:grid-cols-6 xl:grid-cols-12">
        {/* Greeting + headline revenue */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8e0a9a] via-[#5b0f8a] to-[#2d0c6b] p-7 text-[#fff] shadow-sm md:col-span-6 xl:col-span-5">
          <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden>
            <path d="M0 160 L60 90 L110 60 L170 110 L200 160 Z" fill="#7a1a8f" fillOpacity="0.35" />
            <path d="M120 160 L230 70 L300 110 L400 160 Z" fill="#8a1f9c" fillOpacity="0.3" />
          </svg>
          <div className="relative">
            <p className="text-sm text-[#fff]/70">{today}</p>
            <h1 className="mt-3 text-3xl font-light leading-tight">
              Hi <span className="font-bold capitalize">{session.username}</span>,
              <br />
              here&apos;s <span className="font-bold">Radiance today.</span>
            </h1>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#fff]/60">Monthly recurring revenue</p>
                <p className="mt-1 text-4xl font-bold tabular-nums">{formatRupees(revenue.mrrPaise)}</p>
              </div>
              <RoundLink href="/payments" label="Payments" light />
            </div>
          </div>
        </section>

        {/* Revenue chart */}
        <Tile className="md:col-span-6 xl:col-span-7" title="Revenue collected" href="/payments">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tabular-nums text-slate-900">{formatRupees(revenue.thisMonthPaise)}</p>
            <p className="text-sm text-slate-400">this month</p>
          </div>
          <div className="mt-2 flex-1">
            <RevenueChart months={revenue.monthly} />
          </div>
        </Tile>

        {/* Autopay */}
        <Tile className="md:col-span-3 xl:col-span-4" title="Autopay active" href="/subscriptions?filter=autopay">
          <BigNumber value={subs.autopayOn} />
          <p className="mt-1 text-sm text-slate-400">{subs.renewalsNext7Days} renewing this week</p>
          <div className="mt-auto pt-6">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Conversion</span>
              <span className="tabular-nums text-slate-900">{conversionPct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a]"
                style={{ width: `${Math.min(conversionPct, 100)}%` }}
              />
            </div>
          </div>
        </Tile>

        {/* Highlight: all-time revenue */}
        <section className="relative flex flex-col rounded-3xl bg-[#d4ff3f] p-6 text-[#111] shadow-sm md:col-span-3 xl:col-span-3">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold">Collected all time</h2>
            <RoundLink href="/payments" label="Payments" dark />
          </div>
          <p className="mt-auto pt-10 text-3xl font-bold tabular-nums">{formatRupees(revenue.totalPaise)}</p>
          <p className="mt-1 text-sm text-[#111]/60">{revenue.totalPayments} payments</p>
        </section>

        {/* Users */}
        <Tile className="md:col-span-6 xl:col-span-5" title="Users" href="/users">
          <div className="flex items-baseline gap-2">
            <BigNumber value={users.total} />
            {users.newToday > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">+{users.newToday} today</span>
            )}
          </div>
          <div className="mt-auto pt-6">
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
              {userSplit.map((s) => (
                <div key={s.label} className={s.className} style={{ width: `${(s.value / splitTotal) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              {userSplit.map((s) => (
                <li key={s.label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${s.className}`} aria-hidden />
                  {s.label} <span className="font-semibold tabular-nums text-slate-900">{s.value.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tile>

        {/* Things to act on */}
        <MiniTile
          icon="alert-triangle"
          label="Payment issues"
          value={subs.paymentIssues}
          href="/subscriptions?filter=issues"
          tone={subs.paymentIssues > 0 ? 'warn' : 'default'}
        />
        <MiniTile icon="lock" label="At the paywall" value={users.hitFreeLimitNotSubscribed} href="/users?filter=free" />
        <MiniTile icon="activity" label="Active this week" value={usage.activeUsers7d} sub={`${usage.activeUsersToday} today`} />
        <MiniTile
          icon="file"
          label="Drafts to review"
          value={content.draftsNeedingReview}
          sub={`${content.liveQuestions.toLocaleString('en-IN')} live`}
          href="/questions"
          tone={content.draftsNeedingReview > 0 ? 'warn' : 'default'}
        />
      </div>
    </div>
  )
}

function Tile({ title, href, className = '', children }: { title: string; href?: string; className?: string; children: ReactNode }) {
  return (
    <section className={`card flex flex-col rounded-3xl p-6 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-500">{title}</h2>
        {href && <RoundLink href={href} label={title} />}
      </div>
      {children}
    </section>
  )
}

function MiniTile({
  icon,
  label,
  value,
  sub,
  href,
  tone = 'default',
}: {
  icon: IconName
  label: string
  value: number
  sub?: string
  href?: string
  tone?: 'default' | 'warn'
}) {
  return (
    <section className="card flex flex-col rounded-3xl p-5 md:col-span-3">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            tone === 'warn' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        {href && <RoundLink href={href} label={label} />}
      </div>
      <p className="mt-5 text-3xl font-bold tabular-nums text-slate-900">{value.toLocaleString('en-IN')}</p>
      <p className="mt-0.5 text-sm text-slate-500">
        {label}
        {sub && <span className="text-slate-400"> · {sub}</span>}
      </p>
    </section>
  )
}

function BigNumber({ value }: { value: number }) {
  return <p className="text-4xl font-bold tabular-nums text-slate-900">{value.toLocaleString('en-IN')}</p>
}

// The round ↗ button in a tile's corner.
function RoundLink({ href, label, light, dark }: { href: string; label: string; light?: boolean; dark?: boolean }) {
  const look = light
    ? 'bg-[#fff]/15 text-[#fff] hover:bg-[#fff]/25'
    : dark
      ? 'bg-[#111] text-[#d4ff3f] hover:bg-[#111]/85'
      : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
  return (
    <Link
      href={href}
      aria-label={`Open ${label}`}
      title={`Open ${label}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${look}`}
    >
      <Icon name="arrow-up-right" className="h-4 w-4" />
    </Link>
  )
}
