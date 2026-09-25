import 'server-only'

const BACKEND_URL = process.env.BACKEND_URL ?? ''

export class BackendApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) throw new Error('ADMIN_API_KEY is not set')

  let response: Response
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-api-key': apiKey,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      // A redirect means we hit a web app (e.g. this admin's own /login), not the API.
      redirect: 'manual',
    })
  } catch {
    throw new BackendApiError(503, `Cannot reach radiance-backend at ${BACKEND_URL} — is it running?`)
  }

  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new BackendApiError(
      502,
      `${BACKEND_URL}${path} did not return JSON (HTTP ${response.status}) — check BACKEND_URL points at radiance-backend, not this admin app`
    )
  }

  if (!response.ok) {
    throw new BackendApiError(response.status, data?.error ?? 'Request to backend failed')
  }
  return data as T
}

// ─── Types (mirrors radiance-backend/app/api/admin/* response shapes) ────

export type AdminStats = {
  planAmountPaise: number
  freeStageLimit: number
  users: {
    total: number
    test: number
    premium: number
    comp: number
    free: number
    newToday: number
    newThisMonth: number
    hitFreeLimitNotSubscribed: number
  }
  subscriptions: {
    byStatus: Record<string, number>
    autopayOn: number
    paymentIssues: number
    ended: number
    everSubscribed: number
    newThisMonth: number
    cancelledThisMonth: number
    renewalsNext7Days: number
    conversionRate: number
  }
  revenue: {
    mrrPaise: number
    totalPaise: number
    totalPayments: number
    thisMonthPaise: number
    thisMonthPayments: number
    monthly: { month: string; amountPaise: number; payments: number }[]
  }
  usage: {
    activeUsersToday: number
    activeUsers7d: number
    stagesCompletedToday: number
    quizAttemptsToday: number
  }
  content: {
    draftsNeedingReview: number
    liveQuestions: number
  }
}

export type AdminUserListItem = {
  id: string
  username: string | null
  phone: string | null
  email: string | null
  name: string | null
  isTestUser: boolean
  isPremium: boolean
  createdAt: string
  subscription?: { status: string } | null
}

export type AdminUserList = { users: AdminUserListItem[]; total: number; page: number; pageSize: number }

export type AdminPayment = {
  id: string
  razorpayPaymentId: string
  amountPaise: number
  currency: string
  status: 'CAPTURED' | 'FAILED' | 'REFUNDED'
  method: string | null
  paidAt: string
}

export type AdminUserDetail = Omit<AdminUserListItem, 'subscription'> & {
  state: string | null
  completedStages: number
  quizAttempts: number
  freeStageLimit: number
  subscription: {
    id: string
    status: string
    razorpaySubscriptionId: string
    currentStart: string | null
    currentEnd: string | null
    chargeAt: string | null
    paidCount: number
    activatedAt: string | null
    cancelledAt: string | null
  } | null
  payments: AdminPayment[]
}

export type SubscriptionFilter = 'all' | 'autopay' | 'issues' | 'ended' | 'incomplete'

export type AdminSubscription = {
  id: string
  status: string
  autopayOn: boolean
  razorpaySubscriptionId: string
  currentStart: string | null
  currentEnd: string | null
  chargeAt: string | null
  paidCount: number
  activatedAt: string | null
  cancelledAt: string | null
  totalPaidPaise: number
  lastPaidAt: string | null
  updatedAt: string
  user: { id: string; name: string | null; phone: string | null; username: string | null }
}

export type AdminSubscriptionList = { subscriptions: AdminSubscription[]; total: number; page: number; pageSize: number }

export type AdminPaymentList = {
  payments: (AdminPayment & { user: AdminSubscription['user'] })[]
  total: number
  page: number
  pageSize: number
  totalCapturedPaise: number
}

export type AdminPaper = {
  id: number
  year: number
  name: string
  set: string | null
  draftCount: number
  needsReview: number
}

export type AdminDraftQuestion = {
  id: number
  questionNo: number
  text: string
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  correctAnswer: string | null
  categoryId: number | null
  status: string
}

export type AdminPaperDrafts = {
  paper: { id: number; year: number; name: string; set: string | null }
  drafts: AdminDraftQuestion[]
  categories: { id: number; name: string }[]
  liveCount: number
}

export type AdminCategory = {
  id: number
  name: string
  foodWorldName: string | null
  icon: string | null
  color: string | null
  displayOrder: number
  isActive: boolean
  questionCount: number
  stageCount: number
}

export type AdminStage = {
  id: number
  stageNumber: number
  title: string
  foodWorldName: string | null
  questionCount: number
  rewardStars: number
  isPublished: boolean
}

export type AdminCategoryDetail = AdminCategory & { stages: AdminStage[] }

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

// ─── Calls ────────────────────────────────────────────────────────────

export const backendApi = {
  stats: () => request<AdminStats>('/api/admin/stats'),

  users: (params: { q?: string; page?: number; filter?: string }) => {
    const search = new URLSearchParams()
    if (params.q) search.set('q', params.q)
    if (params.filter) search.set('filter', params.filter)
    if (params.page) search.set('page', String(params.page))
    return request<AdminUserList>(`/api/admin/users?${search}`)
  },

  user: (id: string) => request<AdminUserDetail>(`/api/admin/users/${id}`),

  updateUser: (id: string, data: { isTestUser?: boolean; isPremium?: boolean }) =>
    request(`/api/admin/users/${id}`, { method: 'PATCH', body: data }),

  subscriptions: (params: { q?: string; page?: number; filter?: SubscriptionFilter }) =>
    request<AdminSubscriptionList>('/api/admin/subscriptions?' + toQuery(params)),

  cancelSubscription: (id: string) => request(`/api/admin/subscriptions/${id}/cancel`, { method: 'POST' }),

  payments: (params: { q?: string; page?: number }) =>
    request<AdminPaymentList>('/api/admin/payments?' + toQuery(params)),

  papers: () => request<AdminPaper[]>('/api/admin/papers'),

  paperDrafts: (paperId: number) => request<AdminPaperDrafts>(`/api/admin/papers/${paperId}/drafts`),

  updateDraft: (draftId: number, data: Partial<AdminDraftQuestion>) =>
    request(`/api/admin/drafts/${draftId}`, { method: 'PATCH', body: data }),

  promotePaper: (paperId: number) =>
    request<{ promoted: number; total: number; skipped: number[] }>(`/api/admin/papers/${paperId}/promote`, {
      method: 'POST',
    }),

  categories: () => request<AdminCategory[]>('/api/admin/categories'),

  category: (id: number) => request<AdminCategoryDetail>(`/api/admin/categories/${id}`),

  updateCategory: (id: number, data: Partial<Pick<AdminCategory, 'foodWorldName' | 'icon' | 'color' | 'displayOrder' | 'isActive'>>) =>
    request(`/api/admin/categories/${id}`, { method: 'PATCH', body: data }),

  updateStage: (id: number, data: Partial<Pick<AdminStage, 'title' | 'rewardStars' | 'isPublished'>>) =>
    request(`/api/admin/stages/${id}`, { method: 'PATCH', body: data }),
}
