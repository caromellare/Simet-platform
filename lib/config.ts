// Lee la configuración de Metricool — primero localStorage, luego /api/config
export function getMetricoolConfig() {
  if (typeof window === 'undefined') return { token: '', userId: '1010863' }
  try {
    const stored = localStorage.getItem('metricool_config')
    if (stored) {
      const cfg = JSON.parse(stored)
      if (cfg.userToken) return { token: cfg.userToken, userId: cfg.userId || '1010863' }
    }
  } catch {}
  return { token: '', userId: '1010863' }
}

// Arma la query string para las API routes
export function metricoolParams(brandId: number, extra?: Record<string, string>) {
  const { token, userId } = getMetricoolConfig()
  const params = new URLSearchParams({
    brandId: String(brandId),
    ...(token ? { token, userId } : {}),
    ...extra,
  })
  return params.toString()
}
