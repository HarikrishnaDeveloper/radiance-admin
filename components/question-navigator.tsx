'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/icons'
import { GuardedLink } from '@/components/unsaved-changes'

export type NavigatorItem = {
  questionNo: number
  status: string
  snippet: string
  // Problems that stop the question going live when promoted.
  issues: string[]
}

type Filter = 'all' | 'review' | 'approved' | 'incomplete'

const FILTERS: { value: Filter; label: string; test: (i: NavigatorItem) => boolean }[] = [
  { value: 'all', label: 'All', test: () => true },
  { value: 'review', label: 'To review', test: (i) => i.status !== 'APPROVED' },
  { value: 'approved', label: 'Approved', test: (i) => i.status === 'APPROVED' },
  { value: 'incomplete', label: 'Incomplete', test: (i) => i.issues.length > 0 },
]

// Left-hand list of a paper's questions: search by number or text, filter by
// review state, and jump between questions (the current one is `?q=` in the URL).
export function QuestionNavigator({ items, current }: { items: NavigatorItem[]; current: number }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const activeRef = useRef<HTMLLIElement>(null)

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.value, items.filter(f.test).length])) as Record<Filter, number>,
    [items]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^q/, '')
    const test = FILTERS.find((f) => f.value === filter)!.test
    return items.filter(
      (i) => test(i) && (!q || String(i.questionNo) === q || i.snippet.toLowerCase().includes(query.trim().toLowerCase()))
    )
  }, [items, query, filter])

  // Keep the open question in view when arriving on the page.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [current])

  return (
    <div className="card flex max-h-80 flex-col overflow-hidden lg:max-h-[calc(100vh-3rem)]">
      <div className="space-y-2 border-b border-slate-100 p-3">
        <label className="relative block">
          <span className="sr-only">Search questions</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden>
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Q number or text…"
            className="field mt-0 py-1.5 pl-8 text-xs"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                filter === f.value
                  ? 'bg-[#7b0f91] text-[#fff]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label} <span className="opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
        {visible.map((item) => {
          const active = item.questionNo === current
          const approved = item.status === 'APPROVED'
          return (
            <li key={item.questionNo} ref={active ? activeRef : undefined}>
              <GuardedLink
                href={`?q=${item.questionNo}`}
                aria-current={active ? 'page' : undefined}
                title={item.issues.length ? item.issues.join(' · ') : undefined}
                className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition ${
                  active ? 'bg-[#7b0f91]/10 ring-1 ring-[#7b0f91]/30' : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${approved ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  aria-label={approved ? 'Approved' : 'Needs review'}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${active ? 'text-[#7b0f91] dark:text-[#c77dd8]' : 'text-slate-700'}`}>
                      Q{item.questionNo}
                    </span>
                    {item.issues.length > 0 && <Icon name="alert-triangle" className="h-3.5 w-3.5 text-amber-500" />}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{item.snippet || 'No question text yet'}</span>
                </span>
              </GuardedLink>
            </li>
          )
        })}
        {visible.length === 0 && <li className="px-3 py-8 text-center text-xs text-slate-400">No questions match.</li>}
      </ul>
    </div>
  )
}
