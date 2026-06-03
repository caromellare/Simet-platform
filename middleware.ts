import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'
const PUBLIC_PATHS = ['/login', '/api/auth/login']
// Solo admins pueden acceder a estas rutas
const ADMIN_ONLY_PATHS = ['/settings', '/api/auth/users']

function parseToken(token: string): { userId: string; role: string; expires: number } | null {
  try {
    const [payloadB64, sig] = token.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    const expectedSig = createHash('sha256').update(JSON.stringify(payload) + SESSION_SECRET).digest('hex').slice(0, 16)
    if (sig !== expectedSig || payload.expires < Date.now()) return null
    return payload
  } catch { return null }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas públicas y assets
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith('/_next')) return NextResponse.next()
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|json)$/)) return NextResponse.next()
  // APIs que no son /api/auth/me ni /api/auth/users pasan sin verificación de rol
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/me') && !pathname.startsWith('/api/auth/users')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('mh_session')?.value
  const payload = token ? parseToken(token) : null

  // Sin sesión válida → login
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Rutas solo admin
  if (ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p)) && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
