import { verifyAdminSession } from '@/lib/dal'

const BACKEND_URL = process.env.BACKEND_URL ?? ''

// Only radiance-backend's image folders; nothing else is proxied.
const ALLOWED_ROOTS = new Set(['images', 'uploads'])

type Context = { params: Promise<{ path: string[] }> }

// Streams a question/option image from radiance-backend so admin pages can
// show it (see lib/backend-files.ts). proxy.ts skips image extensions, so
// the session is checked here.
export async function GET(_request: Request, ctx: Context) {
  await verifyAdminSession()
  const { path } = await ctx.params
  if (!ALLOWED_ROOTS.has(path[0]) || path.some((p) => p === '..')) {
    return new Response('Not found', { status: 404 })
  }

  const upstream = await fetch(`${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}`).catch(() => null)
  if (!upstream?.ok || !upstream.body) return new Response('Not found', { status: 404 })

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
