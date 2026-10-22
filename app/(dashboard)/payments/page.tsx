import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { formatRupees } from '@/lib/billing'
import { PageHeader, Pagination, SearchBox, userLabel } from '@/components/ui'

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
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Payments"
        subtitle={`${total.toLocaleString('en-IN')} payments · ${formatRupees(totalCapturedPaise)} collected`}
        actions={<SearchBox defaultValue={q} placeholder="Name, phone, payment ID…" />}
      />

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5 text-right">Amount</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Method</th>
              <th className="px-5 py-3.5">Razorpay payment ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5 text-slate-600">{new Date(p.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="px-5 py-3.5">
                  <Link href={`/users/${p.user.id}`} className="font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                    {userLabel(p.user)}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-900">{formatRupees(p.amountPaise)}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[p.status] ?? ''}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3.5 uppercase text-slate-500">{p.method ?? '—'}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.razorpayPaymentId}</td>
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
