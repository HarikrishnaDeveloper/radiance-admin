import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { AUTOPAY_ON_STATUSES, CANCELLABLE_STATUSES, formatDate, formatRupees } from '@/lib/billing'
import { cancelAutopay, setPremiumOverride, setTestUser } from '@/app/actions/users'
import { AutopayBadge, SubscriptionBadge } from '@/components/ui'
import { ActionForm, SubmitButton } from '@/components/action-form'

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
    <div className="max-w-5xl">
      <Link href="/users" className="text-sm text-slate-500 hover:text-[#7b0f91]">
        ← Back to users
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{user.name ?? 'Unnamed user'}</h1>
      <p className="mt-1 text-sm text-slate-500">{access}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
          <div className="mt-3">
            <InfoRow label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
            <InfoRow label="Phone" value={user.phone ?? '—'} />
            <InfoRow label="Username" value={user.username ?? '—'} />
            <InfoRow label="Email" value={user.email ?? '—'} />
            <InfoRow label="State" value={user.state ?? '—'} />
            <InfoRow
              label="Profile Status"
              value={
                user.profileCompleted ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Completed
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Pending
                  </span>
                )
              }
            />
            {user.profile && (
              <>
                <InfoRow label="Target Exam" value={user.profile.targetExam} />
                <InfoRow label="Prep Level" value={user.profile.preparationLevel} />
                <InfoRow label="Target Attempt" value={user.profile.targetAttempt ?? 'Not decided'} />
                <InfoRow label="Focus" value={user.profile.preparationFocus} />
              </>
            )}
            <InfoRow label="Joined" value={formatDate(user.createdAt)} />
            <InfoRow label="Stages completed" value={user.completedStages} />
            <InfoRow label="Quiz attempts" value={user.quizAttempts} />
          </div>
        </div>

        <div className="card p-5">
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

      <div className="mt-6 card">
        <h2 className="px-5 pt-5 text-sm font-semibold text-slate-900">Payment history</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2">Date</th>
              <th className="px-5 py-2 text-right">Amount</th>
              <th className="px-5 py-2">Status</th>
              <th className="px-5 py-2">Method</th>
              <th className="px-5 py-2">Payment ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {user.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-2 text-slate-600">{formatDate(p.paidAt)}</td>
                <td className="px-5 py-2 text-right font-medium tabular-nums">{formatRupees(p.amountPaise)}</td>
                <td className="px-5 py-2 text-xs font-semibold text-slate-600">{p.status}</td>
                <td className="px-5 py-2 uppercase text-slate-500">{p.method ?? '—'}</td>
                <td className="px-5 py-2 font-mono text-xs text-slate-400">{p.razorpayPaymentId}</td>
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
