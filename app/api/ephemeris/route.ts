import { NextResponse } from 'next/server'
import {
  getEphemeris, createEphemerisEntry, updateEphemerisEntry, deleteEphemerisEntry
} from '@/lib/db'

// GET /api/ephemeris?brand=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand') ?? undefined
  const rows = await getEphemeris(brand)
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    date: r.date,
    title: r.title,
    type: r.type,
    notes: r.notes,
    brand: r.brand,
    recurring: r.recurring,
    createdAt: r.created_at,
  })))
}

// POST /api/ephemeris
export async function POST(req: Request) {
  const data = await req.json()
  const row = await createEphemerisEntry(data)
  return NextResponse.json({ id: row.id, date: row.date, title: row.title, type: row.type,
    notes: row.notes, brand: row.brand, recurring: row.recurring, createdAt: row.created_at }, { status: 201 })
}

// PUT /api/ephemeris  { id, ...fields }
export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const row = await updateEphemerisEntry(id, data)
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ id: row.id, date: row.date, title: row.title, type: row.type,
    notes: row.notes, brand: row.brand, recurring: row.recurring, createdAt: row.created_at })
}

// DELETE /api/ephemeris  { id }
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await deleteEphemerisEntry(id)
  return NextResponse.json({ success: true })
}
