import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { BackendApiError, backendApi, type AdminDraftQuestion } from '@/lib/backend-api'
import { addDraftQuestion, promotePaper, updateDraftQuestion } from '@/app/actions/questions'
import { ActionForm, SubmitButton } from '@/components/action-form'
import { Icon } from '@/components/icons'
import { ImageField } from '@/components/image-field'
import { MobilePreview } from '@/components/mobile-preview'
import { QuestionNavigator, type NavigatorItem } from '@/components/question-navigator'
import { RichTextField } from '@/components/rich-text-field'
import { GuardedLink, UnsavedChangesGuard } from '@/components/unsaved-changes'

const LABELS = ['A', 'B', 'C', 'D'] as const
const EDITOR_FORM_ID = 'draft-editor'

// What stops a draft going live: promotePaper (radiance-backend) skips it.
function blockingIssues(d: AdminDraftQuestion): string[] {
  const issues: string[] = []
  if (!d.text.trim()) issues.push('No question text')
  const empty = LABELS.filter((l) => !d[`option${l}`]?.trim() && !d[`option${l}Image`])
  if (empty.length) issues.push(`Option ${empty.join(', ')} ${empty.length === 1 ? 'is' : 'are'} empty`)
  if (!d.categoryId) issues.push('No category')
  return issues
}

