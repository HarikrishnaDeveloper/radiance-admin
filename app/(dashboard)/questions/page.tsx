import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { NewPaperForm } from '@/components/create-forms'

export default async function QuestionsPage() {
  const papers = await backendApi.papers()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
      <p className="mt-1 text-sm text-slate-500">
        Papers imported through the backend&apos;s PDF pipeline or added here — review drafts and promote to live.
      </p>

      <NewPaperForm />

      <div className="mt-6 overflow-hidden card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Paper</th>
              <th className="px-4 py-3">Drafts</th>
              <th className="px-4 py-3">Needs review</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper) => (
              <tr key={paper.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {paper.year} {paper.name}
                  {paper.set ? ` (Set ${paper.set})` : ''}
                </td>
                <td className="px-4 py-3 text-slate-500">{paper.draftCount}</td>
                <td className="px-4 py-3">
                  {paper.needsReview > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{paper.needsReview} pending</span>
                  ) : (
                    <span className="text-xs text-slate-400">All reviewed</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/questions/${paper.id}`} className="text-sm font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No papers yet. Add one above, or import a PDF with radiance-backend&apos;s importer (/importer).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
