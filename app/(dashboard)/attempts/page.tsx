import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { attemptKind, attemptTitle } from '@/lib/labels'
import { FilterTabs, PageHeader, Pagination, SearchBox, userLabel } from '@/components/ui'
import { AttemptResult } from '@/components/attempt-result'

const FILTERS = ['all', 'exam', 'paper', 'category', 'unfinished']

// Every test and practice session students have started, newest first.
export default async function AttemptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>
}) {
  const { q, page: pageParam, filter: filterParam } = await searchParams
  const filter = FILTERS.includes(filterParam ?? '') ? filterParam! : 'all'
  const page = Math.max(1, Number(pageParam) || 1)

  const { attempts, total, pageSize, counts } = await backendApi.attempts({
    q,
    page,
    filter: filter === 'all' ? undefined : filter,
  })
  const filterParams = { q, filter: filter === 'all' ? undefined : filter }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Tests & practice" subtitle={`${total.toLocaleString('en-IN')} sessions`} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/attempts"
          current={filter}
          params={{ q }}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'exam', label: 'Exam mode', count: counts.exam },
            { value: 'paper', label: 'Paper practice', count: counts.paper },
            { value: 'category', label: 'Subject practice', count: counts.category },
            { value: 'unfinished', label: 'Unfinished', count: counts.unfinished },
          ]}
        />
        <SearchBox defaultValue={q} placeholder="Student name, phone…" hidden={{ filter: filterParams.filter }} />
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Test</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Result</th>
              <th className="px-5 py-3.5">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.map((a) => (
              <tr key={a.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <Link href={`/users/${a.user.id}`} className="font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                    {userLabel(a.user)}
                  </Link>
                  {a.user.isTestUser && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Test</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-700">{attemptTitle(a)}</td>
                <td className="px-5 py-3.5 text-slate-500">{attemptKind(a)}</td>
                <td className="px-5 py-3.5">
                  <AttemptResult attempt={a} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {new Date(a.startedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No tests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/attempts" page={page} total={total} pageSize={pageSize} params={filterParams} />
    </div>
  )
}
