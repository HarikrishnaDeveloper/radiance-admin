import Link from 'next/link'
import { backendApi } from '@/lib/backend-api'

export default async function CategoriesPage() {
  const categories = await backendApi.categories()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">Subjects and their stage breakdown.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Stages</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{category.name}</span>
                  {category.foodWorldName && <span className="ml-2 text-xs text-slate-400">({category.foodWorldName})</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{category.questionCount}</td>
                <td className="px-4 py-3 text-slate-500">{category.stageCount}</td>
                <td className="px-4 py-3">
                  {category.isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/categories/${category.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
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
