import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login']
const ADMIN_ONLY_PATHS = ['/settings', '/api/auth/users']

// Middleware corre en Edge Runtime — solo verificamos expiración aquí.
// La firma del token se verifica en /api/auth/me (Node.js runtime).
function parseToken(token: string): { userId: string; role: string; expires: number } | null {
  try {
    const [payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))
    if (!payload.userId || payload.expires < Date.now()) return null
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
