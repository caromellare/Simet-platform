'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Target } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { Brand, GoogleCampaign } from '@/lib/types'

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmtCurrency(n: number) {
  if (!n || n === 0) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}
function fmt(n: number) { if (!n) return '—'; if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`; return n.toLocaleString('es-AR') }
function fmtPct(n: number) { if (!n) return '—'; return `${(n * 100).toFixed(2)}%` }

const STATUS_COLORS: Record<string, string> = {
  ENABLED: 'text-green-400 bg-green-500/10 border-green-500/25',
  PAUSED: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  REMOVED: 'text-red-400 bg-red-500/10 border-red-500/25',
}

interface Props { brand: Brand }

export function GoogleCampaigns({ brand }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [campaigns, setCampaigns] = useState<GoogleCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!brand.networksData?.googleAdsData) {
      setError('Esta marca no tiene Google Ads conectado en Metricool')
      return
    }
    setLoading(true); setError(null)
    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const res = await fetch(`/api/metricool/google-campaigns?brandId=${brand.id}&month=${monthStr}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar')
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [brand.id, month, year])

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => {
    const isFuture = year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth() + 1)
    if (!isFuture) { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  }

  const totals = campaigns.reduce((acc, c) => ({
    spent: acc.spent + c.spent, impressions: acc.impressions + c.impressions,
    clicks: acc.clicks + c.clicks, conversions: acc.conversions + c.conversions,
  }), { spent: 0, impressions: 0, clicks: 0, conversions: 0 })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-white w-36 text-center">{MONTHS_ES[month - 1]} {year}</span>
          <button onClick={next} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-bg-card border border-bg-border px-3 py-1.5 rounded-lg">
            ID: <span className="text-slate-300">{brand.networksData?.googleAdsData || '—'}</span>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3 mb-5">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">{error}</p>
            <p className="text-xs text-slate-500 mt-0.5">Verificá que Google Ads esté vinculado en Metricool para esta marca.</p>
          </div>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <StatCard label="Inversión" value={fmtCurrency(totals.spent)} color="blue" loading={loading} />
          <StatCard label="Impresiones" value={fmt(totals.impressions)} color="purple" loading={loading} />
          <StatCard label="Clics" value={fmt(totals.clicks)} color="teal" loading={loading} />
          <StatCard label="Conversiones" value={fmt(totals.conversions)} color="green" loading={loading} />
          <StatCard label="CPC prom." value={fmtCurrency(totals.clicks > 0 ? totals.spent / totals.clicks : 0)} color="orange" loading={loading} />
        </div>
      )}

      {loading ? (
        <div className="bg-bg-card border border-bg-border rounded-xl p-8 text-center">
          <RefreshCw size={24} className="text-slate-600 mx-auto mb-2 animate-spin" />
          <p className="text-slate-500 text-sm">Cargando campañas...</p>
        </div>
      ) : campaigns.length === 0 && !error ? (
        <div className="bg-bg-card border border-bg-border rounded-xl p-10 text-center">
          <Target size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin campañas para este período</p>
          <p className="text-slate-600 text-sm mt-1">No hubo campañas de Google Ads en {MONTHS_ES[month - 1]} {year}</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border flex items-center gap-2">
            <div className="flex gap-0.5">
              {['bg-google-blue', 'bg-google-red', 'bg-google-yellow', 'bg-google-green'].map((c, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Campañas Google Ads</span>
            <span className="text-xs text-slate-600">{campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-bg-border">
                  {['Campaña', 'Estado', 'Inversión', 'Impresiones', 'Clics', 'CTR', 'CPC', 'CPM', 'Conversiones', 'ROAS'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200 max-w-[200px] truncate" title={c.name}>{c.name}</div>
                      {c.start && <div className="text-xs text-slate-600 mt-0.5">{c.start.slice(0, 10)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {c.status ? (
                        <span className={`badge border text-xs ${STATUS_COLORS[c.status] || 'text-slate-400 bg-slate-500/10 border-slate-500/25'}`}>
                          {c.status === 'ENABLED' ? 'Activa' : c.status === 'PAUSED' ? 'Pausada' : c.status}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{fmtCurrency(c.spent)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmt(c.impressions)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmt(c.clicks)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtPct(c.ctr)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtCurrency(c.cpc)}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtCurrency(c.cpm)}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{c.conversions ? c.conversions.toFixed(1) : '—'}</td>
                    <td className="px-4 py-3">
                      {c.roas ? (
                        <span className={`font-medium ${c.roas >= 2 ? 'text-green-400' : c.roas >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                          {c.roas.toFixed(2)}x
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
