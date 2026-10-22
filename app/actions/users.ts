'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'
import { runAction, type ActionResult } from '@/lib/action-result'

export async function setTestUser(userId: string, isTestUser: boolean): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.updateUser(userId, { isTestUser })
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return isTestUser ? 'Marked as a test user.' : 'No longer a test user.'
  })
}

// Stops the user's Razorpay autopay immediately and revokes paid access.
export async function cancelAutopay(userId: string, subscriptionId: string): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.cancelSubscription(subscriptionId)
    revalidatePath('/subscriptions')
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return 'Autopay cancelled and paid access removed.'
  })
}

// Manual comp/override — independent of the Subscription row, for support
// cases (e.g. refund goodwill, press/partner access). Distinct from a real
// paid subscription: cancelling from /paywall on the app only touches the
// Subscription row, so an override survives that, and this is the one place
// that can flip isPremium without a real Razorpay payment behind it.
export async function setPremiumOverride(userId: string, isPremium: boolean): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.updateUser(userId, { isPremium })
    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return isPremium ? 'Premium access granted.' : 'Premium access removed.'
  })
}
