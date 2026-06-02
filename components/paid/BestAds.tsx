'use client'
import { useState, useEffect } from 'react'
import { Trophy, RefreshCw } from 'lucide-react'
import type { Brand } from '@/lib/types'

// Row format: [adName, campaignName, spent, clicks, impressions, reach, leads, messagingConversations, imageUrl]
function parseAds(rows: any[][]) {
  return rows.map((row, i) => ({
    id: i,
    adName: String(row[0] || ''),
    campaignName: String(row[1] || ''),
    spent: parseFloat(row[2] ?? 0) || 0,
    clicks: parseFloat(row[3] ?? 0) || 0,
    impressions: parseFloat(row[4] ?? 0) || 0,
    reach: parseFloat(row[5] ?? 0) || 0,
    leads: parseFloat(row[6] ?? 0) || 0,
    waConversations: parseFloat(row[7] ?? 0) || 0,
    imageUrl: String(row[8] || ''),
  }))
}

const fmt = (n: number) => n ? `$ ${Math.round(n).toLocaleString('es-AR')}` : '—'
const fmtN = (n: number) => n ? Math.round(n).toLocaleString('es-AR') : '—'
const MEDALS = ['🥇', '🥈', '🥉']

interface Props { brand: Brand }

export function BestAds({ brand }: Props) {
  const [ads, setAds] = useState<ReturnType<typeof parseAds>>([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/metricool/meta-ads?brandId=${brand.id}`)
      .then(r => { setUpdatedAt(r.headers.get('X-Updated-At') || ''); return r.json() })
      .then(data => { setAds(Array.isArray(data) ? parseAds(data) : []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [brand.id])

  const sorted = [...ads].sort((a, b) => b.waConversations - a.waConversations)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  if (loading) return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-8 text-center">
      <RefreshCw size={24} className="text-slate-600 mx-auto mb-2 animate-spin" />
      <p className="text-slate-500 text-sm">Cargando anuncios...</p>
    </div>
  )

  if (error || ads.length === 0) return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-10 text-center">
      <Trophy size={32} className="text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400 font-medium">Sin datos de anuncios</p>
      <p className="text-slate-600 text-sm mt-1">Actualizá el cache desde Cowork</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Top 3 anuncios por conversaciones WhatsApp</h2>
          {updatedAt && (
            <p className="text-xs text-slate-500 mt-0.5">
              Datos al {new Date(updatedAt).toLocaleDateString('es-AR')}
            </p>
          )}
        </div>
      </div>

      {/* Top 3 cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {top3.map((ad, i) => (
          <div key={ad.id} className="bg-bg-card border border-bg-border rounded-xl overflow-hidden hover:border-brand-purple/30 transition-all">
            {/* Thumbnail */}
            <div className="relative h-40 bg-bg-elevated">
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.adName}
                  className="w-full h-full object-cover"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                  {MEDALS[i]}
                </div>
              )}
              <div className="absolute top-2 left-2 text-lg">{MEDALS[i]}</div>
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-0.5 truncate" title={ad.adName}>{ad.adName}</h3>
              <p className="text-xs text-slate-500 mb-4 truncate" title={ad.campaignName}>{ad.campaignName}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-elevated rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 mb-1">Conversaciones WA</div>
                  <div className="text-xl font-bold text-green-400">{fmtN(ad.waConversations)}</div>
                </div>
                <div className="bg-bg-elevated rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 mb-1">Inversión</div>
                  <div className="text-sm font-bold text-white">{fmt(ad.spent)}</div>
                </div>
                <div className="bg-bg-elevated rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 mb-1">Costo x resultado</div>
                  <div className="text-sm font-medium text-slate-300">
                    {ad.waConversations > 0 ? fmt(ad.spent / ad.waConversations) : '—'}
                  </div>
                </div>
                <div className="bg-bg-elevated rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-500 mb-1">Impresiones</div>
                  <div className="text-sm font-medium text-slate-300">{fmtN(ad.impressions)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest as table */}
      {rest.length > 0 && (
        <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Resto de anuncios</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Anuncio', 'Campaña', 'Inversión', 'Impresiones', 'Clics', 'Conv. WA', 'Leads', 'Costo/Resultado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rest.map(ad => (
                <tr key={ad.id} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <span className="text-slate-200 font-medium text-xs truncate max-w-[140px]">{ad.adName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{ad.campaignName}</td>
                  <td className="px-4 py-3 font-medium text-white text-xs">{fmt(ad.spent)}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{fmtN(ad.impressions)}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{fmtN(ad.clicks)}</td>
                  <td className="px-4 py-3 font-medium text-green-400 text-xs">{fmtN(ad.waConversations)}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{fmtN(ad.leads)}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {ad.waConversations > 0 ? fmt(ad.spent / ad.waConversations) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
