import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { NewPaperForm } from '@/components/create-forms'
import { PageHeader } from '@/components/ui'

export default async function QuestionsPage() {
  const papers = await backendApi.papers()

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Questions" subtitle={`${papers.length} papers`} />

      <NewPaperForm />

      <div className="mt-6 overflow-hidden card">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Paper</th>
              <th className="px-5 py-3.5">Drafts</th>
              <th className="px-5 py-3.5">Needs review</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper) => (
              <tr key={paper.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {paper.year} {paper.name}
                  {paper.set ? ` (Set ${paper.set})` : ''}
                </td>
                <td className="px-5 py-3.5 text-slate-500">{paper.draftCount}</td>
                <td className="px-5 py-3.5">
                  {paper.needsReview > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{paper.needsReview} pending</span>
                  ) : (
                    <span className="text-xs text-slate-400">All reviewed</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
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
