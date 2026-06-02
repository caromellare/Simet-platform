// Metricool REST API client
// Docs: https://app.metricool.com/resources/apidocs/index.html
// Auth: X-Mc-Auth header + userId + blogId query params

const BASE_URL = 'https://app.metricool.com/api'

// Token and userId can come from env vars OR be passed explicitly (from settings page)
const getHeaders = (token?: string) => ({
  'X-Mc-Auth': token || process.env.METRICOOL_USER_TOKEN || '',
  'Content-Type': 'application/json',
})

const getUserId = (uid?: string) => uid || process.env.METRICOOL_USER_ID || ''

// Keep old exports for backward compat
const headers = () => getHeaders()
const userId = () => getUserId()

// ─── Brands ──────────────────────────────────────────────────────────
export async function getBrands(token?: string, uid?: string) {
  const res = await fetch(
    `${BASE_URL}/admin/simpleProfiles?userId=${getUserId(uid)}&blogId=0`,
    { headers: getHeaders(token), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`Metricool brands error: ${res.status}`)
  const data = await res.json()
  return data.data || []
}

// ─── Analytics Data (Data Studio format) ─────────────────────────────
export async function getAnalyticsData(
  brandId: number,
  from: string,
  to: string,
  metrics: string[],
  token?: string,
  uid?: string
) {
  const params = new URLSearchParams({
    userId: getUserId(uid),
    blogId: String(brandId),
  })

  const res = await fetch(
    `${BASE_URL}/analytics/v2/report?${params}`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ from, to, fields: metrics }),
      next: { revalidate: 900 },
    }
  )
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Metricool analytics error ${res.status}: ${txt}`)
  }
  return res.json()
}

// ─── Meta Ads Campaigns ───────────────────────────────────────────────
// IMPORTANT: Only raw metrics — NO formula metrics (FACA19/20/21 are formulas, calculated client-side)
// Response format: { rows: [[val0, val1, ...], ...] } — positional, matches order below
export const META_CAMPAIGN_METRICS = [
  'FACA05', // 0: name
  'FACA13', // 1: spent
  'FACA14', // 2: clicks
  'FACA10', // 3: impressions
  'FACA12', // 4: reach
  'FACA41', // 5: leads
  'FACA77', // 6: messaging conversations (WhatsApp)
  'FACA156', // 7: results
  'FACA157', // 8: results label
  'FACA03', // 9: start date
  'FACA04', // 10: stop date
  'FACA07', // 11: objective
]

// ─── Google Ads Campaigns ─────────────────────────────────────────────
// Only raw metrics — CPC/CPM/CTR/ROAS calculated client-side
export const GOOGLE_CAMPAIGN_METRICS = [
  'GACA01', // 0: name
  'GACA03', // 1: impressions
  'GACA04', // 2: clicks
  'GACA05', // 3: conversions
  'GACA06', // 4: conversions value (for ROAS)
  'GACA07', // 5: spent
  'GACA02', // 6: start
  'GACA12', // 7: stop
  'GACA13', // 8: status
]

// ─── Instagram Evolution ──────────────────────────────────────────────
export const INSTAGRAM_METRICS = [
  'IGEV01', // 0: followers
  'IGEV03', // 1: follows gained/lost
  'IGEV04', // 2: posts
  'IGEV06', // 3: reach
  'IGEV09', // 4: post interactions
  'IGEV16', // 5: stories
  'IGEV22', // 6: reels
  'IGEV23', // 7: reels views
]

// ─── Scheduled Posts ─────────────────────────────────────────────────
export async function getScheduledPosts(brandId: number, from: string, to: string) {
  const params = new URLSearchParams({
    userId: userId(),
    blogId: String(brandId),
    init: from,
    end: to,
  })
  const res = await fetch(
    `${BASE_URL}/v2/scheduler/posts?${params}`,
    { headers: headers(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Metricool scheduler error: ${res.status}`)
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────
export function formatDateForAPI(date: Date): string {
  // Format: YYYY-MM-DDTHH:MM:SS-03:00
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${y}-${m}-${d}T${h}:${min}:${s}-03:00`
}

export function startOfMonth(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
  return formatDateForAPI(d)
}

export function endOfMonth(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return formatDateForAPI(d)
}