export default async function PaperReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ paperId: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { paperId: paperIdParam } = await params
  const { q } = await searchParams
  const paperId = Number(paperIdParam)

  let data
  try {
    data = await backendApi.paperDrafts(paperId)
  } catch (e) {
    if (e instanceof BackendApiError && e.status === 404) notFound()
    throw e
  }

  const { paper, drafts, categories, liveCount } = data
  const approvedCount = drafts.filter((d) => d.status === 'APPROVED').length
  const issuesByNo = new Map(drafts.map((d) => [d.questionNo, blockingIssues(d)]))
  const incompleteCount = drafts.filter((d) => issuesByNo.get(d.questionNo)!.length > 0).length

  // The open question: ?q=, else the first still to review, else the first.
  const index = Math.max(
    0,
    drafts.findIndex((d) => String(d.questionNo) === q) >= 0
      ? drafts.findIndex((d) => String(d.questionNo) === q)
      : drafts.findIndex((d) => d.status !== 'APPROVED')
  )
  const draft = drafts[index]
  const prev = drafts[index - 1]
  const next = drafts[index + 1]

  const navItems: NavigatorItem[] = drafts.map((d) => ({
    questionNo: d.questionNo,
    status: d.status,
    snippet: d.text.trim().slice(0, 120),
    issues: issuesByNo.get(d.questionNo)!,
  }))

  const title = `${paper.year} ${paper.name}${paper.set ? ` (Set ${paper.set})` : ''}`

  return (
    <div>
      <Link href="/questions" className="text-sm text-slate-500 hover:text-[#7b0f91]">
        ← All papers
      </Link>

      {/* Header */}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>
              <strong className="font-semibold text-slate-900">{approvedCount}</strong> of {drafts.length} approved
            </span>
            <span>
              <strong className="font-semibold text-slate-900">{liveCount}</strong> live in the app
            </span>
            {incompleteCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Icon name="alert-triangle" className="h-3.5 w-3.5" /> {incompleteCount} incomplete
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-72 max-w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a]"
              style={{ width: `${drafts.length ? (approvedCount / drafts.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionForm action={addDraftQuestion.bind(null, paperId)} errorTitle="Couldn’t add a question">
            <SubmitButton pendingLabel="Adding…" className="btn btn-secondary">
              <Icon name="plus" /> Add question
            </SubmitButton>
          </ActionForm>
          <ActionForm
            action={promotePaper.bind(null, paperId)}
            successTitle="Promoted to live"
            errorTitle="Couldn’t promote this paper"
            confirm={{
              title: 'Promote approved questions?',
              message: `${approvedCount} approved question${approvedCount === 1 ? '' : 's'} will replace what students currently see for this paper.`,
              confirmLabel: 'Promote to live',
            }}
          >
            <SubmitButton pendingLabel="Promoting…">Promote to live ({approvedCount})</SubmitButton>
          </ActionForm>
        </div>
      </div>

      {!draft ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-base font-semibold text-slate-900">No questions in this paper yet</p>
          <p className="mt-1 text-sm text-slate-500">Use “Add question” above to write the first one.</p>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]">
          <aside className="lg:sticky lg:top-6">
            <QuestionNavigator items={navItems} current={draft.questionNo} />
          </aside>

          {/* key: a fresh form per question, so its fields load that question's values. */}
          <ActionForm
            key={draft.id}
            id={EDITOR_FORM_ID}
            action={updateDraftQuestion.bind(null, paperId, draft.id)}
            successTitle={`Q${draft.questionNo} saved`}
            errorTitle={`Couldn’t save Q${draft.questionNo}`}
            className="card min-w-0"
          >
            <input type="hidden" name="nextQ" value={next?.questionNo ?? ''} />

            {/* Title row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Question {draft.questionNo}</h2>
                <p className="text-xs text-slate-400">
                  {index + 1} of {drafts.length} in this paper
                </p>
              </div>
              <StatusSwitch status={draft.status} />
            </div>

            <div className="space-y-7 px-6 py-6">
              {issuesByNo.get(draft.questionNo)!.length > 0 && (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">This question won’t go live until it’s complete</p>
                    <p className="mt-0.5">{issuesByNo.get(draft.questionNo)!.join(' · ')}</p>
                  </div>
                </div>
              )}

              <EditorSection title="Question" hint="As printed in the paper.">
                <textarea
                  name="text"
                  required
                  defaultValue={draft.text}
                  rows={3}
                  placeholder="Type the question…"
                  className="field mt-0 field-sizing-content min-h-24 text-[15px] leading-relaxed"
                />
                <ImageField name="questionImage" defaultValue={draft.questionImage} label="Question image" />
              </EditorSection>

              <EditorSection title="Options" hint="Text, a picture, or both. Mark the correct one.">
                <div className="space-y-2.5">
                  {LABELS.map((label) => (
                    <div
                      key={label}
                      className="group rounded-xl border border-slate-200 p-3 transition has-checked:border-emerald-400 has-checked:bg-emerald-50/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition group-has-checked:bg-emerald-600 group-has-checked:text-[#fff]">
                          {label}
                        </span>
                        <input
                          name={`option${label}`}
                          defaultValue={draft[`option${label}`] ?? ''}
                          placeholder={`Option ${label}`}
                          aria-label={`Option ${label}`}
                          className="field mt-0 flex-1"
                        />
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 group-has-checked:text-emerald-700">
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={label}
                            defaultChecked={draft.correctAnswer === label}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          Correct
                        </label>
                      </div>
                      <div className="pl-11">
                        <ImageField name={`option${label}Image`} defaultValue={draft[`option${label}Image`]} />
                      </div>
                    </div>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2 px-1 text-xs text-slate-500">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value=""
                      defaultChecked={!draft.correctAnswer}
                      className="h-4 w-4 accent-slate-500"
                    />
                    No correct answer — dropped by UPSC (everyone gets full marks)
                  </label>
                </div>
              </EditorSection>

              <EditorSection title="Category">
                <select name="categoryId" defaultValue={draft.categoryId ?? ''} className="field mt-0 max-w-sm">
                  <option value="">Choose a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </EditorSection>

              <EditorSection title="Explanation" hint="Shown after the answer is revealed.">
                <RichTextField
                  name="explanation"
                  defaultValue={draft.explanation ?? ''}
                  placeholder="Explain why the correct answer is right…"
                  className="field mt-0 field-sizing-content min-h-40 leading-relaxed"
                />
              </EditorSection>

              <EditorSection title="UPSC revision points" hint="Key facts to remember — each line is a bullet.">
                <RichTextField
                  name="revisionPoints"
                  defaultValue={draft.revisionPoints ?? ''}
                  plainLinesAsBullets
                  placeholder="One memory hook or key fact per line…"
                  className="field mt-0 field-sizing-content min-h-28 leading-relaxed"
                />
              </EditorSection>
            </div>

            {/* Action bar: stays on screen while scrolling a long question. */}
            <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
              <NavButton href={prev && `?q=${prev.questionNo}`} label="Previous question">
                ‹ Prev
              </NavButton>
              <NavButton href={next && `?q=${next.questionNo}`} label="Next question">
                Next ›
              </NavButton>
              <div className="ml-auto flex items-center gap-2">
                <SubmitButton name="intent" value="save" pendingLabel="Saving…" className="btn btn-secondary">
                  Save
                </SubmitButton>
                <SubmitButton
                  name="intent"
                  value="approve-next"
                  pendingLabel="Approving…"
                  title="Mark as approved, save, and open the next question"
                >
                  <Icon name="check-circle" /> {next ? 'Approve & next' : 'Approve'}
                </SubmitButton>
              </div>
            </div>

            <UnsavedChangesGuard />
          </ActionForm>

          <aside className="min-w-0 lg:col-start-2 xl:col-start-auto xl:sticky xl:top-6">
            <MobilePreview formId={EDITOR_FORM_ID} questionNo={draft.questionNo} categories={categories} />
          </aside>
        </div>
      )}
    </div>
  )
}

function EditorSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

// Two-way review switch, submitted as the form's `status` field.
function StatusSwitch({ status }: { status: string }) {
  const options = [
    { value: 'NEEDS_REVIEW', label: 'Needs review', on: 'has-checked:text-amber-700', dot: 'bg-amber-400' },
    { value: 'APPROVED', label: 'Approved', on: 'has-checked:text-emerald-700', dot: 'bg-emerald-500' },
  ]
  return (
    <div role="radiogroup" aria-label="Review status" className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-500 transition has-checked:bg-white has-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-[#7b0f91]/40 ${o.on}`}
        >
          <input type="radio" name="status" value={o.value} defaultChecked={status === o.value} className="sr-only" />
          <span className={`h-2 w-2 rounded-full ${o.dot}`} aria-hidden />
          {o.label}
        </label>
      ))}
    </div>
  )
}

function NavButton({ href, label, children }: { href?: string; label: string; children: ReactNode }) {
  if (!href) {
    return (
      <span aria-disabled className="btn btn-secondary btn-sm cursor-not-allowed opacity-40">
        {children}
      </span>
    )
  }
  return (
    <GuardedLink href={href} title={label} className="btn btn-secondary btn-sm">
      {children}
    </GuardedLink>
  )
}
