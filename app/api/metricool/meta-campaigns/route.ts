import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { MetaCampaign } from '@/lib/types'

// Reads from /public/data/meta-campaigns.json
// Accepts ?from=YYYY-MM-DD&to=YYYY-MM-DD or legacy ?month=YYYY-MM
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  // Legacy support
  const monthParam = searchParams.get('month')

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'meta-campaigns.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (raw.brandId !== Number(brandId)) {
      return NextResponse.json([], { headers: { 'X-Cache': 'MISS' } })
    }

    let campaigns: MetaCampaign[] = parseMeta(raw)

    // Filter by date range if provided
    if (fromParam || toParam || monthParam) {
      let from = fromParam
      let to = toParam

      // Legacy month param: convert to first/last of month
      if (!from && !to && monthParam) {
        const [y, m] = monthParam.split('-').map(Number)
        const lastDay = new Date(y, m, 0).getDate()
        from = `${y}-${String(m).padStart(2, '0')}-01`
        to = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
      }

      if (from || to) {
        campaigns = campaigns.filter(c => {
          // Normalizar fecha: YYYYMMDD → YYYY-MM-DD
          const normalize = (d: string) => d.length === 8 && !d.includes('-')
            ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d.slice(0, 10)
          const startDate = c.start ? normalize(c.start) : null
          const stopDate  = c.stop  ? normalize(c.stop)  : null
          if (!startDate) return true
          // Campaña activa (sin stop) o con overlap con el rango pedido
          const campaignEnd = stopDate || '9999-12-31'
          if (to   && startDate > to)   return false // empieza después del rango
          if (from && campaignEnd < from) return false // termina antes del rango
          return true
        })
      }
    }

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

    const fmtDate = (raw: string) => raw.length === 8 && !raw.includes('-')
      ? `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` : raw

    return {
      id:                     String(i),
      name:                   s(0) || 'Sin nombre',
      start:                  fmtDate(s(9)),
      stop:                   s(10) ? fmtDate(s(10)) : '',
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
