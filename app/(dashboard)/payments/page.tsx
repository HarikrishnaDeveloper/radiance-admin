import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { formatRupees } from '@/lib/billing'
import { Pagination, SearchBox, userLabel } from '@/components/ui'

const PAYMENT_STYLES: Record<string, string> = {
  CAPTURED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-600',
}

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { payments, total, pageSize, totalCapturedPaise } = await backendApi.payments({ q, page })

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total.toLocaleString('en-IN')} payments · {formatRupees(totalCapturedPaise)} collected
            {q ? ' (matching search)' : ''}
          </p>
        </div>
        <SearchBox defaultValue={q} placeholder="Name, phone, payment ID…" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Razorpay payment ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{new Date(p.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="px-4 py-3">
                  <Link href={`/users/${p.user.id}`} className="font-medium text-indigo-600 hover:underline">
                    {userLabel(p.user)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatRupees(p.amountPaise)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[p.status] ?? ''}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 uppercase text-slate-500">{p.method ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.razorpayPaymentId}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/payments" page={page} total={total} pageSize={pageSize} params={{ q }} />
    </div>
  )
}
