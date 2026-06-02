'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import type { Brand } from '@/lib/types'

interface Props {
  selectedBrandId: number
  onChange: (brand: Brand) => void
}

export function BrandSelector({ selectedBrandId, onChange }: Props) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read token from localStorage (set in Settings page)
    let url = '/api/metricool/brands'
    try {
      const stored = localStorage.getItem('metricool_config')
      if (stored) {
        const cfg = JSON.parse(stored)
        if (cfg.userToken) {
          url += `?token=${encodeURIComponent(cfg.userToken)}&userId=${cfg.userId || '1010863'}`
        }
      }
    } catch {}

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setBrands(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const selected = brands.find(b => b.id === selectedBrandId)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-elevated border border-bg-border hover:border-brand-purple/40 transition-all text-sm"
      >
        {selected?.image ? (
          <img src={selected.image} alt="" className="w-6 h-6 rounded-md object-cover" />
        ) : (
          <Building2 size={16} className="text-slate-400" />
        )}
        <span className="text-slate-200 font-medium max-w-[140px] truncate">
          {loading ? 'Cargando...' : (selected?.label || 'Seleccionar marca')}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-bg-elevated border border-bg-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="max-h-72 overflow-y-auto py-1">
              {brands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => { onChange(brand); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-card transition-colors text-left ${
                    brand.id === selectedBrandId ? 'bg-brand-purple/10' : ''
                  }`}
                >
                  {brand.image ? (
                    <img src={brand.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{brand.label}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {[
                        brand.networksData?.instagramData && 'IG',
                        brand.networksData?.facebookAdsData && 'Meta Ads',
                        brand.networksData?.googleAdsData && 'Google Ads',
                        brand.networksData?.tiktokData && 'TikTok',
                      ].filter(Boolean).join(' · ') || 'Sin redes conectadas'}
                    </div>
                  </div>
                  {brand.id === selectedBrandId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
