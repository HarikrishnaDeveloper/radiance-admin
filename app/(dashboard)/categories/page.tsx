import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'
import { NewCategoryForm } from '@/components/create-forms'
import { PageHeader } from '@/components/ui'

export default async function CategoriesPage() {
  const categories = await backendApi.categories()

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Categories" subtitle={`${categories.length} subjects`} />

      <NewCategoryForm />

      <div className="mt-6 overflow-hidden card">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Questions</th>
              <th className="px-5 py-3.5">Stages</th>
              <th className="px-5 py-3.5">Active</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <span className="font-medium text-slate-900">{category.name}</span>
                  {category.foodWorldName && <span className="ml-2 text-xs text-slate-400">({category.foodWorldName})</span>}
                </td>
                <td className="px-5 py-3.5 text-slate-500">{category.questionCount}</td>
                <td className="px-5 py-3.5 text-slate-500">{category.stageCount}</td>
                <td className="px-5 py-3.5">
                  {category.isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Inactive</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/categories/${category.id}`} className="text-sm font-medium text-[#7b0f91] hover:underline dark:text-[#c77dd8]">
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
