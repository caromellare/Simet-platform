import { NextResponse } from 'next/server'
import { getAnalyticsData, INSTAGRAM_METRICS, startOfMonth, endOfMonth } from '@/lib/metricool'

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
    const raw = await getAnalyticsData(brandId, from, to, INSTAGRAM_METRICS, token, userId)
    // Parse totals from time series
    const stats = aggregateStats(raw)
    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('[API] social-stats error:', err)
    return NextResponse.json({ error: err.message || 'Error Metricool' }, { status: 500 })
  }
}

function aggregateStats(raw: any) {
  if (!raw?.data || !Array.isArray(raw.data)) return null

  // Sum up daily values
  const totals = raw.data.reduce((acc: any, row: any) => {
    acc.followers = Math.max(acc.followers || 0, parseInt(row.IGEV01 || 0))
    acc.followersGrowth = (acc.followersGrowth || 0) + parseInt(row.IGEV03 || 0)
    acc.posts = (acc.posts || 0) + parseInt(row.IGEV04 || 0)
    acc.reach = (acc.reach || 0) + parseInt(row.IGEV06 || 0)
    acc.interactions = (acc.interactions || 0) + parseInt(row.IGEV09 || 0)
    acc.stories = (acc.stories || 0) + parseInt(row.IGEV16 || 0)
    acc.reels = (acc.reels || 0) + parseInt(row.IGEV22 || 0)
    acc.reelsViews = (acc.reelsViews || 0) + parseInt(row.IGEV23 || 0)
    return acc
  }, {})

  return totals
}
