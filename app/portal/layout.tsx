import React from 'react'
import { PortalLanguageProvider } from '@/context/PortalLanguageContext'


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLanguageProvider>
      {children}
    </PortalLanguageProvider>
  )
}
