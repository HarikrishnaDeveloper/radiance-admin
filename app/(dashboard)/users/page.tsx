import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { formatDate } from '@/lib/billing'
import { FilterTabs, Pagination, SearchBox, SubscriptionBadge } from '@/components/ui'

const FILTERS = ['all', 'premium', 'free', 'test']

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>
}) {
  const { q, page: pageParam, filter: filterParam } = await searchParams
  const filter = FILTERS.includes(filterParam ?? '') ? filterParam! : 'all'
  const page = Math.max(1, Number(pageParam) || 1)

  const [{ users, total, pageSize }, stats] = await Promise.all([
    backendApi.users({ q, page, filter: filter === 'all' ? undefined : filter }),
    backendApi.stats(),
  ])
  const filterParams = { q, filter: filter === 'all' ? undefined : filter }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-500">{total.toLocaleString('en-IN')} matching</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/users"
          current={filter}
          params={{ q }}
          options={[
            { value: 'all', label: 'All', count: stats.users.total },
            { value: 'premium', label: 'Premium', count: stats.users.premium },
            { value: 'free', label: 'Free', count: stats.users.free },
            { value: 'test', label: 'Test', count: stats.users.test },
          ]}
        />
        <SearchBox defaultValue={q} placeholder="Search name, phone, email, username…" hidden={{ filter: filterParams.filter }} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone / Username</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="font-medium text-indigo-600 hover:underline">
                    {user.name ?? '—'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.phone ?? user.username ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {user.isTestUser && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Test</span>
                    )}
                    {user.isPremium && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Premium</span>
                    )}
                    {!user.isTestUser && !user.isPremium && <span className="text-xs text-slate-400">Free</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.subscription ? <SubscriptionBadge status={user.subscription.status} /> : <span className="text-xs text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/users" page={page} total={total} pageSize={pageSize} params={filterParams} />
    </div>
  )
}
