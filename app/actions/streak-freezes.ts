'use server'

import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/dal'
import { backendApi } from '@/lib/backend-api'
import { runAction, type ActionResult } from '@/lib/action-result'

// Saves the streak freeze rules. The price is entered in rupees and stored in
// paise; the backend checks each value is in range.
export async function updateStreakFreezeSettings(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession()

  return runAction(async () => {
    await backendApi.updateStreakFreezeSettings({
      freePerMonth: Number(formData.get('freePerMonth')),
      pricePaise: Math.round(Number(formData.get('priceRupees')) * 100),
      maxPaid: Number(formData.get('maxPaid')),
    })
    revalidatePath('/streak-freezes')
    return 'Students see the new price and limit right away; a new free allowance applies from their next monthly refill.'
  })
}
