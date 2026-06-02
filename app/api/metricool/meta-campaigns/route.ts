import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { MetaCampaign } from '@/lib/types'

// Reads from /public/data/meta-campaigns.json
// This file is updated via Cowork scheduled task (Metricool MCP → JSON → git push → Vercel redeploy)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'meta-campaigns.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (raw.brandId !== Number(brandId)) {
      return NextResponse.json([], { headers: { 'X-Cache': 'MISS' } })
    }

    const campaigns: MetaCampaign[] = parseMeta(raw)
    return NextResponse.json(campaigns, {
      headers: {
        'X-Cache': 'HIT',
        'X-Updated-At': raw.updatedAt || '',
        'X-Month': raw.month || '',
      }
    })
  } catch (err: any) {
    console.error('[API] meta-campaigns error:', err)
    return NextResponse.json({ error: 'No hay datos en cache. Actualizá desde Cowork.' }, { status: 404 })
  }
}

function parseMeta(raw: any): MetaCampaign[] {
  // Positional rows: 0:name, 1:spent, 2:clicks, 3:impressions, 4:reach,
  // 5:leads, 6:messagingConversations, 7:results, 8:resultsLabel,
  // 9:start, 10:stop, 11:objective
  if (!raw?.rows || !Array.isArray(raw.rows)) return []

  return raw.rows.map((row: any[], i: number) => {
    const n    = (idx: number) => parseFloat(row[idx] ?? 0) || 0
    const s    = (idx: number) => String(row[idx] ?? '')

    const spent       = n(1)
    const clicks      = n(2)
    const impressions = n(3)
    const results     = n(7)

    return {
      id:                     String(i),
      name:                   s(0) || 'Sin nombre',
      start:                  s(9),
      stop:                   s(10),
      objective:              s(11),
      impressions,
      reach:                  n(4),
      clicks,
      spent,
      cpc:                    clicks > 0 ? spent / clicks : 0,
      cpm:                    impressions > 0 ? (spent / impressions) * 1000 : 0,
      ctr:                    impressions > 0 ? clicks / impressions : 0,
      leads:                  n(5),
      messagingConversations: n(6),
      results,
      resultsLabel:           s(8),
      costPerResult:          results > 0 ? spent / results : 0,
    } satisfies MetaCampaign
  })
}
