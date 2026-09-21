import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Cliniva OS — Clinical Operating System',
    template: '%s | Cliniva OS',
  },
  description:
    'Cliniva OS is a cloud-native, modular operating system for small-to-medium clinics and hospitals. Role-based dashboards for doctors, nurses, pharmacists, lab technicians, billing, admin, canteen, and patients.',
  keywords: ['EMR', 'HMS', 'hospital management', 'clinic software', 'EHR', 'medical records'],
  authors: [{ name: 'Cliniva OS' }],
  robots: 'noindex, nofollow', // Healthcare app — no public indexing
}

import { ClinicRealtimeProvider } from '@/context/ClinicRealtimeContext'
import { ThemeProvider } from '@/context/ThemeContext'
import GlobalModalRoot from '@/components/modals/GlobalModalRoot'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols for icons (same as Stitch design) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body bg-surface text-on-surface antialiased transition-colors duration-200">
        <ThemeProvider>
          <ClinicRealtimeProvider>
            <GlobalModalRoot />
            {children}
          </ClinicRealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
