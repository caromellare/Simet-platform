import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'meta-ads.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (raw.brandId !== Number(brandId)) return NextResponse.json([])
    return NextResponse.json(raw.rows || [], {
      headers: { 'X-Updated-At': raw.updatedAt || '' }
    })
  } catch {
    return NextResponse.json({ error: 'Sin datos' }, { status: 404 })
  }
}
