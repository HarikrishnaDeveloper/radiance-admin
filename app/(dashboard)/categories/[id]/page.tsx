import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { toggleStagePublished, updateCategory } from '@/app/actions/categories'

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const categoryId = Number(idParam)

  let category
  try {
    category = await backendApi.category(categoryId)
  } catch (e) {
    if (e instanceof BackendApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="max-w-2xl">
      <Link href="/categories" className="text-sm text-slate-500 hover:underline">
        ← All categories
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{category.name}</h1>

      <form action={updateCategory.bind(null, categoryId)} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Presentation</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-slate-500">
            Display name (food-world)
            <input
              name="foodWorldName"
              defaultValue={category.foodWorldName ?? ''}
              className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Icon
            <input name="icon" defaultValue={category.icon ?? ''} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Color
            <input name="color" defaultValue={category.color ?? ''} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Display order
            <input
              type="number"
              name="displayOrder"
              defaultValue={category.displayOrder}
              className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="rounded border-slate-300" />
          Active (visible in the app)
        </label>
        <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Save
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Stages</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {category.stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="font-medium text-slate-900">
                  Stage {stage.stageNumber}: {stage.title}
                </span>
                <span className="ml-2 text-xs text-slate-400">{stage.questionCount} questions · {stage.rewardStars}★</span>
              </div>
              <form action={toggleStagePublished.bind(null, categoryId, stage.id, !stage.isPublished)}>
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    stage.isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {stage.isPublished ? 'Published' : 'Unpublished'}
                </button>
              </form>
            </div>
          ))}
          {category.stages.length === 0 && <p className="py-4 text-sm text-slate-400">No stages built yet for this category.</p>}
        </div>
      </div>
    </div>
  )
}
