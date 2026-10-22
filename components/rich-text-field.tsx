'use client'

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  COLOR_SUFFIX,
  HEADING_SCALE,
  TEXT_COLOR_LABELS,
  TEXT_COLORS,
  parseRichText,
  type Block,
  type HeadingLevel,
  type Inline,
  type TextColor,
} from '@/lib/rich-text'

type Selection = { start: number; end: number }

type ToolAction = 'bold' | 'italic' | 'bullets' | 'numbers' | 'indent' | 'outdent'

const TOOLS: { label: string; title: string; className?: string; action: ToolAction }[] = [
  { label: '• List', title: 'Bullet list', action: 'bullets' },
  { label: '1. List', title: 'Numbered list', action: 'numbers' },
  { label: '→', title: 'Indent: make a sub-point (Tab)', action: 'indent' },
  { label: '←', title: 'Outdent (Shift+Tab)', action: 'outdent' },
]

const LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6]

const TOOL_BUTTON =
  'rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40'

const LIST_PREFIX = /^(\s*)([-*•]|\d{1,3}[.)]|[a-z]\))\s+/
const LINE_PREFIX = /^(\s*)(#{1,6}\s+|[-*•]\s+|\d{1,3}[.)]\s+|[a-z]\)\s+)/

const COLORS = Object.keys(TEXT_COLORS) as TextColor[]

// Textarea for the Markdown subset in lib/rich-text.ts, with a formatting
// toolbar and a Write / Preview toggle. Submits as a plain form field.
export function RichTextField({
  name,
  defaultValue,
  placeholder,
  className,
  plainLinesAsBullets = false,
}: {
  name: string
  defaultValue: string
  placeholder?: string
  className?: string
  plainLinesAsBullets?: boolean
}) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<Selection | null>(null)

  // Toolbar edits set the value from code, which fires no input event; tell
  // the form (the live MobilePreview listens to it) the text changed.
  useEffect(() => {
    ref.current?.form?.dispatchEvent(new Event('input', { bubbles: true }))
  }, [value])

  // Restore the caret after a toolbar edit re-renders the textarea.
  useLayoutEffect(() => {
    const sel = pendingSelection.current
    if (sel && ref.current) {
      ref.current.focus()
      ref.current.setSelectionRange(sel.start, sel.end)
      pendingSelection.current = null
    }
  })

  function apply(next: string, selection: Selection) {
    pendingSelection.current = selection
    setValue(next)
  }

  function currentSelection(): Selection {
    const el = ref.current
    return el ? { start: el.selectionStart, end: el.selectionEnd } : { start: value.length, end: value.length }
  }

  // Wrap the selection in `marker` (or insert an empty pair at the caret).
  function wrap(marker: string) {
    const { start, end } = currentSelection()
    const selected = value.slice(start, end)
    const next = value.slice(0, start) + marker + selected + marker + value.slice(end)
    apply(next, { start: start + marker.length, end: end + marker.length })
  }

  // Rewrite every line touched by the selection; `fn` gets the line and its
  // index within the selection.
  function mapLines(fn: (line: string, i: number, lines: string[]) => string) {
    const { start, end } = currentSelection()
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const nl = value.indexOf('\n', end)
    const lineEnd = nl === -1 ? value.length : nl
    const lines = value.slice(lineStart, lineEnd).split('\n')
    const replaced = lines.map((line, i) => fn(line, i, lines)).join('\n')
    // A bare caret lands at the end of the line so typing continues there;
    // a real selection stays selected so the button can be pressed again.
    const replacedEnd = lineStart + replaced.length
    apply(value.slice(0, lineStart) + replaced + value.slice(lineEnd), {
      start: start === end ? replacedEnd : lineStart,
      end: replacedEnd,
    })
  }

  // Set a heading/list prefix on the selected lines; clicking the same
  // button again removes it.
  function setPrefix(make: (i: number) => string, matches: RegExp) {
    mapLines((line, _i, lines) => {
      const allHave = lines.every((l) => !l.trim() || matches.test(l.trimStart()))
      const m = LINE_PREFIX.exec(line)
      const indent = m ? m[1] : (/^\s*/.exec(line)?.[0] ?? '')
      const content = m ? line.slice(m[0].length) : line.trimStart()
      if (!content.trim() && lines.length > 1) return line
      if (allHave) return indent + content
      const index = lines.slice(0, _i).filter((l) => l.trim()).length
      return indent + make(index) + content
    })
  }

  // Turns the selected lines into headings of `level` (keeping their color),
  // or back into normal text with level 0.
  function setHeading(level: HeadingLevel | 0) {
    mapLines((line, _i, lines) => {
      const m = LINE_PREFIX.exec(line)
      const indent = m ? m[1] : (/^\s*/.exec(line)?.[0] ?? '')
      const content = m ? line.slice(m[0].length) : line.trimStart()
      if (!content.trim() && lines.length > 1) return line
      if (level === 0) return indent + content
      return indent + '#'.repeat(level) + ' ' + content
    })
  }

  // Colors the selected lines — headings, text or list items alike — by
  // replacing any {color} marker at the line's end; null clears it.
  function setLineColor(color: TextColor | null) {
    mapLines((line) => {
      if (!line.trim()) return line
      const bare = line.replace(COLOR_SUFFIX, '')
      return color ? `${bare} {${color}}` : bare
    })
  }

  function indent(by: 1 | -1) {
    mapLines((line) => (by === 1 ? '  ' + line : line.replace(/^ {1,2}/, '')))
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.ctrlKey || e.metaKey
    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      wrap('**')
      return
    }
    if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      wrap('*')
      return
    }

    const { start, end } = currentSelection()
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const nl = value.indexOf('\n', start)
    const line = value.slice(lineStart, nl === -1 ? value.length : nl)
    const list = LIST_PREFIX.exec(line)

    // Tab / Shift+Tab nest list items; outside lists Tab keeps moving focus.
    if (e.key === 'Tab' && list) {
      e.preventDefault()
      indent(e.shiftKey ? -1 : 1)
      return
    }

    // Enter on a list item continues the list; on an empty item it ends it.
    if (e.key === 'Enter' && !e.shiftKey && list && start === end) {
      e.preventDefault()
      if (!line.slice(list[0].length).trim()) {
        apply(value.slice(0, lineStart) + value.slice(lineStart + line.length), { start: lineStart, end: lineStart })
        return
      }
      const marker = nextMarker(list[2])
      const insert = '\n' + list[1] + marker + ' '
      apply(value.slice(0, start) + insert + value.slice(end), {
        start: start + insert.length,
        end: start + insert.length,
      })
    }
  }

  function runTool(action: ToolAction) {
    switch (action) {
      case 'bold':
        return wrap('**')
      case 'italic':
        return wrap('*')
      case 'bullets':
        return setPrefix(() => '- ', /^[-*•]\s/)
      case 'numbers':
        return setPrefix((i) => `${i + 1}. `, /^\d{1,3}[.)]\s/)
      case 'indent':
        return indent(1)
      case 'outdent':
        return indent(-1)
    }
  }

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1">
        <button
          type="button"
          title="Bold (Ctrl+B)"
          disabled={preview}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runTool('bold')}
          className={`${TOOL_BUTTON} font-bold`}
        >
          B
        </button>
        <button
          type="button"
          title="Italic (Ctrl+I)"
          disabled={preview}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runTool('italic')}
          className={`${TOOL_BUTTON} italic`}
        >
          I
        </button>

        {/* Resets to the placeholder after each pick, so it acts like a menu. */}
        <select
          value=""
          disabled={preview}
          aria-label="Heading level"
          title="Turn the selected lines into a heading"
          onChange={(e) => setHeading(Number(e.target.value) as HeadingLevel | 0)}
          className={`${TOOL_BUTTON} cursor-pointer bg-white py-[3px] font-semibold`}
        >
          <option value="" disabled>
            Heading
          </option>
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              H{level}
            </option>
          ))}
          <option value={0}>Normal text</option>
        </select>

        {/* The app's palette; colors the whole selected line(s). */}
        <span className="flex items-center gap-0.5 rounded border border-slate-200 px-1 py-0.5" title="Text color (app colors)">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              disabled={preview}
              title={`${TEXT_COLOR_LABELS[color]} text`}
              aria-label={`${TEXT_COLOR_LABELS[color]} text`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setLineColor(color)}
              className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-40"
            >
              <span className="block h-3.5 w-3.5 rounded-full ring-1 ring-slate-300" style={{ background: TEXT_COLORS[color] }} />
            </button>
          ))}
          <button
            type="button"
            disabled={preview}
            title="Remove color"
            aria-label="Remove color"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setLineColor(null)}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.5 12.5l9-9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </span>

        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            disabled={preview}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runTool(t.action)}
            className={`${TOOL_BUTTON} ${t.className ?? ''}`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-auto rounded border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Stays mounted while previewing so the form still submits the value. */}
      <textarea
        ref={ref}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        hidden={preview}
        className={className}
      />
      {preview && (
        <div className={className}>
          <RichTextPreview text={value} plainLinesAsBullets={plainLinesAsBullets} />
        </div>
      )}
    </div>
  )
}

