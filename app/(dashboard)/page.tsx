import { backendApi } from '@/lib/backend-api'
import { MONTHLY_AMOUNT_RUPEES } from '@/lib/billing'

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const stats = await backendApi.stats()
  const mrr = stats.activeSubscriptions * MONTHLY_AMOUNT_RUPEES

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview across users, billing, and content.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} hint={`${stats.testUsers} test accounts`} />
        <StatCard label="Active subscriptions" value={stats.activeSubscriptions} />
        <StatCard label="Monthly recurring revenue" value={`₹${mrr.toLocaleString('en-IN')}`} hint={`₹${MONTHLY_AMOUNT_RUPEES}/mo per subscriber`} />
        <StatCard label="Stages completed today" value={stats.stagesCompletedToday} />
        <StatCard label="Drafts needing review" value={stats.draftsNeedingReview} />
        <StatCard label="Live questions" value={stats.liveQuestions} />
      </div>
    </div>
  )
}
