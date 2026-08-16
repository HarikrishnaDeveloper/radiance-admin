import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { promotePaper, updateDraftQuestion } from '@/app/actions/questions'

export default async function PaperReviewPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId: paperIdParam } = await params
  const paperId = Number(paperIdParam)

  let data
  try {
    data = await backendApi.paperDrafts(paperId)
  } catch (e) {
    if (e instanceof BackendApiError && e.status === 404) notFound()
    throw e
  }

  const { paper, drafts, categories, liveCount } = data
  const approvedCount = drafts.filter((d) => d.status === 'APPROVED').length

  return (
    <div>
      <Link href="/questions" className="text-sm text-slate-500 hover:underline">
        ← All papers
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {paper.year} {paper.name}
            {paper.set ? ` (Set ${paper.set})` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {drafts.length} drafts · {approvedCount} approved · {liveCount} currently live
          </p>
        </div>
        <form action={promotePaper.bind(null, paperId)}>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Promote approved to live ({approvedCount})
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {drafts.map((draft) => (
          <form
            key={draft.id}
            action={updateDraftQuestion.bind(null, paperId, draft.id)}
            className={`rounded-2xl border bg-white p-5 ${
              draft.status === 'APPROVED' ? 'border-emerald-200' : 'border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Q{draft.questionNo}</span>
              <select
                name="status"
                defaultValue={draft.status}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                  draft.status === 'APPROVED'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-amber-300 bg-amber-50 text-amber-700'
                }`}
              >
                <option value="NEEDS_REVIEW">NEEDS REVIEW</option>
                <option value="APPROVED">APPROVED</option>
              </select>
            </div>

            <textarea
              name="text"
              defaultValue={draft.text}
              rows={2}
              className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm"
            />

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input name="optionA" defaultValue={draft.optionA ?? ''} placeholder="(a)" className="rounded-lg border border-slate-200 p-2 text-xs" />
              <input name="optionB" defaultValue={draft.optionB ?? ''} placeholder="(b)" className="rounded-lg border border-slate-200 p-2 text-xs" />
              <input name="optionC" defaultValue={draft.optionC ?? ''} placeholder="(c)" className="rounded-lg border border-slate-200 p-2 text-xs" />
              <input name="optionD" defaultValue={draft.optionD ?? ''} placeholder="(d)" className="rounded-lg border border-slate-200 p-2 text-xs" />
            </div>

            <div className="mt-2 flex items-center gap-3">
              <label className="text-xs font-medium text-slate-500">
                Answer
                <input
                  name="correctAnswer"
                  defaultValue={draft.correctAnswer ?? ''}
                  maxLength={1}
                  className="ml-2 w-12 rounded-lg border border-slate-200 p-1.5 text-center text-sm font-bold"
                />
              </label>
              <label className="flex-1 text-xs font-medium text-slate-500">
                Category
                <select
                  name="categoryId"
                  defaultValue={draft.categoryId ?? ''}
                  className="ml-2 rounded-lg border border-slate-200 p-1.5 text-sm"
                >
                  <option value="">— none —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                Save
              </button>
            </div>
          </form>
        ))}
        {drafts.length === 0 && <p className="text-sm text-slate-400">No draft questions for this paper.</p>}
      </div>
    </div>
  )
}
