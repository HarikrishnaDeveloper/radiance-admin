import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { readSession } from '@/lib/session'

// Secure check — call this (not the optimistic proxy check) before any data
// access in a page, layout, or Server Action. Memoized per request so calling
// it from multiple places in one render doesn't re-verify the JWT repeatedly.
export const verifyAdminSession = cache(async () => {
  const session = await readSession()
  if (!session) redirect('/login')
  return session
})
