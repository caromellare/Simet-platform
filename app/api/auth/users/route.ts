import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAllUsers, createUser, getUserByEmail, sql } from '@/lib/db'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'

function hashPassword(pass: string) {
  return createHash('sha256').update(pass + SESSION_SECRET).digest('hex')
}

// GET /api/auth/users - list users (admin only)
export async function GET() {
  const users = await getAllUsers()
  return NextResponse.json(users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at
  })))
}

// POST /api/auth/users - create user
export async function POST(req: Request) {
  const { name, email, password, role } = await req.json()
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }
  const existing = await getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 })
  }
  const user = await createUser({ name, email, passwordHash: hashPassword(password), role })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at })
}

// PATCH /api/auth/users - update user
export async function PATCH(req: Request) {
  const { id, name, email, role, password } = await req.json()
  const updates: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (name)     { updates.push(`name = $${idx++}`);          values.push(name) }
  if (email)    { updates.push(`email = $${idx++}`);         values.push(email) }
  if (role)     { updates.push(`role = $${idx++}`);          values.push(role) }
  if (password) { updates.push(`password_hash = $${idx++}`); values.push(hashPassword(password)) }

  if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

  values.push(id)
  await sql.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  return NextResponse.json({ success: true })
}

// DELETE /api/auth/users - delete user
export async function DELETE(req: Request) {
  const { id } = await req.json()
  const { rowCount } = await sql`DELETE FROM users WHERE id = ${id}`
  if (!rowCount) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true })
}
