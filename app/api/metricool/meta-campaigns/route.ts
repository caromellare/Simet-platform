import { NextResponse } from 'next/server'
import { getAnalyticsData, META_CAMPAIGN_METRICS, startOfMonth, endOfMonth } from '@/lib/metricool'
import type { MetaCampaign } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = Number(searchParams.get('brandId') || process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID || 1674000)
  const monthParam = searchParams.get('month') // YYYY-MM

  const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date()
  const from = startOfMonth(refDate)
  const to = endOfMonth(refDate)

  try {
    const raw = await getAnalyticsData(brandId, from, to, META_CAMPAIGN_METRICS)
    const campaigns: MetaCampaign[] = parseMeta(raw)
    return NextResponse.json(campaigns)
  } catch (err: any) {
    console.error('[API] meta-campaigns error:', err)
    return NextResponse.json({ error: err.message || 'Error Metricool' }, { status: 500 })
  }
}

function parseMeta(raw: any): MetaCampaign[] {
  // Metricool analytics returns rows where each row is keyed by fieldId
  if (!raw?.data || !Array.isArray(raw.data)) return []

  return raw.data.map((row: any, i: number) => {
    const spent = parseFloat(row.FACA13 || 0)
    const clicks = parseInt(row.FACA14 || 0)
    const impressions = parseInt(row.FACA10 || 0)
    const results = parseInt(row.FACA156 || 0)

    return {
      id: row.FACA06 || String(i),
      name: row.FACA05 || 'Sin nombre',
      start: row.FACA03 || '',
      stop: row.FACA04 || '',
      objective: row.FACA07 || '',
      impressions,
      reach: parseInt(row.FACA12 || 0),
      clicks,
      spent,
      cpc: parseFloat(row.FACA19 || 0),
      cpm: parseFloat(row.FACA20 || 0),
      ctr: parseFloat(row.FACA21 || 0),
      leads: parseInt(row.FACA41 || 0),
      messagingConversations: parseInt(row.FACA77 || 0),
      results,
      resultsLabel: row.FACA157 || '',
      costPerResult: results > 0 ? spent / results : 0,
    } satisfies MetaCampaign
  })
}
