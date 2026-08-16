import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'radiance_admin_session'

// Optimistic check only — reads the cookie and verifies its signature, no DB
// call (see lib/dal.ts for the real gate every page/action performs).
async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginRoute = pathname === '/login'
  const authed = await hasValidSession(request)

  if (!authed && !isLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (authed && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
