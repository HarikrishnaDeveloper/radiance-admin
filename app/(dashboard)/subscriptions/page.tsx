import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { MONTHLY_AMOUNT_RUPEES } from '@/lib/billing'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  AUTHENTICATED: 'bg-sky-100 text-sky-700',
  PENDING: 'bg-amber-100 text-amber-700',
  CREATED: 'bg-slate-100 text-slate-600',
  HALTED: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  EXPIRED: 'bg-red-100 text-red-700',
}

export default async function SubscriptionsPage() {
  const subscriptions = await backendApi.subscriptions()

  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length
  const mrr = activeCount * MONTHLY_AMOUNT_RUPEES

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
      <p className="mt-1 text-sm text-slate-500">
        {activeCount} active · ₹{mrr.toLocaleString('en-IN')} MRR
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Current period</th>
              <th className="px-4 py-3">Razorpay ID</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/users/${sub.user.id}`} className="font-medium text-indigo-600 hover:underline">
                    {sub.user.name ?? sub.user.phone ?? sub.user.username ?? sub.user.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[sub.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {sub.currentStart && sub.currentEnd
                    ? `${new Date(sub.currentStart).toLocaleDateString('en-IN')} – ${new Date(sub.currentEnd).toLocaleDateString('en-IN')}`
                    : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{sub.razorpaySubscriptionId}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(sub.updatedAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
