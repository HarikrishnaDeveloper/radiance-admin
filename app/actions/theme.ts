'use server'

import { cookies } from 'next/headers'

// Persists the admin's light/dark choice; read by the root and dashboard
// layouts so pages render in the right theme on first paint.
export async function saveTheme(theme: 'light' | 'dark'): Promise<void> {
  ;(await cookies()).set('theme', theme === 'dark' ? 'dark' : 'light', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
