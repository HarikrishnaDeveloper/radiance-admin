import type { AdminAttempt } from '@/lib/backend-api'

// Outcome of one test session: UPSC score for exam mode, accuracy otherwise,
// or an "In progress" badge when it was never finished.
export function AttemptResult({ attempt: a }: { attempt: AdminAttempt }) {
  if (!a.completedAt) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Unfinished</span>
  }
  const answered = a.correctCount + a.wrongCount
  const accuracy = answered ? Math.round((a.correctCount / answered) * 100) : 0
  return (
    <span className="whitespace-nowrap">
      {a.score !== null && a.maxScore ? (
        <span className="font-semibold tabular-nums text-slate-900">
          {Math.round(a.score * 100) / 100}
          <span className="font-normal text-slate-400"> / {a.maxScore}</span>
        </span>
      ) : (
        <span className="font-semibold tabular-nums text-slate-900">
          {a.correctCount}
          <span className="font-normal text-slate-400"> / {a.totalQuestions}</span>
        </span>
      )}
      <span className="ml-2 text-xs tabular-nums text-slate-500">{accuracy}% accuracy</span>
    </span>
  )
}
