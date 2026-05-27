import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SIMET Marketing Hub',
  description: 'Plataforma interna de marketing — UGC, Social Media y Paid Media',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg-base text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}
