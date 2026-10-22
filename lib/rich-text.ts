// Lightweight Markdown subset used for question explanations and UPSC revision
// points. The same parser lives in radiance-frontend/src/lib/rich-text.ts —
// keep the two in sync so the admin preview matches what students see.
//
// Supported, one construct per line:
//   # Heading … ###### Heading 6
//   - bullet  (also * or •), indent 2 spaces per nesting level
//   1. numbered  (also 1) or a) for lettered sub-points)
//   **bold**, *italic* or _italic_, ***bold italic***
//   {violet} at the end of any line colors it (see TEXT_COLORS)
// Anything else is a plain paragraph line, so existing plain text is unchanged.

export type Inline = { text: string; bold?: boolean; italic?: boolean }

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

// The app's text colors (radiance-frontend/src/constants/ui.ts), in toolbar order.
export const TEXT_COLORS = {
  black: '#111111',
  grey: '#6B6B6B',
  violet: '#8103FB',
  darkviolet: '#6803E3',
  green: '#1E8E4E',
  red: '#D33A2C',
} as const

export type TextColor = keyof typeof TEXT_COLORS

export const TEXT_COLOR_LABELS: Record<TextColor, string> = {
  black: 'Black',
  grey: 'Grey',
  violet: 'Violet',
  darkviolet: 'Dark violet',
  green: 'Green',
  red: 'Red',
}

// Font size of each heading level relative to the body text it sits in.
export const HEADING_SCALE: Record<HeadingLevel, number> = { 1: 1.5, 2: 1.32, 3: 1.18, 4: 1.08, 5: 1, 6: 0.9 }

// `color` is unset when the line names none: the renderer's default applies
// (black for headings, the surrounding text color otherwise).
export type Block =
  | { type: 'heading'; level: HeadingLevel; color?: TextColor; inlines: Inline[] }
  | { type: 'bullet'; depth: number; color?: TextColor; inlines: Inline[] }
  | { type: 'numbered'; depth: number; marker: string; color?: TextColor; inlines: Inline[] }
  | { type: 'paragraph'; color?: TextColor; inlines: Inline[] }

const MAX_DEPTH = 3

// "rose" came before the palette matched the app; it reads as the app's red.
export const COLOR_SUFFIX = /\s*\{(black|grey|violet|darkviolet|green|red|rose)\}\s*$/

export function parseRichText(text: string | null | undefined, options: { plainLinesAsBullets?: boolean } = {}): Block[] {
  const blocks: Block[] = []
  for (const raw of (text ?? '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.replace(/\t/g, '  ')
    let body = line.trim()
    if (!body) continue
    const depth = Math.min(Math.floor((line.length - line.trimStart().length) / 2), MAX_DEPTH)

    let color: TextColor | undefined
    const suffix = COLOR_SUFFIX.exec(body)
    if (suffix) {
      color = suffix[1] === 'rose' ? 'red' : (suffix[1] as TextColor)
      body = body.slice(0, suffix.index).trimEnd()
      if (!body) continue
    }

    let m: RegExpExecArray | null
    if ((m = /^(#{1,6})\s+(.*)$/.exec(body))) {
      blocks.push({ type: 'heading', level: m[1].length as HeadingLevel, color, inlines: parseInline(m[2]) })
    } else if ((m = /^[-*•]\s+(.*)$/.exec(body))) {
      blocks.push({ type: 'bullet', depth, color, inlines: parseInline(m[1]) })
    } else if ((m = /^(\d{1,3}[.)]|[a-z]\))\s+(.*)$/.exec(body))) {
      blocks.push({ type: 'numbered', depth, marker: m[1], color, inlines: parseInline(m[2]) })
    } else if (options.plainLinesAsBullets) {
      blocks.push({ type: 'bullet', depth, color, inlines: parseInline(body) })
    } else {
      blocks.push({ type: 'paragraph', color, inlines: parseInline(body) })
    }
  }
  return blocks
}

// `_x_` needs a non-word character on both sides so snake_case stays literal;
// `*x*` needs non-space just inside the stars so "2 * 3 * 4" stays literal.
const INLINE = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(\S(?:.*?\S)?)\*|\b_(\S(?:.*?\S)?)_\b/g

export function parseInline(text: string): Inline[] {
  const out: Inline[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ text: m[1], bold: true, italic: true })
    else if (m[2] !== undefined) out.push({ text: m[2], bold: true })
    else out.push({ text: m[3] ?? m[4], italic: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}
