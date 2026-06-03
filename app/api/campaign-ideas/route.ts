import { NextResponse } from 'next/server'
import {
  getCampaignIdeas, createCampaignIdea, updateCampaignIdea, deleteCampaignIdea, mapCampaignIdeaRow
} from '@/lib/db'

// GET /api/campaign-ideas?brand=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand') ?? undefined
  const rows = await getCampaignIdeas(brand)
  return NextResponse.json(rows.map(mapCampaignIdeaRow))
}

// POST /api/campaign-ideas
export async function POST(req: Request) {
  const data = await req.json()
  const row = await createCampaignIdea(data)
  return NextResponse.json(mapCampaignIdeaRow(row), { status: 201 })
}

// PUT /api/campaign-ideas  { id, ...fields }
export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  const row = await updateCampaignIdea(id, data)
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(mapCampaignIdeaRow(row))
}

// DELETE /api/campaign-ideas  { id }
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  await deleteCampaignIdea(id)
  return NextResponse.json({ success: true })
}
