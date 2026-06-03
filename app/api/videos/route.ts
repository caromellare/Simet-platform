import { NextResponse } from 'next/server'
import { getVideos, createVideo, updateVideo, deleteVideo, mapVideoRow } from '@/lib/db'

// GET /api/videos?brand=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand') ?? undefined
  const rows = await getVideos(brand)
  return NextResponse.json(rows.map(mapVideoRow))
}

// POST /api/videos
export async function POST(req: Request) {
  const data = await req.json()
  const row = await createVideo(data)
  return NextResponse.json(mapVideoRow(row), { status: 201 })
}

// PUT /api/videos  { id, ...fields }
export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const row = await updateVideo(id, data)
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(mapVideoRow(row))
}

// DELETE /api/videos  { id }
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await deleteVideo(id)
  return NextResponse.json({ success: true })
}
