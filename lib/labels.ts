// Human wording for the codes the app stores, taken from the app's own
// onboarding screens (radiance-frontend/src/constants/onboarding.ts and
// study-goals.ts) so the admin reads the way students answered.

export const REFERRAL_LABELS: Record<string, string> = {
  INSTAGRAM_FACEBOOK: 'Instagram / Facebook',
  FRIENDS: 'Friends',
  GOOGLE: 'Google search',
  OTHER: 'Other',
}

export const DURATION_LABELS: Record<string, string> = {
  NEW: 'New beginner',
  UNDER_1_YEAR: 'Under 1 year',
  ONE_TO_THREE_YEARS: '1 – 3 years',
  OVER_3_YEARS: 'Over 3 years',
}

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

export const FOCUS_LABELS: Record<string, string> = {
  PRELIMS: 'Prelims',
  MAINS: 'Mains',
  BOTH: 'Prelims & Mains',
}

export const GOAL_LABELS: Record<string, string> = {
  STAGES: 'Category practice stages',
  QUESTIONS: 'Questions answered',
  DAILY_CHALLENGE: 'Daily challenge',
  FULL_TEST: 'Full-paper tests',
}

// "2029" → "UPSC 2029"; other answers pass through.
export function attemptLabel(value: string): string {
  return /^\d{4}$/.test(value) ? `UPSC ${value}` : value
}

export function label(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return 'Not answered'
  return map[value] ?? value
}

export function attemptKind(a: { mode: string; testMode: string }): string {
  if (a.mode === 'CATEGORY_PRACTICE') return 'Subject practice'
  return a.testMode === 'EXAM' ? 'Full paper · Exam' : 'Full paper · Practice'
}

export function attemptTitle(a: { paper: { year: number; name: string } | null; section: string | null }): string {
  if (a.paper) return `${a.paper.year} ${a.paper.name}${a.section ? ` · ${a.section}` : ''}`
  return a.section ?? 'Mixed practice'
}
