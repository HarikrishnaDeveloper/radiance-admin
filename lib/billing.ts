// Mirrors MONTHLY_PLAN_AMOUNT_PAISE in radiance-backend/lib/razorpay.ts.
export const MONTHLY_AMOUNT_PAISE = 3000
export const MONTHLY_AMOUNT_RUPEES = MONTHLY_AMOUNT_PAISE / 100

export function formatRupees(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: rupees % 1 === 0 ? 0 : 2 })}`
}

export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

// Razorpay subscription statuses in admin terms.
export const SUBSCRIPTION_STATUS: Record<string, { label: string; className: string; hint: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700', hint: 'Autopay on, paid for the current month' },
  AUTHENTICATED: { label: 'Mandate set', className: 'bg-sky-100 text-sky-700', hint: 'Autopay approved, first charge pending' },
  PENDING: { label: 'Payment retrying', className: 'bg-amber-100 text-amber-700', hint: 'Renewal failed, Razorpay is retrying' },
  HALTED: { label: 'Payment failed', className: 'bg-orange-100 text-orange-700', hint: 'All renewal retries failed' },
  CREATED: { label: 'Checkout abandoned', className: 'bg-slate-100 text-slate-600', hint: 'Started checkout but never paid' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700', hint: 'Autopay stopped' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600', hint: 'All billing cycles finished' },
  EXPIRED: { label: 'Expired', className: 'bg-red-100 text-red-700', hint: 'Mandate expired' },
}

export const AUTOPAY_ON_STATUSES = ['ACTIVE', 'AUTHENTICATED']
export const CANCELLABLE_STATUSES = ['ACTIVE', 'AUTHENTICATED', 'PENDING', 'HALTED']
