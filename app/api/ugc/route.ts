import { NextResponse } from 'next/server'
import {
  getUGCCreators, createUGCCreator, updateUGCCreator, deleteUGCCreator, mapUGCRow
} from '@/lib/db'

// GET /api/ugc?brand=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand') ?? undefined
  const rows = await getUGCCreators(brand)
  return NextResponse.json(rows.map(mapUGCRow))
}

// POST /api/ugc
export async function POST(req: Request) {
  const data = await req.json()
  const row = await createUGCCreator(data)
  return NextResponse.json(mapUGCRow(row), { status: 201 })
}

// PUT /api/ugc  { id, ...fields }
export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const row = await updateUGCCreator(id, data)
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(mapUGCRow(row))
}

// DELETE /api/ugc  { id }
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await deleteUGCCreator(id)
  return NextResponse.json({ success: true })
}
