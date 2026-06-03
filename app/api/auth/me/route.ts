import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/db'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'

function parseToken(token: string) {
  try {
    const [payloadB64, sig] = token.split('.')
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    const expectedSig = createHash('sha256').update(JSON.stringify(payload) + SESSION_SECRET).digest('hex').slice(0, 16)
    if (sig !== expectedSig) return null
    if (payload.expires < Date.now()) return null
    return payload
  } catch { return null }
}

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('mh_session')?.value
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const payload = parseToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
  const user = await getUserById(payload.userId)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
}
