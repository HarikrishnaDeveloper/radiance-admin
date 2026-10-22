import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { BackendApiError } from '@/lib/backend-api'

// What every Server Action returns, so the form that called it can show a
// success or error toast (components/action-form.tsx) instead of the page
// crashing into the error boundary.
// `redirectTo` sends the browser there after the success toast — unlike
// redirect(), which navigates before the form can show one.
export type ActionResult = { ok: true; message?: string; redirectTo?: string } | { ok: false; error: string }

type Success = string | void | { message?: string; redirectTo?: string }

// Runs an action body and converts failures into a readable message.
// `fn` may return a success message to show instead of the form's default,
// or { message, redirectTo }.
export async function runAction(fn: () => Promise<Success>): Promise<ActionResult> {
  try {
    const result = await fn()
    if (result && typeof result === 'object') return { ok: true, ...result }
    return { ok: true, message: result || undefined }
  } catch (e) {
    // redirect() / notFound() work by throwing — let Next.js handle those.
    unstable_rethrow(e)
    if (e instanceof BackendApiError) return { ok: false, error: e.message }
    console.error('Server Action failed:', e)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}
