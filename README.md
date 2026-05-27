# SIMET Marketing Hub

Plataforma interna de marketing para OM Comunicación + Digital. Gestión de UGC/Influencers, Social Media y Paid Media con datos en tiempo real desde Metricool.

---

## Módulos

| Módulo | Descripción | Datos |
|---|---|---|
| **UGC & Influencers** | Tracker de colaboraciones, estados, métricas | localStorage |
| **Social · Calendario** | Efemérides AR + eventos custom | localStorage |
| **Social · Videos** | Kanban/lista del pipeline de videos | localStorage |
| **Social · Ideas** | Board de ideas de contenido | localStorage |
| **Social · Reporte** | Métricas mensuales de Instagram | Metricool API |
| **Paid · Meta Ads** | Campañas activas con KPIs completos | Metricool API |
| **Paid · Google Ads** | Campañas con métricas principales | Metricool API |
| **Paid · Ideas** | Planificador de próximas campañas | localStorage |

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
cd marketing-hub
git init
git add .
git commit -m "initial commit"
gh repo create simet-marketing-hub --private --push
```

### 2. Importar en Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar el repositorio de GitHub
3. Framework: **Next.js** (auto-detectado)
4. Agregar variables de entorno (ver abajo)
5. Deploy

### 3. Variables de entorno

| Variable | Dónde encontrarla |
|---|---|
| `METRICOOL_USER_TOKEN` | Metricool → Configuración de cuenta → API → Token de acceso |
| `METRICOOL_USER_ID` | `1010863` (ya configurado) |
| `NEXT_PUBLIC_DEFAULT_BRAND_ID` | `1674000` (SIMET Fábrica) |
| `NEXT_PUBLIC_DEFAULT_BRAND_NAME` | `Simet Fábrica` |

### 4. Desarrollo local

```bash
npm install
cp .env.example .env.local
# Editá .env.local con tus credenciales
npm run dev
```

---

## Marcas con Paid Media conectado en Metricool

| Marca | ID | Meta Ads | Google Ads |
|---|---|---|---|
| SIMET Fábrica | 1674000 | ✅ | ✅ |
| Uakika | 1170841 | ✅ | ✅ |
| Peiperless | 1502244 | ✅ | ✅ |
| Bebesit | 4009725 | ✅ | ✅ |
| Atomic Kitchens | 4871946 | ✅ | — |
| Porcelanova | 5324131 | ✅ | — |

---

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Metricool REST API** (`X-Mc-Auth` header)
- **localStorage** para datos sin API
- **Recharts** para gráficos
