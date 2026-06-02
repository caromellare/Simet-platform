import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'social-stats.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (raw.brandId !== Number(brandId)) return NextResponse.json(null)
    // Return the pre-aggregated object directly
    return NextResponse.json(raw.aggregated || null, {
      headers: {
        'X-Updated-At': raw.updatedAt || '',
        'X-Period': raw.period || '',
        'X-From': raw.from || '',
        'X-To': raw.to || '',
      }
    })
  } catch {
    return NextResponse.json({ error: 'Sin datos en cache.' }, { status: 404 })
  }
}
