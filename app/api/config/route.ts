import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/config — devuelve la config global (token enmascarado)
export async function GET() {
  try {
    const rows = await sql`SELECT key, value FROM platform_config`
    const config: Record<string, string> = {}
    for (const row of rows) {
      config[row.key as string] = row.key === 'metricool_user_token'
        ? (row.value ? '••••••' : '')   // enmascarar token al leer
        : row.value as string
    }
    // Fallback a env vars si la DB está vacía
    return NextResponse.json({
      userId:      config.metricool_user_id    || process.env.METRICOOL_USER_ID    || '1010863',
      hasToken:    !!(config.metricool_user_token || process.env.METRICOOL_USER_TOKEN),
      brandId:     config.default_brand_id     || process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID    || '1674000',
      brandName:   config.default_brand_name   || process.env.NEXT_PUBLIC_DEFAULT_BRAND_NAME  || 'Simet Fábrica',
    })
  } catch {
    // Si la tabla no existe aún, usar env vars
    return NextResponse.json({
      userId:    process.env.METRICOOL_USER_ID   || '1010863',
      hasToken:  !!process.env.METRICOOL_USER_TOKEN,
      brandId:   process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID   || '1674000',
      brandName: process.env.NEXT_PUBLIC_DEFAULT_BRAND_NAME || 'Simet Fábrica',
    })
  }
}

// PUT /api/config — guarda la config (solo admins, verificado en middleware)
export async function PUT(req: Request) {
  const body = await req.json()
  const updates: Record<string, string> = {}

  if (body.userToken !== undefined && body.userToken !== '••••••') {
    updates.metricool_user_token = body.userToken
  }
  if (body.userId)     updates.metricool_user_id  = body.userId
  if (body.brandId)    updates.default_brand_id   = body.brandId
  if (body.brandName)  updates.default_brand_name = body.brandName

  try {
    for (const [key, value] of Object.entries(updates)) {
      await sql`
        INSERT INTO platform_config (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
      `
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
