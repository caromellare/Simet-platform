import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GoogleCampaign } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'google-campaigns.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (raw.brandId !== Number(brandId)) {
      return NextResponse.json([])
    }

    return NextResponse.json(parseGoogle(raw), {
      headers: { 'X-Updated-At': raw.updatedAt || '', 'X-Month': raw.month || '' }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'No hay datos en cache.' }, { status: 404 })
  }
}

function parseGoogle(raw: any): GoogleCampaign[] {
  // 0:name, 1:impressions, 2:clicks, 3:conversions, 4:convValue, 5:spent, 6:start, 7:stop, 8:status
  if (!raw?.rows || !Array.isArray(raw.rows)) return []
  return raw.rows.map((row: any[]) => {
    const n = (idx: number) => parseFloat(row[idx] ?? 0) || 0
    const s = (idx: number) => String(row[idx] ?? '')
    const impressions = n(1), clicks = n(2), spent = n(5), convValue = n(4)
    return {
      name: s(0) || 'Sin nombre',
      start: s(6), stop: s(7),
      impressions, clicks,
      conversions: n(3),
      spent,
      cpm: impressions > 0 ? (spent / impressions) * 1000 : 0,
      cpc: clicks > 0 ? spent / clicks : 0,
      ctr: impressions > 0 ? clicks / impressions : 0,
      roas: spent > 0 ? convValue / spent : 0,
      status: s(8),
    } satisfies GoogleCampaign
  })
}
