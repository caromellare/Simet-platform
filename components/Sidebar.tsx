'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Share2, DollarSign,
  Megaphone, Zap, ChevronRight, Settings, CheckSquare
} from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'text-brand-purple' },
  { href: '/ugc', label: 'UGC / Influencers', icon: Users, color: 'text-brand-pink' },
  { href: '/social', label: 'Social Media', icon: Share2, color: 'text-brand-teal' },
  { href: '/tareas', label: 'Tareas', icon: CheckSquare, color: 'text-brand-green' },
  { href: '/paid', label: 'Paid Media', icon: DollarSign, color: 'text-brand-orange' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-bg-card border-r border-bg-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center">
            <Zap size={16} className="text-brand-purple" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">Marketing Hub</div>
            <div className="text-xs text-slate-500">by OM + Digital</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, color }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? 'bg-brand-purple/15 text-white border border-brand-purple/25'
                  : 'text-slate-400 hover:bg-bg-elevated hover:text-slate-200 border border-transparent'
                }
              `}
            >
              <Icon size={17} className={active ? color : 'text-slate-500 group-hover:text-slate-400'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="text-brand-purple/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-bg-border pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-bg-elevated transition-all"
        >
          <Settings size={15} />
          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  )
}
