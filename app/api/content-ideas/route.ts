import { NextResponse } from 'next/server'
import {
  getContentIdeas, createContentIdea, updateContentIdea, deleteContentIdea, mapContentIdeaRow
} from '@/lib/db'

// GET /api/content-ideas?brand=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand') ?? undefined
  const rows = await getContentIdeas(brand)
  return NextResponse.json(rows.map(mapContentIdeaRow))
}

// POST /api/content-ideas
export async function POST(req: Request) {
  const data = await req.json()
  const row = await createContentIdea(data)
  return NextResponse.json(mapContentIdeaRow(row), { status: 201 })
}

// PUT /api/content-ideas  { id, ...fields }
export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const row = await updateContentIdea(id, data)
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(mapContentIdeaRow(row))
}

// DELETE /api/content-ideas  { id }
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await deleteContentIdea(id)
  return NextResponse.json({ success: true })
}
