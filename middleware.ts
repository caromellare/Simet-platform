import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'
const PUBLIC_PATHS = ['/login', '/api/auth/login']

function isValidToken(token: string): boolean {
  try {
    const [payloadB64, sig] = token.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    const expectedSig = createHash('sha256').update(JSON.stringify(payload) + SESSION_SECRET).digest('hex').slice(0, 16)
    return sig === expectedSig && payload.expires > Date.now()
  } catch { return false }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths and static assets
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/me')) return NextResponse.next()
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|json)$/)) return NextResponse.next()

  const token = req.cookies.get('mh_session')?.value
  if (!token || !isValidToken(token)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
