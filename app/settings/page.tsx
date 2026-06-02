'use client'
import { useState, useEffect } from 'react'
import { Settings, Key, Building2, CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, Trash2, ExternalLink, Save, Zap } from 'lucide-react'

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
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
    </div>
  )
}
