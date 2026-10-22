import { formatRupees } from '@/lib/billing'

type Month = { month: string; amountPaise: number; payments: number }

function monthLabel(key: string, withYear = false): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', withYear ? { month: 'long', year: 'numeric' } : { month: 'short' })
}

// Single-series column chart of collected revenue per month, drawn inside a
// dashboard tile. One brand hue (lighter in dark mode); 4px rounded tops on a
// shared baseline; only the latest month carries a value label — the rest are
// read via hover, or the screen-reader table.
export function RevenueChart({ months }: { months: Month[] }) {
  const max = Math.max(...months.map((m) => m.amountPaise), 1)
  const latest = months.length - 1

  return (
    <figure className="flex h-full flex-col">
      <div className="flex flex-1 items-end gap-3 border-b border-slate-200 pt-8" aria-hidden>
        {months.map((m, i) => {
          const heightPct = (m.amountPaise / max) * 100
          return (
            <div key={m.month} className="group relative flex h-full min-h-36 flex-1 items-end justify-center">
              {i === latest && m.amountPaise > 0 && (
                <span
                  className="absolute whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white"
                  style={{ bottom: `calc(${heightPct}% + 8px)` }}
                >
                  {formatRupees(m.amountPaise)}
                </span>
              )}
              <div
                className="w-full max-w-7 rounded-t-[4px] bg-[#7b0f91] transition-opacity group-hover:opacity-80 dark:bg-[#c77dd8]"
                style={{ height: `${Math.max(heightPct, m.amountPaise > 0 ? 2 : 0)}%` }}
              />
              {/* Hit target spans the whole column, not just the bar. */}
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
      <div className="mt-3 flex gap-3" aria-hidden>
        {months.map((m, i) => (
          <span
            key={m.month}
            className={`flex-1 rounded-full py-1 text-center text-[11px] font-medium ${
              i === latest ? 'bg-slate-900 text-white' : 'text-slate-400'
            }`}
          >
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
