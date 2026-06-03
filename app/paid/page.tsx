'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DollarSign, Facebook, Search, Lightbulb, Trophy } from 'lucide-react'
import { MetaCampaigns } from '@/components/paid/MetaCampaigns'
import { GoogleCampaigns } from '@/components/paid/GoogleCampaigns'
import { CampaignIdeas } from '@/components/paid/CampaignIdeas'
import { BestAds } from '@/components/paid/BestAds'
import type { Brand, PaidView } from '@/lib/types'

const DEFAULT_BRAND = { id: 1674000, label: 'Simet Fábrica' } as Brand

const TABS: { key: PaidView; label: string; icon: React.ReactNode }[] = [
  { key: 'meta', label: 'Meta Ads', icon: <Facebook size={14} /> },
  { key: 'google', label: 'Google Ads', icon: <Search size={14} /> },
  { key: 'ideas', label: 'Ideas & Próximas', icon: <Lightbulb size={14} /> },
  { key: 'best-ads', label: 'Mejores Anuncios', icon: <Trophy size={14} /> },
]

function PaidPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabFromUrl = (searchParams.get('tab') as PaidView) || 'meta'
  const [view, setView] = useState<PaidView>(tabFromUrl)
  const [brand] = useState<Brand>(DEFAULT_BRAND)

  useEffect(() => {
    const t = (searchParams.get('tab') as PaidView) || 'meta'
    if (TABS.find(tab => tab.key === t)) setView(t)
  }, [searchParams])

  function changeTab(key: PaidView) {
    setView(key)
    router.push(`/paid?tab=${key}`, { scroll: false })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-orange/10 border border-brand-orange/25 flex items-center justify-center">
            <DollarSign size={18} className="text-brand-orange" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Paid Media</h1>
            <p className="text-xs text-slate-500">Campañas activas de Meta Ads y Google Ads — datos vía Metricool</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-bg-card border border-bg-border rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => changeTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === tab.key
                ? tab.key === 'meta' ? 'bg-meta-blue/15 text-meta-blue-light border border-meta-blue/25'
                  : tab.key === 'google' ? 'bg-google-blue/15 text-blue-300 border border-google-blue/25'
                  : tab.key === 'best-ads' ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/25'
                  : 'bg-brand-purple/15 text-brand-purple border border-brand-purple/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={view}>
        {view === 'meta' && <MetaCampaigns brand={brand} />}
        {view === 'google' && <GoogleCampaigns brand={brand} />}
        {view === 'ideas' && <CampaignIdeas brand={brand} />}
        {view === 'best-ads' && <BestAds brand={brand} />}
      </div>
    </div>
  )
}

export default function PaidPage() {
  return (
    <Suspense>
      <PaidPageInner />
    </Suspense>
  )
}
