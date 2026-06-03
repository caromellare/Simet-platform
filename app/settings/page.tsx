'use client'
import { useState, useEffect } from 'react'
import { Settings, Key, Building2, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, Trash2, ExternalLink, Save, Zap, Users, Plus, Edit2, X, Shield, BookOpen } from 'lucide-react'

interface MetricoolConfig {
  userToken: string
  userId: string
  defaultBrandId: string
  defaultBrandName: string
}

const STORAGE_KEY = 'metricool_config'

const BRANDS_WITH_PAID = [
  { id: '1674000', name: 'Simet Fábrica', meta: true, google: true },
  { id: '1170841', name: 'Uakika', meta: true, google: true },
  { id: '1502244', name: 'Peiperless', meta: true, google: true },
  { id: '4009725', name: 'Bebesit', meta: true, google: true },
  { id: '4871946', name: 'Atomic Kitchens', meta: true, google: false },
  { id: '5324131', name: 'Porcelanova', meta: true, google: false },
]

interface UserRecord {
  id: string
  name: string
  email: string
  role: 'admin' | 'lectura'
  createdAt: string
}

const EMPTY_USER_FORM = { name: '', email: '', password: '', role: 'lectura' as 'admin' | 'lectura' }

function UsersSection() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [form, setForm] = useState(EMPTY_USER_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showFormPass, setShowFormPass] = useState(false)
  const [currentUserId] = useState('1') // placeholder — in real use would come from /api/auth/me

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/auth/users')
      if (res.ok) setUsers(await res.json())
    } catch {}
    setLoadingUsers(false)
  }

  function openAdd() {
    setForm(EMPTY_USER_FORM)
    setEditingUser(null)
    setSaveError('')
    setShowModal(true)
  }

  function openEdit(u: UserRecord) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditingUser(u)
    setSaveError('')
    setShowModal(true)
  }

  async function saveUser() {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editingUser && !form.password.trim()) { setSaveError('La contraseña es requerida'); return }
    setSaving(true)
    setSaveError('')
    try {
      const body = editingUser
        ? { id: editingUser.id, name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
        : { name: form.name, email: form.email, password: form.password, role: form.role }
      const res = await fetch('/api/auth/users', {
        method: editingUser ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setShowModal(false)
      fetchUsers()
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return
    await fetch('/api/auth/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchUsers()
  }

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden mt-5">
      <div className="px-6 py-4 border-b border-bg-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-purple/10 border border-brand-purple/25 flex items-center justify-center">
          <Users size={15} className="text-brand-purple" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Usuarios</h2>
          <p className="text-xs text-slate-500">Administrá quién tiene acceso al hub</p>
        </div>
        <button
          onClick={openAdd}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-purple hover:bg-brand-purple-light text-white transition-colors"
        >
          <Plus size={12} /> Agregar usuario
        </button>
      </div>

      <div className="px-6 py-4">
        {loadingUsers ? (
          <div className="text-center py-6">
            <RefreshCw size={18} className="text-slate-600 mx-auto mb-2 animate-spin" />
            <p className="text-slate-500 text-xs">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-6">
            <Users size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Sin usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3 bg-bg-elevated rounded-xl border border-bg-border">
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-sm font-bold text-brand-purple">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{u.name}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                  u.role === 'admin'
                    ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/25'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
                }`}>
                  {u.role === 'admin' ? <Shield size={9} /> : <BookOpen size={9} />}
                  {u.role === 'admin' ? 'Administrador' : 'Lectura'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-bg-card transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={u.id === currentUserId}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={u.id === currentUserId ? 'No podés eliminar tu propio usuario' : 'Eliminar usuario'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="px-6 pb-4 flex items-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1.5"><Shield size={11} className="text-brand-purple" /> <span>Administrador — Acceso completo + Configuración</span></div>
        <div className="flex items-center gap-1.5"><BookOpen size={11} className="text-blue-400" /> <span>Lectura — Puede editar calendario, influencers y fechas de reporte</span></div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h3 className="text-sm font-semibold text-white">{editingUser ? 'Editar usuario' : 'Agregar usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-bg-card transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 bg-bg-card border border-bg-border rounded-xl text-sm text-slate-200 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="usuario@email.com"
                  className="w-full px-3 py-2.5 bg-bg-card border border-bg-border rounded-xl text-sm text-slate-200 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Contraseña {editingUser && <span className="text-slate-600">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showFormPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                    className="w-full pl-3 pr-10 py-2.5 bg-bg-card border border-bg-border rounded-xl text-sm text-slate-200 placeholder-slate-600"
                  />
                  <button type="button" onClick={() => setShowFormPass(!showFormPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showFormPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'lectura'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                        form.role === r
                          ? r === 'admin' ? 'bg-brand-purple/10 border-brand-purple/40 text-white' : 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-bg-card border-bg-border text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {r === 'admin' ? <Shield size={11} /> : <BookOpen size={11} />}
                        {r === 'admin' ? 'Administrador' : 'Lectura'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {r === 'admin' ? 'Acceso completo + Configuración' : 'Edita calendario, influencers y fechas'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-400">
                  {saveError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-bg-border flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveUser}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-purple hover:bg-brand-purple-light text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [config, setConfig] = useState<MetricoolConfig>({
    userToken: '',
    userId: '1010863',
    defaultBrandId: '1674000',
    defaultBrandName: 'Simet Fábrica',
  })
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null)
  const [testError, setTestError] = useState('')

  // Cargar desde localStorage primero, luego sincronizar con la DB
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
    // También leer de la DB (para mostrar el estado guardado en el servidor)
    fetch('/api/config').then(r => r.ok ? r.json() : null).then(cfg => {
      if (cfg?.brandId) {
        setConfig(prev => ({
          ...prev,
          userId: cfg.userId || prev.userId,
          defaultBrandId: cfg.brandId || prev.defaultBrandId,
          defaultBrandName: cfg.brandName || prev.defaultBrandName,
        }))
      }
    }).catch(() => {})
  }, [])

  async function save() {
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    // Guardar en la DB (para todos los usuarios)
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userToken: config.userToken,
          userId: config.userId,
          brandId: config.defaultBrandId,
          brandName: config.defaultBrandName,
        }),
      })
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function testConnection() {
    if (!config.userToken) {
      setTestResult('error')
      setTestError('Ingresá el token primero')
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(
        `/api/metricool/brands?token=${encodeURIComponent(config.userToken)}&userId=${config.userId}`
      )
      if (res.ok) {
        setTestResult('ok')
      } else {
        const data = await res.json()
        setTestResult('error')
        setTestError(data.error || `Error ${res.status}`)
      }
    } catch (e: any) {
      setTestResult('error')
      setTestError(e.message)
    } finally {
      setTesting(false)
    }
  }

  function selectBrand(brand: typeof BRANDS_WITH_PAID[0]) {
    setConfig(prev => ({ ...prev, defaultBrandId: brand.id, defaultBrandName: brand.name }))
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY)
    setConfig({ userToken: '', userId: '1010863', defaultBrandId: '1674000', defaultBrandName: 'Simet Fábrica' })
    setTestResult(null)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-bg-border">
        <div className="w-9 h-9 rounded-xl bg-brand-purple/10 border border-brand-purple/25 flex items-center justify-center">
          <Settings size={18} className="text-brand-purple" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Configuración</h1>
          <p className="text-xs text-slate-500">Conectá tu cuenta de Metricool para ver datos en tiempo real</p>
        </div>
      </div>

      {/* Metricool API */}
      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-bg-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00C4B3]/10 border border-[#00C4B3]/25 flex items-center justify-center">
            <Zap size={15} className="text-[#00C4B3]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Metricool API</h2>
            <p className="text-xs text-slate-500">Credenciales para conectar Social Media y Paid Media</p>
          </div>
          <a
            href="https://app.metricool.com/home#settings/api"
            target="_blank"
            rel="noopener"
            className="ml-auto flex items-center gap-1.5 text-xs text-brand-purple hover:text-brand-purple-light transition-colors"
          >
            Obtener token <ExternalLink size={11} />
          </a>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Token */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Token de acceso <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Key size={14} className="text-slate-500" />
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                value={config.userToken}
                onChange={e => setConfig(c => ({ ...c, userToken: e.target.value }))}
                placeholder="Pegá tu token de Metricool aquí"
                className="w-full pl-9 pr-10 py-2.5 bg-bg-elevated border border-bg-border rounded-xl text-sm text-slate-200 placeholder-slate-600 font-mono"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              Metricool → ícono de perfil → Configuración de cuenta → API → Token de acceso
            </p>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">User ID</label>
            <input
              value={config.userId}
              onChange={e => setConfig(c => ({ ...c, userId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-bg-elevated border border-bg-border rounded-xl text-sm text-slate-300 font-mono"
            />
            <p className="text-xs text-slate-600 mt-1.5">ID de tu cuenta de Metricool (por defecto: 1010863)</p>
          </div>

          {/* Test connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={testConnection}
              disabled={testing || !config.userToken}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-bg-elevated border border-bg-border hover:border-brand-purple/40 text-slate-300 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Probando...' : 'Probar conexión'}
            </button>

            {testResult === 'ok' && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={15} /> Conexión exitosa
              </div>
            )}
            {testResult === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle size={15} /> {testError || 'Token inválido'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Default Brand */}
      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-bg-border flex items-center gap-3">
          <Building2 size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Marca por defecto</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs text-slate-500 mb-4">La marca que se carga al abrir cada módulo. Podés cambiarla en cualquier momento desde el selector.</p>
          <div className="grid grid-cols-3 gap-3">
            {BRANDS_WITH_PAID.map(brand => (
              <button
                key={brand.id}
                onClick={() => selectBrand(brand)}
                className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                  config.defaultBrandId === brand.id
                    ? 'bg-brand-purple/10 border-brand-purple/40 text-white'
                    : 'bg-bg-elevated border-bg-border text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{brand.name}</span>
                  {config.defaultBrandId === brand.id && (
                    <div className="w-2 h-2 rounded-full bg-brand-purple" />
                  )}
                </div>
                <div className="flex gap-1.5">
                  {brand.meta && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20">Meta</span>}
                  {brand.google && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/20">Google</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={clear}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <Trash2 size={14} /> Limpiar configuración
        </button>

        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-brand-purple hover:bg-brand-purple-light text-white'
          }`}
        >
          {saved ? (
            <><CheckCircle2 size={15} /> Guardado</>
          ) : (
            <><Save size={15} /> Guardar configuración</>
          )}
        </button>
      </div>

      {/* Info box */}
      <div className="mt-6 bg-bg-elevated border border-bg-border rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          El token se guarda localmente en este navegador. Para que funcione en todos los dispositivos, agregalo también como variable de entorno <code className="text-brand-purple">METRICOOL_USER_TOKEN</code> en Vercel → Settings → Environment Variables.
        </p>
      </div>

      {/* Users Management */}
      <UsersSection />
    </div>
  )
}
