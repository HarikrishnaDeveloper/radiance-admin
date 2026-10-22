import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { AUTOPAY_ON_STATUSES, CANCELLABLE_STATUSES, formatDate, formatRupees } from '@/lib/billing'
import { cancelAutopay, setPremiumOverride, setTestUser } from '@/app/actions/users'
import { AutopayBadge, PageHeader, SubscriptionBadge } from '@/components/ui'
import { ActionForm, SubmitButton } from '@/components/action-form'
import { AttemptResult } from '@/components/attempt-result'
import {
  DURATION_LABELS,
  FOCUS_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  REFERRAL_LABELS,
  attemptKind,
  attemptLabel,
  attemptTitle,
  label,
} from '@/lib/labels'
import type { AdminUserDetail } from '@/lib/backend-api'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  )
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let user
  try {
    user = await backendApi.user(id)
  } catch (e) {
    if (e instanceof BackendApiError && e.status === 404) notFound()
    throw e
  }

  const sub = user.subscription
  const learning = user.learning
  const autopayOn = sub ? AUTOPAY_ON_STATUSES.includes(sub.status) : false
  const totalPaidPaise = user.payments.filter((p) => p.status === 'CAPTURED').reduce((n, p) => n + p.amountPaise, 0)
  const freeUsed = Math.min(user.completedStages, user.freeStageLimit)
  const access = user.isTestUser
    ? 'Full (test account)'
    : user.isPremium
      ? autopayOn
        ? 'Full (paid subscription)'
        : 'Full (granted by admin)'
      : `Free — ${freeUsed}/${user.freeStageLimit} free stages used`

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={user.name ?? 'Unnamed user'} subtitle={access} back={{ href: '/users', label: 'Users' }} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
          <div className="mt-3">
            <InfoRow
              label="Phone"
              value={
                <>
                  {user.phone ?? '—'}
                  {user.phoneVerifiedAt && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Verified</span>
                  )}
                </>
              }
            />
            <InfoRow label="Email" value={user.email ?? '—'} />
            <InfoRow label="Username" value={user.username ?? '—'} />
            <InfoRow label="State" value={user.state ?? '—'} />
            <InfoRow label="Date of birth" value={formatDate(user.dateOfBirth)} />
            <InfoRow label="Joined" value={formatDate(user.createdAt)} />
            <InfoRow label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Onboarding</h2>
            {user.profileCompleted ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Completed</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Not finished</span>
            )}
          </div>
          {user.profile ? (
            <div className="mt-3">
              <InfoRow label="Heard about us" value={label(REFERRAL_LABELS, user.profile.referralSource)} />
              <InfoRow label="Preparing for" value={label(DURATION_LABELS, user.profile.preparationDuration)} />
              <InfoRow label="Level" value={label(LEVEL_LABELS, user.profile.preparationLevel)} />
              <InfoRow label="Target attempt" value={user.profile.targetAttempt ? attemptLabel(user.profile.targetAttempt) : 'Not answered'} />
              <InfoRow label="Focus" value={label(FOCUS_LABELS, user.profile.preparationFocus)} />
              <InfoRow label="Exam" value={user.profile.targetExam.replace('_', ' ')} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Hasn’t answered the onboarding questions yet.</p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Subscription & autopay</h2>
            {sub && <SubscriptionBadge status={sub.status} />}
          </div>
          {sub ? (
            <div className="mt-3">
              <InfoRow label="Autopay" value={<AutopayBadge on={autopayOn} />} />
              <InfoRow label="Next charge" value={autopayOn ? formatDate(sub.chargeAt) : '—'} />
              <InfoRow
                label="Current period"
                value={sub.currentStart && sub.currentEnd ? `${formatDate(sub.currentStart)} – ${formatDate(sub.currentEnd)}` : '—'}
              />
              <InfoRow label="Months paid" value={sub.paidCount} />
              <InfoRow label="Total paid" value={formatRupees(totalPaidPaise)} />
              <InfoRow label="Subscribed on" value={formatDate(sub.activatedAt)} />
              <InfoRow label="Cancelled on" value={formatDate(sub.cancelledAt)} />
              <InfoRow label="Razorpay ID" value={<span className="font-mono text-xs">{sub.razorpaySubscriptionId}</span>} />
              {CANCELLABLE_STATUSES.includes(sub.status) && (
                <ActionForm
                  action={cancelAutopay.bind(null, user.id, sub.id)}
                  successTitle="Autopay cancelled"
                  errorTitle="Couldn’t cancel autopay"
                  confirm={{
                    title: 'Cancel autopay?',
                    message:
                      'This stops the user’s Razorpay autopay. They lose premium access immediately and won’t be charged again.',
                    confirmLabel: 'Cancel autopay',
                    tone: 'danger',
                  }}
                  className="mt-4"
                >
                  <SubmitButton
                    pendingLabel="Cancelling…"
                    className="btn w-full border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel autopay
                  </SubmitButton>
                </ActionForm>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Never started a subscription.</p>
          )}
        </div>
      </div>

      {learning && <LearningSection learning={learning} completedStages={user.completedStages} />}

      <div className="card mt-6">
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-900">Payment history</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Payment ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {user.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3 text-slate-600">{formatDate(p.paidAt)}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">{formatRupees(p.amountPaise)}</td>
                <td className="px-5 py-3 text-xs font-semibold text-slate-600">{p.status}</td>
                <td className="px-5 py-3 uppercase text-slate-500">{p.method ?? '—'}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.razorpayPaymentId}</td>
              </tr>
            ))}
            {user.payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionForm
          action={setTestUser.bind(null, user.id, !user.isTestUser)}
          successTitle="User updated"
          errorTitle="Couldn’t update the user"
        >
          <SubmitButton
            pendingLabel="Saving…"
            className={`btn ${user.isTestUser ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'btn-secondary'}`}
          >
            {user.isTestUser ? 'Remove test-user flag' : 'Mark as test user'}
          </SubmitButton>
        </ActionForm>

        <ActionForm
          action={setPremiumOverride.bind(null, user.id, !user.isPremium)}
          successTitle="Access updated"
          errorTitle="Couldn’t change access"
          confirm={
            user.isPremium
              ? {
                  title: 'Revoke premium access?',
                  message: 'The user drops back to the free plan straight away.',
                  confirmLabel: 'Revoke access',
                  tone: 'danger',
                }
              : undefined
          }
        >
          <SubmitButton pendingLabel="Saving…" className={`btn ${user.isPremium ? 'btn-secondary text-red-600' : 'btn-primary'}`}>
            {user.isPremium ? 'Revoke premium access' : 'Grant premium access (comp)'}
          </SubmitButton>
        </ActionForm>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        &quot;Grant premium access&quot; sets access directly and is independent of any real Razorpay subscription — use it for support cases.
        It does not charge the user or start autopay.
      </p>
    </div>
  )
}

