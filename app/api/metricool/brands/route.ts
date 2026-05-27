import { NextResponse } from 'next/server'
import { getBrands } from '@/lib/metricool'

export async function GET() {
  try {
    const brands = await getBrands()
    return NextResponse.json(brands)
  } catch (err) {
    console.error('[API] brands error:', err)
    return NextResponse.json({ error: 'No se pudo conectar a Metricool' }, { status: 500 })
  }
}
