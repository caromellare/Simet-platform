/**
 * SIMET Marketing Hub — Database Seed
 *
 * Uso:
 *   npx tsx scripts/seed.ts
 *
 * Requiere tener POSTGRES_URL en .env.local (copiada desde Vercel)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createHash } from 'crypto'

// Carga variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

import { sql } from '@vercel/postgres'
import * as fs from 'fs'
import * as path from 'path'

const SESSION_SECRET = process.env.SESSION_SECRET || 'simet-marketing-hub-secret-2026'

function hashPassword(pass: string) {
  return createHash('sha256').update(pass + SESSION_SECRET).digest('hex')
}

async function runMigration() {
  console.log('📦 Corriendo migrate.sql...')
  const migrationSQL = fs.readFileSync(
    path.join(process.cwd(), 'scripts', 'migrate.sql'),
    'utf-8'
  )

  // Ejecuta cada statement por separado
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const statement of statements) {
    await sql.query(statement)
  }
  console.log('✅ Schema creado')
}

async function seedAdmin() {
  console.log('👤 Creando usuario admin...')

  // Verificar si ya existe
  const { rows } = await sql`SELECT id FROM users WHERE email = 'acarolinamellare@gmail.com'`
  if (rows.length > 0) {
    console.log('   Admin ya existe, skipping')
    return
  }

  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Caro', 'acarolinamellare@gmail.com', ${hashPassword('simet2026')}, 'admin')
  `
  console.log('✅ Admin creado (email: acarolinamellare@gmail.com, pass: simet2026)')
  console.log('   ⚠️  Cambiá la contraseña desde Settings después del primer login')
}

async function main() {
  console.log('\n🚀 SIMET Marketing Hub — Database Setup\n')

  try {
    await runMigration()
    await seedAdmin()
    console.log('\n✨ Listo. La base de datos está configurada.\n')
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

main()