function nextMarker(marker: string): string {
  const num = /^(\d+)([.)])$/.exec(marker)
  if (num) return `${Number(num[1]) + 1}${num[2]}`
  const letter = /^([a-y])\)$/.exec(marker)
  if (letter) return `${String.fromCharCode(letter[1].charCodeAt(0) + 1)})`
  return marker
}

export function RichTextPreview({ text, plainLinesAsBullets }: { text: string; plainLinesAsBullets?: boolean }) {
  const blocks = parseRichText(text, { plainLinesAsBullets })
  if (blocks.length === 0) return <p className="text-slate-400">Nothing to preview.</p>
  return <div className="space-y-1">{blocks.map((b, i) => <PreviewBlock key={i} block={b} />)}</div>
}

const BULLETS = ['•', '◦', '▪', '▫']

// Black is left to the admin theme (it would vanish on the dark-mode card);
// every other app color is shown as-is.
function previewColor(color: TextColor | undefined): string | undefined {
  return color && color !== 'black' ? TEXT_COLORS[color] : undefined
}

function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return (
        <p
          className={`${block.level <= 3 ? 'font-extrabold' : 'font-bold'} pt-1 text-slate-900`}
          style={{ fontSize: `${HEADING_SCALE[block.level] * 0.875}rem`, color: previewColor(block.color) }}
        >
          <Inlines inlines={block.inlines} />
        </p>
      )
    case 'paragraph':
      return (
        <p style={{ color: previewColor(block.color) }}>
          <Inlines inlines={block.inlines} />
        </p>
      )
    case 'bullet':
    case 'numbered':
      return (
        <div className="flex gap-2" style={{ paddingLeft: `${block.depth * 1.25}rem` }}>
          <span className="shrink-0 text-slate-500">{block.type === 'bullet' ? BULLETS[block.depth] : block.marker}</span>
          <span style={{ color: previewColor(block.color) }}>
            <Inlines inlines={block.inlines} />
          </span>
        </div>
      )
  }
}

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((s, i) => (
    <span key={i} className={`${s.bold ? 'font-bold' : ''} ${s.italic ? 'italic' : ''}`}>
      {s.text}
    </span>
  ))
}
