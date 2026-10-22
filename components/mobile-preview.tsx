'use client'

import { useEffect, useRef, useState } from 'react'
import { backendFileUrl } from '@/lib/backend-files'
import { HEADING_SCALE, parseRichText, TEXT_COLORS, type Block, type Inline } from '@/lib/rich-text'

// Live phone mock-up of a draft question as the radiance-frontend test screen
// shows it (src/app/test/[attemptId]/index.tsx + paper-test/study-notes.tsx).
// It reads the question's <form> by id and re-renders on every input, so it
// needs no wiring per field; fields that change value from code (images, the
// rich-text toolbar) dispatch an `input` event on their form for this.
//
// Colors are the app's (radiance-frontend/src/constants/ui.ts) and literal on
// purpose: the phone looks the same whatever theme the admin is in.
const APP = {
  bg: '#FFFFFF',
  subtle: '#F5F5F5',
  text: '#111111',
  grey: '#6B6B6B',
  border: '#E6E6E6',
  accent: '#8103FB',
  accentSoft: '#F3E9FF',
}

// The app uses the phone's system font: Roboto on Android (loaded in
// app/layout.tsx), San Francisco on iPhone — the fallbacks cover a Mac viewer.
const APP_FONT = 'var(--font-roboto), Roboto, -apple-system, system-ui, sans-serif'

const LABELS = ['A', 'B', 'C', 'D'] as const

type Snapshot = {
  text: string
  questionImage: string
  options: { label: string; text: string; image: string }[]
  correctAnswer: string
  categoryId: string
  explanation: string
  revisionPoints: string
}

function readForm(form: HTMLFormElement): Snapshot {
  const data = new FormData(form)
  const get = (key: string) => String(data.get(key) ?? '')
  return {
    text: get('text'),
    questionImage: get('questionImage'),
    options: LABELS.map((label) => ({ label, text: get(`option${label}`), image: get(`option${label}Image`) })),
    correctAnswer: get('correctAnswer').trim().toUpperCase(),
    categoryId: get('categoryId'),
    explanation: get('explanation'),
    revisionPoints: get('revisionPoints'),
  }
}

