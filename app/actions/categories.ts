'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'

export async function updateCategory(categoryId: number, formData: FormData): Promise<void> {
  await verifyAdminSession()

  await backendApi.updateCategory(categoryId, {
    foodWorldName: String(formData.get('foodWorldName') ?? '').trim() || undefined,
    icon: String(formData.get('icon') ?? '').trim() || undefined,
    color: String(formData.get('color') ?? '').trim() || undefined,
    displayOrder: Number(formData.get('displayOrder') ?? 0),
    isActive: formData.get('isActive') === 'on',
  })

  revalidatePath('/categories')
  revalidatePath(`/categories/${categoryId}`)
}

export async function toggleStagePublished(categoryId: number, stageId: number, isPublished: boolean): Promise<void> {
  await verifyAdminSession()
  await backendApi.updateStage(stageId, { isPublished })
  revalidatePath(`/categories/${categoryId}`)
}
