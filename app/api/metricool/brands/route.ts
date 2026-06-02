import { NextResponse } from 'next/server'
import { getBrands } from '@/lib/metricool'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  // Accept token from query param (from settings page) or fall back to env var
  const token = searchParams.get('token') || undefined
  const userId = searchParams.get('userId') || undefined

  try {
    const brands = await getBrands(token, userId)
    return NextResponse.json(brands)
  } catch (err) {
    console.error('[API] brands error:', err)
    return NextResponse.json({ error: 'No se pudo conectar a Metricool. Verificá el token.' }, { status: 500 })
  }
}
