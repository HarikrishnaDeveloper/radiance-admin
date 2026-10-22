import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { toggleStagePublished, updateCategory } from '@/app/actions/categories'
import { ActionForm, SubmitButton } from '@/components/action-form'

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

      <ActionForm
        action={updateCategory.bind(null, categoryId)}
        successTitle="Category saved"
        errorTitle="Couldn’t save the category"
        className="card mt-6 p-5"
      >
        <h2 className="text-sm font-semibold text-slate-900">Presentation</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="col-span-2 field-label">
            Name
            <input name="name" required defaultValue={category.name} className="field" />
          </label>
          <label className="field-label">
            Display name (food-world)
            <input
              name="foodWorldName"
              defaultValue={category.foodWorldName ?? ''}
              className="field"
            />
          </label>
          <label className="field-label">
            Icon
            <input name="icon" defaultValue={category.icon ?? ''} className="field" />
          </label>
          <label className="field-label">
            Color
            <input name="color" defaultValue={category.color ?? ''} className="field" />
          </label>
          <label className="field-label">
            Display order
            <input
              type="number"
              name="displayOrder"
              defaultValue={category.displayOrder}
              className="field"
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="rounded border-slate-300" />
          Active (visible in the app)
        </label>
        <div className="mt-4">
          <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
        </div>
      </ActionForm>

      <div className="card mt-6 p-5">
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
              <ActionForm
                action={toggleStagePublished.bind(null, categoryId, stage.id, !stage.isPublished)}
                successTitle={stage.isPublished ? "Stage unpublished" : "Stage published"}
                errorTitle="Couldn’t update the stage"
              >
                <SubmitButton
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    stage.isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {stage.isPublished ? "Published" : "Unpublished"}
                </SubmitButton>
              </ActionForm>
            </div>
          ))}
          {category.stages.length === 0 && <p className="py-4 text-sm text-slate-400">No stages built yet for this category.</p>}
        </div>
      </div>
    </div>
  )
}
