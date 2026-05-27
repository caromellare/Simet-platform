interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: number // percentage change
  color?: 'purple' | 'blue' | 'teal' | 'orange' | 'green' | 'pink' | 'red'
  icon?: React.ReactNode
  loading?: boolean
}

const COLOR_MAP = {
  purple: { bg: 'bg-brand-purple/10', border: 'border-brand-purple/20', text: 'text-brand-purple', dot: 'bg-brand-purple' },
  blue: { bg: 'bg-meta-blue/10', border: 'border-meta-blue/20', text: 'text-meta-blue', dot: 'bg-meta-blue' },
  teal: { bg: 'bg-brand-teal/10', border: 'border-brand-teal/20', text: 'text-brand-teal', dot: 'bg-brand-teal' },
  orange: { bg: 'bg-brand-orange/10', border: 'border-brand-orange/20', text: 'text-brand-orange', dot: 'bg-brand-orange' },
  green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green', dot: 'bg-brand-green' },
  pink: { bg: 'bg-brand-pink/10', border: 'border-brand-pink/20', text: 'text-brand-pink', dot: 'bg-brand-pink' },
  red: { bg: 'bg-brand-red/10', border: 'border-brand-red/20', text: 'text-brand-red', dot: 'bg-brand-red' },
}

export function StatCard({ label, value, sub, trend, color = 'purple', icon, loading }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className={`bg-bg-card border rounded-xl p-4 card-hover ${c.border}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
        {icon && (
          <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
            <span className={c.text}>{icon}</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-bg-elevated rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      <div className="flex items-center gap-2 mt-2">
        {trend !== undefined && !loading && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
    </div>
  )
}
