'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'
import { runAction, type ActionResult } from '@/lib/action-result'

export async function updateCategory(categoryId: number, formData: FormData): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.updateCategory(categoryId, {
      name: String(formData.get('name') ?? '').trim() || undefined,
      foodWorldName: String(formData.get('foodWorldName') ?? '').trim() || undefined,
      icon: String(formData.get('icon') ?? '').trim() || undefined,
      color: String(formData.get('color') ?? '').trim() || undefined,
      displayOrder: Number(formData.get('displayOrder') ?? 0),
      isActive: formData.get('isActive') === 'on',
    })

    revalidatePath('/categories')
    revalidatePath(`/categories/${categoryId}`)
  })
}

export async function toggleStagePublished(categoryId: number, stageId: number, isPublished: boolean): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.updateStage(stageId, { isPublished })
    revalidatePath(`/categories/${categoryId}`)
    return isPublished ? 'The stage is now visible in the app.' : 'The stage is hidden from the app.'
  })
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    const created = await backendApi.createCategory({
      name: String(formData.get('name') ?? '').trim(),
      foodWorldName: String(formData.get('foodWorldName') ?? '').trim() || undefined,
    })
    revalidatePath('/categories')
    redirect(`/categories/${created.id}`)
  })
}
