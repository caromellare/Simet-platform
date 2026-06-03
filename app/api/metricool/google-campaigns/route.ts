import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GoogleCampaign } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const monthParam = searchParams.get('month')

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'google-campaigns.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (raw.brandId !== Number(brandId)) {
      return NextResponse.json([])
    }

    let campaigns: GoogleCampaign[] = parseGoogle(raw)

    // Filter by date range if provided
    if (fromParam || toParam || monthParam) {
      let from = fromParam
      let to = toParam

      if (!from && !to && monthParam) {
        const [y, m] = monthParam.split('-').map(Number)
        const lastDay = new Date(y, m, 0).getDate()
        from = `${y}-${String(m).padStart(2, '0')}-01`
        to = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
      }

      if (from || to) {
        campaigns = campaigns.filter(c => {
          const normalize = (d: string) => d.length === 8 && !d.includes('-')
            ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d.slice(0, 10)
          const startDate = c.start ? normalize(c.start) : null
          const stopDate  = c.stop  ? normalize(c.stop)  : null
          if (!startDate) return true
          const campaignEnd = stopDate || '9999-12-31'
          if (to   && startDate > to)     return false
          if (from && campaignEnd < from) return false
          return true
        })
      }
    }

    return NextResponse.json(campaigns, {
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
    const fmtDate = (raw: string) => raw.length === 8 && !raw.includes('-')
      ? `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` : raw
    return {
      name: s(0) || 'Sin nombre',
      start: fmtDate(s(6)), stop: s(7) ? fmtDate(s(7)) : '',
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
