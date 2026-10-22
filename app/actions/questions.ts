'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/dal'
import { BackendApiError, backendApi } from '@/lib/backend-api'
import { runAction, type ActionResult } from '@/lib/action-result'

export async function updateDraftQuestion(paperId: number, draftId: number, formData: FormData): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    const text = String(formData.get('text') ?? '').trim()
    if (!text) throw new BackendApiError(400, 'The question text can’t be empty.')

    // The editor's "Approve & next" button: approve, then open the next question.
    const approveAndNext = formData.get('intent') === 'approve-next'
    const status = approveAndNext ? 'APPROVED' : String(formData.get('status') ?? 'NEEDS_REVIEW')
    const nextQ = Number(formData.get('nextQ'))

    await backendApi.updateDraft(draftId, {
      text,
      // Sent even when blank: an option that is only a picture has no text.
      optionA: String(formData.get('optionA') ?? '').trim(),
      optionB: String(formData.get('optionB') ?? '').trim(),
      optionC: String(formData.get('optionC') ?? '').trim(),
      optionD: String(formData.get('optionD') ?? '').trim(),
      // "" clears an image; the backend rejects anything that isn't a path.
      questionImage: String(formData.get('questionImage') ?? ''),
      optionAImage: String(formData.get('optionAImage') ?? ''),
      optionBImage: String(formData.get('optionBImage') ?? ''),
      optionCImage: String(formData.get('optionCImage') ?? ''),
      optionDImage: String(formData.get('optionDImage') ?? ''),
      // "" clears it: the editor's "No correct answer" choice (a dropped question).
      correctAnswer: String(formData.get('correctAnswer') ?? '').trim().toUpperCase(),
      categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined,
      status,
      explanation: String(formData.get('explanation') ?? '').trim() || undefined,
      revisionPoints: String(formData.get('revisionPoints') ?? '').trim() || undefined,
    })

    revalidatePath(`/questions/${paperId}`)
    revalidatePath('/questions')
    if (approveAndNext) {
      return {
        message: 'Approved — it goes live on the next promote.',
        redirectTo: Number.isInteger(nextQ) && nextQ > 0 ? `/questions/${paperId}?q=${nextQ}` : undefined,
      }
    }
    return status === 'APPROVED' ? 'Approved — it goes live on the next promote.' : undefined
  })
}

// Uploads a question/option image picked in ImageField and returns the path
// to store on the draft. Errors are returned, not thrown, so the field can
// show them inline.
export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  await verifyAdminSession()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'No image selected' }
  try {
    return await backendApi.uploadImage(file)
  } catch (e) {
    return { error: e instanceof BackendApiError ? e.message : 'Upload failed' }
  }
}

export async function promotePaper(paperId: number): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    const { promoted, skipped, retained } = await backendApi.promotePaper(paperId)
    revalidatePath(`/questions/${paperId}`)
    revalidatePath('/questions')

    const notes = [`${promoted} question${promoted === 1 ? '' : 's'} are live.`]
    if (skipped.length) notes.push(`Skipped incomplete: Q${skipped.join(', Q')}.`)
    if (retained?.length) notes.push(`Kept (already in use): Q${retained.join(', Q')}.`)
    return notes.join(' ')
  })
}

export async function createPaper(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    const created = await backendApi.createPaper({
      year: Number(formData.get('year')),
      name: String(formData.get('name') ?? ''),
      set: String(formData.get('set') ?? '').trim() || undefined,
    })
    revalidatePath('/questions')
    redirect(`/questions/${created.id}`)
  })
}

// Adds a blank question to the end of the paper, then jumps to it.
export async function addDraftQuestion(paperId: number): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    const draft = await backendApi.addDraft(paperId)
    revalidatePath(`/questions/${paperId}`)
    revalidatePath('/questions')
    redirect(`/questions/${paperId}?q=${draft.questionNo}`)
  })
}

// Deletes a draft question, then opens `goToQ` (a neighbouring question).
export async function deleteDraftQuestion(
  paperId: number,
  draftId: number,
  questionNo: number,
  goToQ: number | null
): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.deleteDraft(draftId)
    revalidatePath(`/questions/${paperId}`)
    revalidatePath('/questions')
    return {
      message: `Q${questionNo} was removed. Promote the paper to take it out of the app too.`,
      redirectTo: goToQ ? `/questions/${paperId}?q=${goToQ}` : `/questions/${paperId}`,
    }
  })
}
