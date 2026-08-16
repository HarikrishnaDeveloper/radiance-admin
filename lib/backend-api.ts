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

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': apiKey,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new BackendApiError(response.status, data?.error ?? 'Request to backend failed')
  }
  return data as T
}

// ─── Types (mirrors radiance-backend/app/api/admin/* response shapes) ────

export type AdminStats = {
  totalUsers: number
  testUsers: number
  activeSubscriptions: number
  stagesCompletedToday: number
  draftsNeedingReview: number
  liveQuestions: number
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
}

export type AdminUserList = { users: AdminUserListItem[]; total: number; page: number; pageSize: number }

export type AdminUserDetail = AdminUserListItem & {
  state: string | null
  completedStages: number
  quizAttempts: number
  subscription: {
    status: string
    razorpaySubscriptionId: string
    currentStart: string | null
    currentEnd: string | null
  } | null
}

export type AdminSubscription = {
  id: string
  status: string
  razorpaySubscriptionId: string
  currentStart: string | null
  currentEnd: string | null
  updatedAt: string
  user: { id: string; name: string | null; phone: string | null; username: string | null }
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

// ─── Calls ────────────────────────────────────────────────────────────

export const backendApi = {
  stats: () => request<AdminStats>('/api/admin/stats'),

  users: (params: { q?: string; page?: number }) => {
    const search = new URLSearchParams()
    if (params.q) search.set('q', params.q)
    if (params.page) search.set('page', String(params.page))
    return request<AdminUserList>(`/api/admin/users?${search}`)
  },

  user: (id: string) => request<AdminUserDetail>(`/api/admin/users/${id}`),

  updateUser: (id: string, data: { isTestUser?: boolean; isPremium?: boolean }) =>
    request(`/api/admin/users/${id}`, { method: 'PATCH', body: data }),

  subscriptions: () => request<AdminSubscription[]>('/api/admin/subscriptions'),

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
