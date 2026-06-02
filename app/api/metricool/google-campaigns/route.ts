import { NextResponse } from 'next/server'
import { getAnalyticsData, GOOGLE_CAMPAIGN_METRICS, startOfMonth, endOfMonth } from '@/lib/metricool'
import type { GoogleCampaign } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = Number(searchParams.get('brandId') || process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID || 1674000)
  const monthParam = searchParams.get('month')
  const token = searchParams.get('token') || undefined
  const userId = searchParams.get('userId') || undefined

  const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date()
  const from = startOfMonth(refDate)
  const to = endOfMonth(refDate)

  try {
    const raw = await getAnalyticsData(brandId, from, to, GOOGLE_CAMPAIGN_METRICS, token, userId)
    const campaigns: GoogleCampaign[] = parseGoogle(raw)
    return NextResponse.json(campaigns)
  } catch (err: any) {
    console.error('[API] google-campaigns error:', err)
    return NextResponse.json({ error: err.message || 'Error Metricool' }, { status: 500 })
  }
}

function parseGoogle(raw: any): GoogleCampaign[] {
  // Positional rows — matches GOOGLE_CAMPAIGN_METRICS order:
  // 0:name, 1:impressions, 2:clicks, 3:conversions, 4:conversionsValue,
  // 5:spent, 6:start, 7:stop, 8:status
  if (!raw?.rows || !Array.isArray(raw.rows)) return []
  return raw.rows.map((row: any[]) => {
    const n = (idx: number) => parseFloat(row[idx] ?? 0) || 0
    const s = (idx: number) => String(row[idx] ?? '')
    const impressions = n(1)
    const clicks      = n(2)
    const spent       = n(5)
    const convValue   = n(4)
    return {
      name:        s(0) || 'Sin nombre',
      start:       s(6),
      stop:        s(7),
      impressions,
      clicks,
      conversions: n(3),
      spent,
      cpm:         impressions > 0 ? (spent / impressions) * 1000 : 0,
      cpc:         clicks > 0 ? spent / clicks : 0,
      ctr:         impressions > 0 ? clicks / impressions : 0,
      roas:        spent > 0 ? convValue / spent : 0,
      status:      s(8),
    } satisfies GoogleCampaign
  })
}
