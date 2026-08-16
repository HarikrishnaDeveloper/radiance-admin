'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'

export async function updateDraftQuestion(paperId: number, draftId: number, formData: FormData): Promise<void> {
  await verifyAdminSession()

  await backendApi.updateDraft(draftId, {
    text: String(formData.get('text') ?? '').trim(),
    optionA: String(formData.get('optionA') ?? '').trim() || undefined,
    optionB: String(formData.get('optionB') ?? '').trim() || undefined,
    optionC: String(formData.get('optionC') ?? '').trim() || undefined,
    optionD: String(formData.get('optionD') ?? '').trim() || undefined,
    correctAnswer: String(formData.get('correctAnswer') ?? '').trim().toUpperCase() || undefined,
    categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined,
    status: String(formData.get('status') ?? 'NEEDS_REVIEW'),
  })

  revalidatePath(`/questions/${paperId}`)
}

export async function promotePaper(paperId: number): Promise<void> {
  await verifyAdminSession()
  await backendApi.promotePaper(paperId)
  revalidatePath(`/questions/${paperId}`)
  revalidatePath('/questions')
}
