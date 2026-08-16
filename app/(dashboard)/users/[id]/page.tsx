import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { setPremiumOverride, setTestUser } from '@/app/actions/users'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
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

  return (
    <div className="max-w-2xl">
      <Link href="/users" className="text-sm text-slate-500 hover:underline">
        ← Back to users
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{user.name ?? 'Unnamed user'}</h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <InfoRow label="User ID" value={user.id} />
        <InfoRow label="Phone" value={user.phone ?? '—'} />
        <InfoRow label="Username" value={user.username ?? '—'} />
        <InfoRow label="Email" value={user.email ?? '—'} />
        <InfoRow label="State" value={user.state ?? '—'} />
        <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleString('en-IN')} />
        <InfoRow label="Stages completed" value={String(user.completedStages)} />
        <InfoRow label="Quiz attempts" value={String(user.quizAttempts)} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Subscription</h2>
        {user.subscription ? (
          <div className="mt-3 space-y-1 text-sm">
            <InfoRow label="Status" value={user.subscription.status} />
            <InfoRow label="Razorpay subscription" value={user.subscription.razorpaySubscriptionId} />
            <InfoRow
              label="Current period"
              value={
                user.subscription.currentStart && user.subscription.currentEnd
                  ? `${new Date(user.subscription.currentStart).toLocaleDateString('en-IN')} – ${new Date(user.subscription.currentEnd).toLocaleDateString('en-IN')}`
                  : '—'
              }
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No subscription on file.</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <form action={setTestUser.bind(null, user.id, !user.isTestUser)}>
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              user.isTestUser ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {user.isTestUser ? 'Remove test-user flag' : 'Mark as test user'}
          </button>
        </form>

        <form action={setPremiumOverride.bind(null, user.id, !user.isPremium)}>
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              user.isPremium ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {user.isPremium ? 'Revoke premium access' : 'Grant premium access (comp)'}
          </button>
        </form>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        &quot;Grant premium access&quot; sets access directly and is independent of any real Razorpay subscription — use it for support cases.
      </p>
    </div>
  )
}
