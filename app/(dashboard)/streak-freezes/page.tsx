import Link from 'next/link'
import { updateStreakFreezeSettings } from '@/app/actions/streak-freezes'
import { ActionForm, SubmitButton } from '@/components/action-form'
import { backendApi, type FreezeMonth } from '@/lib/backend-api'
import { formatRupees } from '@/lib/billing'
import { PageHeader, Pagination, Section, StatCard, userLabel } from '@/components/ui'

const PURCHASE_STYLES: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  CREATED: { label: 'Not paid', className: 'bg-slate-100 text-slate-600' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-700' },
}

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })

// Streak freezes: every student gets a few free each month, then can buy
// more. How many are used (free vs bought), what's been sold, how many broken
// streaks were restored, and every purchase. Test accounts are left out of
// the numbers but shown (tagged) in the purchase list.
export default async function StreakFreezesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const data = await backendApi.streakFreezes({ page })
  const { rules, thisMonth, allTime, students, months } = data

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Streak freezes"
        subtitle={`${rules.freePerMonth} free each month · then ${formatRupees(rules.pricePaise)} each · up to ${rules.maxPaid} bought held at once`}
      />

      <Section title="Rules" description="What every student gets and pays. Price and limit apply right away; a new free allowance reaches each student at their next monthly refill.">
        <ActionForm
          action={updateStreakFreezeSettings}
          successTitle="Streak freeze rules saved"
          errorTitle="Couldn’t save the rules"
          className="card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="field-label">
              Free freezes per month
              <input type="number" name="freePerMonth" min={0} max={10} step={1} required defaultValue={rules.freePerMonth} className="field" />
              <span className="mt-1 block text-xs font-normal text-slate-400">0–10. Refilled on the 1st; unused ones don’t carry over.</span>
            </label>
            <label className="field-label">
              Price per freeze (₹)
              <input type="number" name="priceRupees" min={1} max={100} step={1} required defaultValue={rules.pricePaise / 100} className="field" />
              <span className="mt-1 block text-xs font-normal text-slate-400">₹1–₹100. Only offered once the free ones are used.</span>
            </label>
            <label className="field-label">
              Most bought freezes held
              <input type="number" name="maxPaid" min={0} max={50} step={1} required defaultValue={rules.maxPaid} className="field" />
              <span className="mt-1 block text-xs font-normal text-slate-400">0–50. Set 0 to stop selling freezes.</span>
            </label>
          </div>
          <div className="mt-4">
            <SubmitButton pendingLabel="Saving…">Save rules</SubmitButton>
          </div>
        </ActionForm>
      </Section>

      <Section title="This month">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Free freezes used" value={thisMonth.freeUsed} />
          <StatCard label="Bought freezes used" value={thisMonth.paidUsed} />
          <StatCard
            label="Freezes sold"
            value={thisMonth.sold}
            hint={`${formatRupees(thisMonth.revenuePaise)} · ${thisMonth.attempts} purchase ${thisMonth.attempts === 1 ? 'attempt' : 'attempts'}`}
            tone={thisMonth.sold > 0 ? 'good' : 'default'}
          />
          <StatCard label="Streaks restored" value={thisMonth.restores} hint="Bought to save a just-broken streak" />
        </div>
      </Section>

      <Section title="Students">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Out of free freezes"
            value={students.outOfFreeThisMonth}
            hint="Used both free ones this month — could buy more"
            tone={students.outOfFreeThisMonth > 0 ? 'warn' : 'default'}
          />
          <StatCard label="Holding bought freezes" value={students.holdingPaid} hint={`${students.paidFreezesHeld} freezes unused`} />
          <StatCard
            label="All-time revenue"
            value={formatRupees(allTime.revenuePaise)}
            hint={`${allTime.sold} sold · ${allTime.restores} restores · ${allTime.freeUsed + allTime.paidUsed} freezes used`}
          />
        </div>
      </Section>

      <Section
        title="By month"
        description="Purchase attempts count every time a student tapped buy — including while payments aren’t connected — so they show demand.">
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Month</th>
                <th className="px-5 py-3.5 text-right">Free used</th>
                <th className="px-5 py-3.5 text-right">Bought used</th>
                <th className="px-5 py-3.5 text-right">Purchase attempts</th>
                <th className="px-5 py-3.5 text-right">Sold</th>
                <th className="px-5 py-3.5 text-right">Restores</th>
                <th className="px-5 py-3.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...months].reverse().map((m: FreezeMonth) => (
                <tr key={m.month} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{monthLabel(m.month)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{m.freeUsed}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{m.paidUsed}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{m.attempts}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{m.sold}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">{m.restores}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-900">{formatRupees(m.revenuePaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Purchases" description={`${data.total.toLocaleString('en-IN')} in total, newest first.`}>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Razorpay payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.purchases.map((p) => {
                const status = PURCHASE_STYLES[p.status] ?? { label: p.status, className: '' }
                return (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 text-slate-600">
                      {new Date(p.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/users/${p.user.id}`} className="font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                        {userLabel(p.user)}
                      </Link>
                      {p.user.isTestUser && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Test</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.forRestore ? 'Restore streak' : 'Stock up'}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-900">
                      {formatRupees(p.amountPaise)}
                      {p.quantity > 1 && <span className="ml-1 text-xs text-slate-400">×{p.quantity}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.razorpayPaymentId ?? '—'}</td>
                  </tr>
                )
              })}
              {data.purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No streak freeze purchases yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination basePath="/streak-freezes" page={page} total={data.total} pageSize={data.pageSize} params={{}} />
      </Section>
    </div>
  )
}
