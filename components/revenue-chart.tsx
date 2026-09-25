import { formatRupees } from '@/lib/billing'

type Month = { month: string; amountPaise: number; payments: number }

function monthLabel(key: string, withYear = false): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', withYear ? { month: 'long', year: 'numeric' } : { month: 'short' })
}

// Single-series column chart of collected revenue per month. Columns are
// capped at 24px, grow from one baseline, and only the latest month carries a
// value label — the rest are read via hover (or the screen-reader table).
export function RevenueChart({ months }: { months: Month[] }) {
  const max = Math.max(...months.map((m) => m.amountPaise), 1)
  const latest = months.length - 1

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-5">
      <figcaption className="text-sm font-medium text-slate-500">Revenue collected per month</figcaption>

      <div className="mt-6 flex h-44 items-end gap-2 border-b border-slate-200" aria-hidden>
        {months.map((m, i) => {
          const heightPct = (m.amountPaise / max) * 100
          return (
            <div key={m.month} className="group relative flex h-full flex-1 items-end justify-center">
              {i === latest && m.amountPaise > 0 && (
                <span
                  className="absolute text-xs font-semibold tabular-nums text-slate-900"
                  style={{ bottom: `calc(${heightPct}% + 6px)` }}
                >
                  {formatRupees(m.amountPaise)}
                </span>
              )}
              <div
                className="w-full max-w-6 rounded-t bg-[var(--chart-1)] transition-opacity group-hover:opacity-80"
                style={{ height: `${Math.max(heightPct, m.amountPaise > 0 ? 2 : 0)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                <p className="font-semibold">{monthLabel(m.month, true)}</p>
                <p className="mt-0.5 tabular-nums">{formatRupees(m.amountPaise)}</p>
                <p className="tabular-nums text-slate-300">
                  {m.payments} payment{m.payments === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden>
        {months.map((m) => (
          <span key={m.month} className="flex-1 text-center text-xs text-slate-500">
            {monthLabel(m.month)}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Revenue collected per month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Payments</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <td>{monthLabel(m.month, true)}</td>
              <td>{formatRupees(m.amountPaise)}</td>
              <td>{m.payments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
