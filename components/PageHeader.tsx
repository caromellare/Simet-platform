'use client'
import { BrandSelector } from './BrandSelector'
import type { Brand } from '@/lib/types'

interface Props {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  selectedBrandId: number
  onBrandChange: (brand: Brand) => void
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, icon, selectedBrandId, onBrandChange, actions }: Props) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-bg-border">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <BrandSelector selectedBrandId={selectedBrandId} onChange={onBrandChange} />
      </div>
    </div>
  )
}
