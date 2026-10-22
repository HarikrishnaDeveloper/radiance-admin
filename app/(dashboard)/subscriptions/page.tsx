import Link from 'next/link'
import { backendApi, type SubscriptionFilter } from '@/lib/backend-api'
import { formatDate, formatRupees } from '@/lib/billing'
import { AutopayBadge, FilterTabs, Pagination, SearchBox, StatCard, SubscriptionBadge, userLabel } from '@/components/ui'

const FILTERS: SubscriptionFilter[] = ['all', 'autopay', 'issues', 'ended', 'incomplete']

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>
}) {
  const { q, page: pageParam, filter: filterParam } = await searchParams
  const filter = FILTERS.includes(filterParam as SubscriptionFilter) ? (filterParam as SubscriptionFilter) : 'all'
  const page = Math.max(1, Number(pageParam) || 1)

  const [{ subscriptions, total, pageSize }, stats] = await Promise.all([
    backendApi.subscriptions({ q, page, filter }),
    backendApi.stats(),
  ])
  const subs = stats.subscriptions
  const allCount = Object.values(subs.byStatus).reduce((a, b) => a + b, 0)
  const filterParams = { q, filter: filter === 'all' ? undefined : filter }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
      <p className="mt-1 text-sm text-slate-500">Everyone who has started a subscription, with their autopay state.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Autopay active" value={subs.autopayOn} tone="good" />
        <StatCard label="MRR" value={formatRupees(stats.revenue.mrrPaise)} />
        <StatCard label="Renewing in 7 days" value={subs.renewalsNext7Days} />
        <StatCard label="Payment issues" value={subs.paymentIssues} tone={subs.paymentIssues > 0 ? 'warn' : 'default'} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/subscriptions"
          current={filter}
          params={{ q }}
          options={[
            { value: 'all', label: 'All', count: allCount },
            { value: 'autopay', label: 'Autopay on', count: subs.autopayOn },
            { value: 'issues', label: 'Payment issues', count: subs.paymentIssues },
            { value: 'ended', label: 'Cancelled / ended', count: subs.ended },
            { value: 'incomplete', label: 'Abandoned', count: subs.byStatus.CREATED ?? 0 },
          ]}
        />
        <SearchBox defaultValue={q} placeholder="Name, phone, username, sub ID…" hidden={{ filter: filterParams.filter }} />
      </div>

      <div className="mt-4 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Autopay</th>
              <th className="px-4 py-3">Next charge</th>
              <th className="px-4 py-3 text-right">Months paid</th>
              <th className="px-4 py-3 text-right">Total paid</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Cancelled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/users/${sub.user.id}`} className="font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                    {userLabel(sub.user)}
                  </Link>
                  {sub.user.phone && sub.user.name && <p className="text-xs text-slate-400">{sub.user.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  <SubscriptionBadge status={sub.status} />
                </td>
                <td className="px-4 py-3">
                  <AutopayBadge on={sub.autopayOn} />
                </td>
                <td className="px-4 py-3 text-slate-600">{sub.autopayOn ? formatDate(sub.chargeAt) : '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">{sub.paidCount}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatRupees(sub.totalPaidPaise)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(sub.activatedAt)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(sub.cancelledAt)}</td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No subscriptions match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/subscriptions" page={page} total={total} pageSize={pageSize} params={filterParams} />
    </div>
  )
}
