import { backendApi } from '@/lib/backend-api'
import { formatRupees } from '@/lib/billing'
import { RevenueChart } from '@/components/revenue-chart'
import { Section, StatCard } from '@/components/ui'

export default async function DashboardPage() {
  const stats = await backendApi.stats()
  const { users, subscriptions: subs, revenue, usage, content } = stats
  const conversionPct = (subs.conversionRate * 100).toFixed(1)

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Plan: {formatRupees(stats.planAmountPaise)}/month autopay · first {stats.freeStageLimit} stages free
      </p>

      <Section title="Subscriptions & autopay">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Autopay active"
            value={subs.autopayOn}
            hint={`${subs.renewalsNext7Days} renewing in the next 7 days`}
            href="/subscriptions?filter=autopay"
            tone="good"
          />
          <StatCard
            label="Payment issues"
            value={subs.paymentIssues}
            hint="Renewal failed or retrying"
            href="/subscriptions?filter=issues"
            tone={subs.paymentIssues > 0 ? 'warn' : 'default'}
          />
          <StatCard label="New subscribers" value={subs.newThisMonth} hint="This month" />
          <StatCard label="Cancelled" value={subs.cancelledThisMonth} hint="This month" href="/subscriptions?filter=ended" />
          <StatCard label="Ever subscribed" value={subs.everSubscribed} hint={`${subs.ended} no longer subscribed`} />
          <StatCard label="Conversion" value={`${conversionPct}%`} hint="Users who have ever paid" />
          <StatCard
            label="At the paywall"
            value={users.hitFreeLimitNotSubscribed}
            hint={`Used all ${stats.freeStageLimit} free stages, not subscribed`}
          />
          <StatCard
            label="Abandoned checkout"
            value={subs.byStatus.CREATED ?? 0}
            hint="Opened payment, never paid"
            href="/subscriptions?filter=incomplete"
          />
        </div>
      </Section>

      <Section title="Revenue">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-1 lg:grid-cols-1">
            <StatCard label="Monthly recurring revenue" value={formatRupees(revenue.mrrPaise)} hint="Autopay active × plan price" />
            <StatCard
              label="Collected this month"
              value={formatRupees(revenue.thisMonthPaise)}
              hint={`${revenue.thisMonthPayments} payments`}
              href="/payments"
            />
            <StatCard
              label="Collected all time"
              value={formatRupees(revenue.totalPaise)}
              hint={`${revenue.totalPayments} payments`}
              href="/payments"
            />
          </div>
          <div className="lg:col-span-2">
            <RevenueChart months={revenue.monthly} />
          </div>
        </div>
      </Section>

      <Section title="Users">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={users.total} hint={`+${users.newToday} today · +${users.newThisMonth} this month`} href="/users" />
          <StatCard label="Premium" value={users.premium} hint={`${users.comp} granted by admin`} href="/users?filter=premium" />
          <StatCard label="Free" value={users.free} href="/users?filter=free" />
          <StatCard label="Test accounts" value={users.test} href="/users?filter=test" />
        </div>
      </Section>

      <Section title="Usage">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Active today" value={usage.activeUsersToday} hint="Completed a stage or quiz" />
          <StatCard label="Active last 7 days" value={usage.activeUsers7d} />
          <StatCard label="Stages completed today" value={usage.stagesCompletedToday} />
          <StatCard label="Quizzes completed today" value={usage.quizAttemptsToday} />
        </div>
      </Section>

      <Section title="Content">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Live questions" value={content.liveQuestions} href="/questions" />
          <StatCard
            label="Drafts needing review"
            value={content.draftsNeedingReview}
            href="/questions"
            tone={content.draftsNeedingReview > 0 ? 'warn' : 'default'}
          />
        </div>
      </Section>
    </div>
  )
}
