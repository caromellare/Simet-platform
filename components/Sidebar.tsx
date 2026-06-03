'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Share2, DollarSign, CheckSquare,
  Zap, ChevronRight, ChevronDown, Settings, Sun, Moon,
  Calendar, LayoutGrid, Lightbulb, BarChart2,
  Facebook, Search, Trophy, Video, ListChecks,
  LogOut
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface NavChild {
  href: string
  label: string
  icon: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<any>
  color: string
  children?: NavChild[]
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-brand-purple' },
  { href: '/ugc', label: 'UGC / Influencers', icon: Users, color: 'text-brand-pink' },
  {
    href: '/social', label: 'Social Media', icon: Share2, color: 'text-brand-teal',
    children: [
      { href: '/social?tab=calendar', label: 'Calendario', icon: <Calendar size={13} /> },
      { href: '/social?tab=kanban', label: 'Videos', icon: <LayoutGrid size={13} /> },
      { href: '/social?tab=ideas', label: 'Ideas', icon: <Lightbulb size={13} /> },
      { href: '/social?tab=report', label: 'Reportes', icon: <BarChart2 size={13} /> },
    ]
  },
  {
    href: '/tareas', label: 'Tareas', icon: CheckSquare, color: 'text-brand-green',
    children: [
      { href: '/tareas?tab=tareas', label: 'Kanban', icon: <ListChecks size={13} /> },
      { href: '/tareas?tab=videos', label: 'Videos en pauta', icon: <Video size={13} /> },
    ]
  },
  {
    href: '/paid', label: 'Paid Media', icon: DollarSign, color: 'text-brand-orange',
    children: [
      { href: '/paid?tab=meta', label: 'Meta Ads', icon: <Facebook size={13} /> },
      { href: '/paid?tab=google', label: 'Google Ads', icon: <Search size={13} /> },
      { href: '/paid?tab=best-ads', label: 'Mejores Anuncios', icon: <Trophy size={13} /> },
      { href: '/paid?tab=ideas', label: 'Ideas & Próximas', icon: <Lightbulb size={13} /> },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [expanded, setExpanded] = useState<string[]>(['/social', '/paid', '/tareas'])

  function toggleExpand(href: string) {
    setExpanded(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href])
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-50" style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
      {/* SIMET Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white font-bold text-sm">S</div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">SIMET</div>
            <div className="text-[10px] text-slate-400 leading-tight">Marketing Hub</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV.map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expanded.includes(item.href)

          return (
            <div key={item.href}>
              <div
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  active
                    ? 'bg-brand-purple/15 text-white border border-brand-purple/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
                onClick={() => hasChildren ? toggleExpand(item.href) : undefined}
              >
                {hasChildren ? (
                  <div className="flex items-center gap-2.5 flex-1" onClick={e => { e.stopPropagation(); toggleExpand(item.href) }}>
                    <Icon size={16} className={active ? item.color : 'text-slate-500'} />
                    <Link href={item.href} className="flex-1 hover:text-white" onClick={e => e.stopPropagation()}>
                      {item.label}
                    </Link>
                  </div>
                ) : (
                  <Link href={item.href} className="flex items-center gap-2.5 flex-1">
                    <Icon size={16} className={active ? item.color : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </Link>
                )}
                {hasChildren && (
                  <div onClick={() => toggleExpand(item.href)} className="p-0.5">
                    {isExpanded ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                  </div>
                )}
              </div>

              {/* Children */}
              {hasChildren && isExpanded && (
                <div className="ml-6 mt-0.5 space-y-0.5 pl-3 border-l border-slate-700/50">
                  {item.children!.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                    >
                      <span className="text-slate-600">{child.icon}</span>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-3 space-y-0.5 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button onClick={toggle} className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all w-full">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Settings size={14} />
          <span>Configuración</span>
        </Link>
        <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </Link>
      </div>
    </aside>
  )
}