type Learning = NonNullable<AdminUserDetail['learning']>

// What the student has done in the app: totals, their daily goals, progress
// per subject, and their latest tests.
function LearningSection({ learning, completedStages }: { learning: Learning; completedStages: number }) {
  const accuracy = learning.questionsAnswered ? Math.round((learning.questionsCorrect / learning.questionsAnswered) * 100) : null
  const tiles = [
    { label: 'Questions answered', value: learning.questionsAnswered.toLocaleString('en-IN') },
    { label: 'Accuracy', value: accuracy === null ? '—' : `${accuracy}%` },
    { label: 'Stages completed', value: completedStages },
    { label: 'Daily challenges', value: learning.dailyChallengesCompleted },
    { label: 'Bookmarks', value: learning.bookmarks },
    { label: 'Streak freezes', value: `${learning.streakFreezesAvailable} left`, hint: `${learning.streakFreezesUsed} used` },
  ]

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Learning</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4">
            <p className="text-xs font-medium text-slate-500">{t.label}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-slate-900">{t.value}</p>
            {t.hint && <p className="text-xs text-slate-400">{t.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-900">Daily study plan</h3>
          {learning.goals.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {learning.goals.map((g) => (
                <li key={g.type} className="flex justify-between gap-4 py-2 text-sm">
                  <span className="text-slate-500">{label(GOAL_LABELS, g.type)}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{g.target} / day</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No study plan set.</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-900">Progress by subject</h3>
          {learning.subjects.length ? (
            <ul className="mt-3 space-y-3">
              {learning.subjects.map((s) => (
                <li key={s.subject}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-900">{s.subject}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-500">
                      {s.completed}/{s.started} stages · {Math.round(s.accuracy)}% · {s.stars}★
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                    <div
                      className="h-full rounded-full bg-[#7b0f91] dark:bg-[#c77dd8]"
                      style={{ width: `${Math.max(Math.round(s.accuracy), 2)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Hasn’t started any stages yet.</p>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Recent tests</h3>
        </div>
        <table className="mt-3 w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Test</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Result</th>
              <th className="px-5 py-3">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {learning.recentAttempts.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 text-slate-700">{attemptTitle(a)}</td>
                <td className="px-5 py-3 text-slate-500">{attemptKind(a)}</td>
                <td className="px-5 py-3">
                  <AttemptResult attempt={a} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatDate(a.startedAt)}</td>
              </tr>
            ))}
            {learning.recentAttempts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  No tests taken yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
