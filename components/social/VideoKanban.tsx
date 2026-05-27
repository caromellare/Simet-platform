'use client'
import { useState } from 'react'
import { Plus, X, Edit2, Trash2, LayoutGrid, List, ExternalLink, Instagram, Youtube } from 'lucide-react'
import type { Brand, VideoItem, VideoStatus, UGCPlatform } from '@/lib/types'

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

const COLUMNS: { key: VideoStatus; label: string; color: string; dot: string }[] = [
  { key: 'idea', label: 'Idea', color: 'border-slate-600/30', dot: 'bg-slate-400' },
  { key: 'guion', label: 'Guión', color: 'border-blue-500/30', dot: 'bg-blue-400' },
  { key: 'grabacion', label: 'Grabación', color: 'border-amber-500/30', dot: 'bg-amber-400' },
  { key: 'edicion', label: 'Edición', color: 'border-purple-500/30', dot: 'bg-purple-400' },
  { key: 'revision', label: 'Revisión', color: 'border-orange-500/30', dot: 'bg-orange-400' },
  { key: 'publicado', label: 'Publicado', color: 'border-green-500/30', dot: 'bg-green-400' },
]

const FORMAT_LABELS: Record<string, string> = {
  reels: 'Reels', tiktok: 'TikTok', youtube_short: 'YT Short', youtube_largo: 'YT Largo', story: 'Story', post_video: 'Post Video'
}

const PLATFORM_ICON = { instagram: <Instagram size={11} />, tiktok: <span className="text-[10px] font-bold">TK</span>, youtube: <Youtube size={11} />, facebook: null, twitter: null, otro: null }

const EMPTY_FORM: Omit<VideoItem, 'id' | 'createdAt'> = {
  title: '', platform: 'instagram', format: 'reels', status: 'idea', description: '', script: '', publishDate: '', postUrl: '', tags: [], brand: ''
}

interface Props { brand: Brand }

export function VideoKanban({ brand }: Props) {
  const [videos, setVideos] = useLocalStorage<VideoItem[]>('social_videos', [])
  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, brand: brand.label })

  const brandVideos = videos.filter(v => v.brand === brand.label)

  function openAdd(status: VideoStatus = 'idea') {
    setForm({ ...EMPTY_FORM, brand: brand.label, status })
    setEditingId(null)
    setShowForm(true)
  }
  function openEdit(v: VideoItem) {
    setForm({ title: v.title, platform: v.platform, format: v.format, status: v.status, description: v.description || '', script: v.script || '', publishDate: v.publishDate || '', postUrl: v.postUrl || '', tags: v.tags, brand: v.brand })
    setEditingId(v.id)
    setShowForm(true)
  }
  function save() {
    if (!form.title.trim()) return
    if (editingId) setVideos(prev => prev.map(v => v.id === editingId ? { ...v, ...form } : v))
    else setVideos(prev => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }])
    setShowForm(false)
  }
  function del(id: string) { if (confirm('¿Eliminar?')) setVideos(prev => prev.filter(v => v.id !== id)) }
  function move(id: string, status: VideoStatus) { setVideos(prev => prev.map(v => v.id === id ? { ...v, status } : v)) }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-300">{brandVideos.length}</span> videos en pipeline
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-card border border-bg-border rounded-lg p-1">
            <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-bg-elevated text-white' : 'text-slate-500'}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setViewMode('lista')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'lista' ? 'bg-bg-elevated text-white' : 'text-slate-500'}`}><List size={15} /></button>
          </div>
          <button onClick={() => openAdd()} className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple hover:bg-brand-purple-light rounded-lg text-sm font-medium text-white transition-colors">
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colVideos = brandVideos.filter(v => v.status === col.key)
            return (
              <div key={col.key} className={`flex-shrink-0 w-52 bg-bg-card border rounded-xl overflow-hidden ${col.color}`}>
                <div className="px-3 py-3 border-b border-bg-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{col.label}</span>
                    <span className="text-xs text-slate-600 font-medium">{colVideos.length}</span>
                  </div>
                  <button onClick={() => openAdd(col.key)} className="p-1 rounded-md hover:bg-bg-elevated text-slate-500 hover:text-slate-300"><Plus size={13} /></button>
                </div>
                <div className="p-2 space-y-2 min-h-[80px]">
                  {colVideos.map(v => (
                    <div key={v.id} className="bg-bg-elevated border border-bg-border rounded-lg p-3 group hover:border-brand-purple/30 transition-all card-hover">
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-xs font-medium text-slate-200 leading-snug flex-1">{v.title}</p>
                        <button onClick={() => openEdit(v)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-bg-card rounded transition-all text-slate-400"><Edit2 size={10} /></button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PLATFORM_ICON[v.platform] && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">{PLATFORM_ICON[v.platform]}</span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 bg-bg-card rounded text-slate-500">{FORMAT_LABELS[v.format] || v.format}</span>
                      </div>
                      {v.publishDate && (
                        <div className="mt-2 text-[10px] text-slate-600">{new Date(v.publishDate).toLocaleDateString('es-AR')}</div>
                      )}
                      <div className="mt-2 pt-2 border-t border-bg-border flex items-center gap-1">
                        <select value={v.status} onChange={e => move(v.id, e.target.value as VideoStatus)} className="text-[10px] bg-transparent text-slate-500 cursor-pointer flex-1">
                          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        <button onClick={() => del(v.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'lista' && (
        <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Título', 'Plataforma', 'Formato', 'Estado', 'Publicación', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brandVideos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">Sin videos todavía</td></tr>
              ) : (
                brandVideos.map((v, i) => {
                  const col = COLUMNS.find(c => c.key === v.status)!
                  return (
                    <tr key={v.id} className={`border-b border-bg-border last:border-0 hover:bg-bg-elevated/50 transition-colors`}>
                      <td className="px-4 py-3 font-medium text-slate-200">{v.title}</td>
                      <td className="px-4 py-3 capitalize text-slate-400">{v.platform}</td>
                      <td className="px-4 py-3 text-slate-400">{FORMAT_LABELS[v.format]}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <span className="text-xs text-slate-300">{col.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{v.publishDate ? new Date(v.publishDate).toLocaleDateString('es-AR') : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-slate-300 transition-colors"><Edit2 size={13} /></button>
                          {v.postUrl && <a href={v.postUrl} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-teal-400"><ExternalLink size={13} /></a>}
                          <button onClick={() => del(v.id)} className="p-1.5 rounded-lg hover:bg-bg-elevated text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-base font-semibold text-white">{editingId ? 'Editar Video' : 'Nuevo Video'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-bg-card text-slate-400"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del video" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as UGCPlatform }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {(['instagram', 'tiktok', 'youtube', 'facebook'] as UGCPlatform[]).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Formato</label>
                  <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value as any }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {Object.entries(FORMAT_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as VideoStatus }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Fecha publicación</label>
                  <input type="date" value={form.publishDate} onChange={e => setForm(f => ({ ...f, publishDate: e.target.value }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Descripción / Idea</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descripción del contenido..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">URL del post (si ya está publicado)</label>
                <input value={form.postUrl} onChange={e => setForm(f => ({ ...f, postUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-bg-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-bg-card transition-colors border border-bg-border">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-purple hover:bg-brand-purple-light text-white transition-colors">
                {editingId ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
