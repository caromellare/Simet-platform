# Database Setup — Vercel Postgres (Neon)

## 1. Crear la base de datos en Vercel

1. Ir a tu proyecto en [vercel.com](https://vercel.com)
2. Tab **Storage** → **Create Database** → elegir **Postgres**
3. Nombre: `simet-marketing-hub` → región: `Washington D.C. (iad1)` → **Create**
4. Una vez creada, ir a la pestaña **`.env.local`** y copiar las variables

## 2. Variables de entorno necesarias

Vercel Postgres te da estas variables automáticamente — solo asegurate de que estén en tu proyecto:

| Variable | Descripción |
|---|---|
| `POSTGRES_URL` | Connection string (pooled) |
| `POSTGRES_URL_NON_POOLING` | Connection directa (para migraciones) |
| `POSTGRES_USER` | Usuario de la DB |
| `POSTGRES_HOST` | Host de Neon |
| `POSTGRES_PASSWORD` | Contraseña |
| `POSTGRES_DATABASE` | Nombre de la base |
| `SESSION_SECRET` | Secreto para firmar tokens de sesión (inventá uno largo) |

**En Vercel:** Settings → Environment Variables → pegar las variables copiadas del paso anterior.

## 3. Configurar .env.local para desarrollo local

```bash
# Copiar el template
cp .env.example .env.local
```

Pegar en `.env.local` las variables del tab `.env.local` en Vercel Storage (incluye `POSTGRES_URL`, etc.).

Agregar también:
```
SESSION_SECRET=un-secreto-largo-y-aleatorio-aqui
```

## 4. Inicializar la base de datos

```bash
npm install
npm run db:setup
```

Esto crea todas las tablas y el usuario admin inicial:
- **Email:** acarolinamellare@gmail.com
- **Contraseña:** `simet2026`

> ⚠️ Cambiar la contraseña desde Settings después del primer login.

## 5. Desplegar en Vercel

El proyecto ya está listo. Hacer push a GitHub y Vercel detecta los cambios automáticamente.

```bash
git add .
git commit -m "feat: add Vercel Postgres database"
git push
```

---

## Estructura de la base de datos

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema (auth) |
| `ugc_creators` | Tracker de influencers/UGC |
| `videos` | Pipeline de videos |
| `content_ideas` | Ideas de contenido social |
| `campaign_ideas` | Ideas de campañas paid |
| `ephemeris` | Efemérides del calendario |

## API Routes creadas

| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/ugc` | GET, POST, PUT, DELETE | CRUD de influencers |
| `/api/videos` | GET, POST, PUT, DELETE | CRUD de videos |
| `/api/content-ideas` | GET, POST, PUT, DELETE | CRUD de ideas sociales |
| `/api/campaign-ideas` | GET, POST, PUT, DELETE | CRUD de ideas paid |
| `/api/ephemeris` | GET, POST, PUT, DELETE | CRUD de efemérides |
| `/api/auth/login` | POST | Login con DB |
| `/api/auth/me` | GET | Usuario autenticado |
| `/api/auth/users` | GET, POST, PATCH, DELETE | Gestión de usuarios |

Todos los GETs aceptan `?brand=xxx` para filtrar por marca.
