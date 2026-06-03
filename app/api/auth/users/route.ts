import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAllUsers, createUser, getUserByEmail, updateUser, deleteUserById } from '@/lib/db'

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
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await updateUser(id, {
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
    ...(password && { passwordHash: hashPassword(password) }),
  })
  return NextResponse.json({ success: true })
}

// DELETE /api/auth/users - delete user
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const deleted = await deleteUserById(id)
  if (!deleted) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true })
}
