'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'

export async function setTestUser(userId: string, isTestUser: boolean): Promise<void> {
  await verifyAdminSession()
  await backendApi.updateUser(userId, { isTestUser })
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}

// Manual comp/override — independent of the Subscription row, for support
// cases (e.g. refund goodwill, press/partner access). Distinct from a real
// paid subscription: cancelling from /paywall on the app only touches the
// Subscription row, so an override survives that, and this is the one place
// that can flip isPremium without a real Razorpay payment behind it.
export async function setPremiumOverride(userId: string, isPremium: boolean): Promise<void> {
  await verifyAdminSession()
  await backendApi.updateUser(userId, { isPremium })
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}
