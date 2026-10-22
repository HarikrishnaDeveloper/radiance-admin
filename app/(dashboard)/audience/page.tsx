import Link from 'next/link'
import { backendApi, type InsightRow } from '@/lib/backend-api'
import {
  DURATION_LABELS,
  FOCUS_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  REFERRAL_LABELS,
  attemptKind,
  attemptLabel,
  label,
} from '@/lib/labels'
import { PageHeader, StatCard } from '@/components/ui'

const MAX_STATES = 8

// Who the students are (their onboarding answers) and how they use the study
// tools. Test accounts are left out of every number.
export default async function AudiencePage() {
  const data = await backendApi.insights()
  const { onboarding, studyPlan, engagement } = data
  const pct = (n: number) => (data.totalUsers ? Math.round((n / data.totalUsers) * 100) : 0)

  // Long tail of states folds into "Other states".
  const states = onboarding.state.slice(0, MAX_STATES)
  const otherStates = onboarding.state.slice(MAX_STATES).reduce((n, r) => n + r.count, 0)
  if (otherStates) states.push({ value: 'Other states', count: otherStates })

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Audience" subtitle="Onboarding answers and study habits · test accounts excluded" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Students" value={data.totalUsers} href="/users" />
        <StatCard label="Finished onboarding" value={`${pct(data.profileCompleted)}%`} hint={`${data.profileCompleted} students`} />
        <StatCard label="Phone verified" value={`${pct(data.phoneVerified)}%`} hint={`${data.phoneVerified} students`} />
        <StatCard label="Use a study plan" value={`${pct(studyPlan.usersWithGoals)}%`} hint={`${studyPlan.usersWithGoals} students`} />
      </div>

      <SectionTitle>Onboarding answers</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Distribution title="Where they heard about us" rows={onboarding.referralSource} format={(v) => label(REFERRAL_LABELS, v)} />
        <Distribution title="How long they’ve prepared" rows={onboarding.preparationDuration} format={(v) => label(DURATION_LABELS, v)} />
        <Distribution title="Preparation level" rows={onboarding.preparationLevel} format={(v) => label(LEVEL_LABELS, v)} />
        <Distribution title="Target attempt" rows={onboarding.targetAttempt} format={(v) => (v ? attemptLabel(v) : 'Not answered')} />
        <Distribution title="Focus" rows={onboarding.preparationFocus} format={(v) => label(FOCUS_LABELS, v)} />
        <Distribution title="State" rows={states} format={(v) => v ?? 'Not answered'} />
      </div>

      <SectionTitle>Study habits</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Questions answered" value={engagement.questionsAnswered} />
        <StatCard label="Bookmarked questions" value={engagement.bookmarks} />
        <StatCard label="Daily challenges done" value={engagement.dailyChallengesCompleted} />
        <StatCard label="Streak freezes used" value={engagement.streakFreezesUsed} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-slate-500">Daily goals students set</h2>
          {studyPlan.goals.length === 0 ? (
            <Empty />
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {studyPlan.goals.map((g) => (
                <li key={g.type} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-medium text-slate-900">{label(GOAL_LABELS, g.type)}</span>
                  <span className="text-right text-slate-500">
                    <span className="font-semibold tabular-nums text-slate-900">{g.users}</span> students · avg{' '}
                    <span className="tabular-nums">{g.averageTarget}</span>/day
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Distribution
          title="Tests completed"
          rows={engagement.testsCompleted.map((t) => ({ value: attemptKind(t), count: t.count }))}
          format={(v) => v ?? '—'}
          href="/attempts"
        />
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-slate-400">{children}</h2>
}

function Empty() {
  return <p className="mt-6 text-sm text-slate-400">No answers yet.</p>
}

// One onboarding question: each answer as a bar of its share, with the count
// and percentage written out (so no value depends on reading the bar).
function Distribution({
  title,
  rows,
  format,
  href,
}: {
  title: string
  rows: InsightRow[]
  format: (value: string | null) => string
  href?: string
}) {
  const total = rows.reduce((n, r) => n + r.count, 0)
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500">{title}</h2>
        {href && (
          <Link href={href} className="text-xs font-semibold text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
            View all
          </Link>
        )}
      </div>
      {total === 0 ? (
        <Empty />
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const share = Math.round((r.count / total) * 100)
            const missing = r.value === null
            return (
              <li key={r.value ?? '∅'}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={missing ? 'text-slate-400' : 'font-medium text-slate-900'}>{format(r.value)}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">
                    <span className="font-semibold text-slate-900">{r.count}</span> · {share}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                  <div
                    className={`h-full rounded-full ${missing ? 'bg-slate-300' : 'bg-[#7b0f91] dark:bg-[#c77dd8]'}`}
                    style={{ width: `${Math.max(share, 2)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