export function MobilePreview({
  formId,
  questionNo,
  categories,
}: {
  formId: string
  questionNo: number
  categories: { id: number; name: string }[]
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [revealed, setRevealed] = useState(true)
  const [snap, setSnap] = useState<Snapshot | null>(null)

  // A paper can have 150 questions; only build phones that scroll into view.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: '400px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (!form) return
    const update = () => setSnap(readForm(form))
    update()
    form.addEventListener('input', update)
    form.addEventListener('change', update)
    return () => {
      form.removeEventListener('input', update)
      form.removeEventListener('change', update)
    }
  }, [visible, formId])

  const category = categories.find((c) => String(c.id) === snap?.categoryId)?.name ?? 'No category'

  return (
    <div ref={wrapRef}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">App preview</span>
        <div className="flex rounded-md bg-slate-100 p-0.5 text-[11px] font-semibold">
          {[
            { value: false, label: 'Question' },
            { value: true, label: 'Answer' },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setRevealed(tab.value)}
              className={`rounded px-2 py-0.5 transition ${
                revealed === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[300px] rounded-[2.25rem] bg-[#1b1b1f] p-2.5 shadow-xl shadow-black/20">
        <div className="relative overflow-hidden rounded-[1.75rem]" style={{ background: APP.bg }}>
          <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1b1b1f]" aria-hidden />
          <div
            className="h-[560px] overflow-y-auto px-4 pb-6 pt-10 [scrollbar-width:thin]"
            style={{ color: APP.text, fontFamily: APP_FONT }}
          >
            {snap ? <PhoneContent snap={snap} questionNo={questionNo} category={category} revealed={revealed} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneContent({
  snap,
  questionNo,
  category,
  revealed,
}: {
  snap: Snapshot
  questionNo: number
  category: string
  revealed: boolean
}) {
  const voided = !snap.correctAnswer
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: APP.accentSoft, color: APP.accent }}>
          Q{questionNo}
        </span>
        <span className="truncate text-[11px] font-semibold" style={{ color: APP.grey }}>
          {category}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[15px] font-bold leading-[23px]">
        {snap.text.trim() || <span style={{ color: APP.grey }}>Question text…</span>}
      </p>
      {snap.questionImage && (
        // eslint-disable-next-line @next/next/no-img-element -- proxied backend file
        <img src={backendFileUrl(snap.questionImage)} alt="" className="mt-3 h-40 w-full rounded-lg object-contain" />
      )}

      <div className="mt-4 space-y-2.5">
        {snap.options.map((o) => {
          const correct = revealed && o.label === snap.correctAnswer
          return (
            <div
              key={o.label}
              className="flex items-center gap-3 rounded-lg border-2 p-3"
              style={{ borderColor: correct ? APP.accent : APP.border, background: correct ? APP.accentSoft : APP.bg }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: correct ? APP.accent : APP.bg, color: correct ? APP.bg : APP.grey }}
              >
                {o.label}
              </span>
              <span className="min-w-0 flex-1">
                {o.text && <span className="block text-[13px] font-semibold leading-[19px]">{o.text}</span>}
                {o.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- proxied backend file
                  <img src={backendFileUrl(o.image)} alt="" className="mt-1.5 h-24 w-full rounded-md object-contain object-left" />
                )}
                {!o.text && !o.image && <span className="text-[13px] text-red-500">Empty option</span>}
              </span>
              {correct && <Check />}
            </div>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-4 space-y-2.5">
          {voided && (
            <div className="rounded-lg p-3 text-[12px] font-bold" style={{ background: APP.subtle, color: APP.grey }}>
              No answer set — the app treats this question as dropped (full marks to everyone).
            </div>
          )}
          <Notes title="Explanation" icon="💡" text={snap.explanation} />
          <Notes title="UPSC Review Points" icon="🔖" text={snap.revisionPoints} soft bullets />
          {!snap.explanation.trim() && !snap.revisionPoints.trim() && (
            <div className="rounded-lg border p-3 text-[12px] font-semibold" style={{ borderColor: APP.border, color: APP.grey }}>
              Explanation for this question is being added. Check back soon.
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" fill={APP.accent} />
      <path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Mirrors StudyNotes + RichText in the app: same parser, same sizes.
function Notes({ title, icon, text, soft, bullets }: { title: string; icon: string; text: string; soft?: boolean; bullets?: boolean }) {
  const blocks = parseRichText(text, { plainLinesAsBullets: bullets })
  if (blocks.length === 0) return null
  // Same body sizes as StudyNotes in the app (paragraph vs. bullet text).
  const base = bullets ? { size: 13, lineHeight: 19 } : { size: 13.5, lineHeight: 20 }
  const body = bullets ? 'text-[13px] font-semibold leading-[19px]' : 'text-[13.5px] font-medium leading-5'
  return (
    <div className="rounded-lg border p-3.5" style={{ borderColor: APP.border, background: soft ? APP.accentSoft : APP.bg }}>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold" style={{ color: APP.accent }}>
        <span aria-hidden>{icon}</span>
        {title}
      </p>
      <div className="space-y-1" style={{ color: bullets ? APP.text : APP.grey }}>
        {blocks.map((b, i) => (
          <NoteBlock key={i} block={b} className={body} base={base} first={i === 0} />
        ))}
      </div>
    </div>
  )
}

const BULLETS = ['•', '◦', '▪', '▫']
function NoteBlock({
  block,
  className,
  base,
  first,
}: {
  block: Block
  className: string
  base: { size: number; lineHeight: number }
  first: boolean
}) {
  switch (block.type) {
    case 'heading':
      return (
        <p
          className={`${block.level <= 3 ? 'font-extrabold' : 'font-bold'} ${first ? '' : 'pt-1.5'}`}
          style={{
            color: TEXT_COLORS[block.color ?? 'black'],
            fontSize: base.size * HEADING_SCALE[block.level],
            lineHeight: `${base.lineHeight * HEADING_SCALE[block.level]}px`,
          }}
        >
          <Inlines inlines={block.inlines} />
        </p>
      )
    case 'paragraph':
      return (
        <p className={className} style={{ color: block.color && TEXT_COLORS[block.color] }}>
          <Inlines inlines={block.inlines} />
        </p>
      )
    case 'bullet':
    case 'numbered':
      return (
        <div className={`flex gap-1.5 ${className}`} style={{ paddingLeft: block.depth * 14 }}>
          <span className="min-w-3 shrink-0 font-bold" style={{ color: APP.accent }}>
            {block.type === 'bullet' ? BULLETS[block.depth] : block.marker}
          </span>
          <span className="min-w-0 flex-1" style={{ color: block.color && TEXT_COLORS[block.color] }}>
            <Inlines inlines={block.inlines} />
          </span>
        </div>
      )
  }
}

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((s, i) =>
    s.bold || s.italic ? (
      <span key={i} className={`${s.bold ? 'font-extrabold' : ''} ${s.italic ? 'italic' : ''}`}>
        {s.text}
      </span>
    ) : (
      s.text
    )
  )
}
