import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getUserByEmail } from '@/lib/db'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'

function hashPassword(pass: string) {
  return createHash('sha256').update(pass + SESSION_SECRET).digest('hex')
}

function generateToken(userId: string) {
  const payload = JSON.stringify({ userId, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  const sig = createHash('sha256').update(payload + SESSION_SECRET).digest('hex').slice(0, 16)
  return Buffer.from(payload).toString('base64') + '.' + sig
}

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const user = await getUserByEmail(email)

  if (!user || user.password_hash !== hashPassword(password)) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  }

  const token = generateToken(user.id)
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
  res.cookies.set('mh_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  })
  return res
}
