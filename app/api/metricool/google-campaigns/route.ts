import { NextResponse } from 'next/server'
import { getAnalyticsData, GOOGLE_CAMPAIGN_METRICS, startOfMonth, endOfMonth } from '@/lib/metricool'
import type { GoogleCampaign } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = Number(searchParams.get('brandId') || process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID || 1674000)
  const monthParam = searchParams.get('month')

  const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date()
  const from = startOfMonth(refDate)
  const to = endOfMonth(refDate)

  try {
    const raw = await getAnalyticsData(brandId, from, to, GOOGLE_CAMPAIGN_METRICS)
    const campaigns: GoogleCampaign[] = parseGoogle(raw)
    return NextResponse.json(campaigns)
  } catch (err: any) {
    console.error('[API] google-campaigns error:', err)
    return NextResponse.json({ error: err.message || 'Error Metricool' }, { status: 500 })
  }
}

function parseGoogle(raw: any): GoogleCampaign[] {
  if (!raw?.data || !Array.isArray(raw.data)) return []
  return raw.data.map((row: any) => ({
    name: row.GACA01 || 'Sin nombre',
    start: row.GACA02 || '',
    stop: row.GACA12 || '',
    impressions: parseInt(row.GACA03 || 0),
    clicks: parseInt(row.GACA04 || 0),
    conversions: parseFloat(row.GACA05 || 0),
    spent: parseFloat(row.GACA07 || 0),
    cpm: parseFloat(row.GACA08 || 0),
    cpc: parseFloat(row.GACA09 || 0),
    ctr: parseFloat(row.GACA10 || 0),
    roas: parseFloat(row.GACA11 || 0),
    status: row.GACA13 || '',
  } satisfies GoogleCampaign))
}
