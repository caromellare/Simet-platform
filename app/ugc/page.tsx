'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Search, Filter, X, ExternalLink, Trash2, Edit2, Instagram, Youtube, Facebook } from 'lucide-react'
import type { UGCCreator, UGCStatus, UGCPlatform, ContentType, Brand } from '@/lib/types'
import { StatCard } from '@/components/StatCard'

const DEFAULT_BRAND = { id: 1674000, label: 'Simet Fábrica' } as Brand

const STATUS_CONFIG: Record<UGCStatus, { label: string; color: string; bg: string }> = {
  contactado: { label: 'Contactado', color: 'text-blue-300', bg: 'bg-blue-500/15 border-blue-500/25' },
  negociacion: { label: 'En Negociación', color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/25' },
  confirmado: { label: 'Confirmado', color: 'text-teal-300', bg: 'bg-teal-500/15 border-teal-500/25' },
  produccion: { label: 'En Producción', color: 'text-purple-300', bg: 'bg-purple-500/15 border-purple-500/25' },
  publicado: { label: 'Publicado', color: 'text-green-300', bg: 'bg-green-500/15 border-green-500/25' },
  cancelado: { label: 'Cancelado', color: 'text-red-300', bg: 'bg-red-500/15 border-red-500/25' },
}

const PLATFORM_ICON: Record<UGCPlatform, React.ReactNode> = {
  instagram: <Instagram size={14} />,
  tiktok: <span className="text-xs font-bold">TK</span>,
  youtube: <Youtube size={14} />,
  facebook: <Facebook size={14} />,
  twitter: <span className="text-xs font-bold">X</span>,
  otro: <span className="text-xs font-bold">?</span>,
}

const EMPTY_FORM: Omit<UGCCreator, 'id' | 'createdAt'> = {
  name: '', handle: '', platform: 'instagram', followers: 0,
  contentType: 'reels', fee: '', freeProduct: false,
  publicationDate: '', postUrl: '', status: 'contactado',
  notes: '', brand: 'Simet Fábrica', tags: [],
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  const set = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return [value, set] as const
}

export default function UGCPage() {
  const [creators, setCreators] = useLocalStorage<UGCCreator[]>('ugc_creators', [])
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<UGCStatus | 'todas'>('todas')
  const [filterPlatform, setFilterPlatform] = useState<UGCPlatform | 'todas'>('todas')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const brandCreators = creators.filter(c => c.brand === brand.label)
  const filtered = brandCreators
    .filter(c => filterStatus === 'todas' || c.status === filterStatus)
    .filter(c => filterPlatform === 'todas' || c.platform === filterPlatform)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()))

  const stats = {
    total: brandCreators.length,
    activos: brandCreators.filter(c => ['confirmado', 'produccion'].includes(c.status)).length,
    publicados: brandCreators.filter(c => c.status === 'publicado').length,
    pendientes: brandCreators.filter(c => ['contactado', 'negociacion'].includes(c.status)).length,
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, brand: brand.label })
    setEditingId(null)
    setShowForm(true)
  }
  function openEdit(c: UGCCreator) {
    setForm({ name: c.name, handle: c.handle, platform: c.platform, followers: c.followers, contentType: c.contentType, fee: c.fee || '', freeProduct: c.freeProduct || false, publicationDate: c.publicationDate || '', postUrl: c.postUrl || '', status: c.status, notes: c.notes, brand: c.brand, tags: c.tags })
    setEditingId(c.id)
    setShowForm(true)
  }
  function save() {
    if (!form.name.trim()) return
    if (editingId) {
      setCreators(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c))
    } else {
      setCreators(prev => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }])
    }
    setShowForm(false)
  }
  function del(id: string) {
    if (confirm('¿Eliminar este creador?')) setCreators(prev => prev.filter(c => c.id !== id))
  }
  function updateStatus(id: string, status: UGCStatus) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-pink/10 border border-brand-pink/25 flex items-center justify-center">
            <Users size={18} className="text-brand-pink" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">UGC & Influencers</h1>
            <p className="text-xs text-slate-500">Seguimiento de colaboraciones y contenido generado por usuarios</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 bg-brand-purple hover:bg-brand-purple-light rounded-lg text-sm font-medium text-white transition-colors">
            <Plus size={15} /> Agregar Creador
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="purple" icon={<Users size={14} />} />
        <StatCard label="Activos" value={stats.activos} sub="confirmado + producción" color="teal" />
        <StatCard label="Publicados" value={stats.publicados} color="green" />
        <StatCard label="Pendientes" value={stats.pendientes} sub="contactado + negociando" color="orange" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o @handle..." className="w-full pl-9 pr-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-300">
          <option value="todas">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value as any)} className="px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-300">
          <option value="todas">Todas las plataformas</option>
          {(['instagram', 'tiktok', 'youtube', 'facebook'] as UGCPlatform[]).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <span className="text-xs text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-bg-card border border-bg-border rounded-xl p-12 text-center">
          <Users size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">{brandCreators.length === 0 ? 'Sin creadores todavía' : 'Sin resultados para esta búsqueda'}</p>
          <p className="text-slate-600 text-sm mt-1">
            {brandCreators.length === 0 ? 'Hacé click en "Agregar Creador" para empezar' : 'Probá con otros filtros'}
          </p>
        </div>
      ) : (
        <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Creador', 'Plataforma', 'Seguidores', 'Tipo', 'Publicación', 'Estado', 'Fee', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const sc = STATUS_CONFIG[c.status]
                return (
                  <tr key={c.id} className={`border-b border-bg-border last:border-0 hover:bg-bg-elevated/50 transition-colors ${i % 2 === 0 ? '' : 'bg-bg-elevated/20'}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{c.name}</div>
                      <div className="text-xs text-slate-500">@{c.handle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        {PLATFORM_ICON[c.platform]}
                        <span className="capitalize">{c.platform}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{fmt(c.followers)}</td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{c.contentType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.publicationDate ? new Date(c.publicationDate).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select value={c.status} onChange={e => updateStatus(c.id, e.target.value as UGCStatus)} className={`badge border cursor-pointer bg-transparent text-xs ${sc.color} ${sc.bg}`}>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.fee ? `$${c.fee}` : c.freeProduct ? 'Producto' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-slate-300 transition-colors"><Edit2 size={13} /></button>
                        {c.postUrl && <a href={c.postUrl} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-teal-400 transition-colors"><ExternalLink size={13} /></a>}
                        <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-base font-semibold text-white">{editingId ? 'Editar Creador' : 'Agregar Creador'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-bg-card text-slate-400"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Nombre *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del creador" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Handle (@)</label>
                  <input value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} placeholder="@usuario" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as UGCPlatform }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {(['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'otro'] as UGCPlatform[]).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Seguidores</label>
                  <input type="number" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tipo de contenido</label>
                  <select value={form.contentType} onChange={e => setForm(f => ({ ...f, contentType: e.target.value as ContentType }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {(['reels', 'post', 'story', 'video', 'ugc_puro', 'review', 'unboxing'] as ContentType[]).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as UGCStatus }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fee</label>
                  <input value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="Ej: 15000" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fecha de publicación</label>
                  <input type="date" value={form.publicationDate} onChange={e => setForm(f => ({ ...f, publicationDate: e.target.value }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">URL del post</label>
                <input value={form.postUrl} onChange={e => setForm(f => ({ ...f, postUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notas, acuerdos, detalles..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.freeProduct} onChange={e => setForm(f => ({ ...f, freeProduct: e.target.checked }))} className="w-4 h-4 rounded accent-brand-purple" />
                <span className="text-sm text-slate-300">Incluye producto/muestra</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-bg-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-bg-card transition-colors">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-purple hover:bg-brand-purple-light text-white transition-colors">
                {editingId ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
