'use client'

import { useState } from 'react'
import Sidebar, { type NavSection } from './Sidebar'
import TopBar from './TopBar'

type DashboardShellProps = {
  children: React.ReactNode
  role: string
  roleLabel: string
  userName: string
  userAvatar?: string | null
  userStatus?: string
  clinicName?: string
  clinicIcon?: string
  searchPlaceholder?: string
  liveSyncLabel?: string
  notificationCount?: number
  navSections: NavSection[]
  primaryAction?: { label: string; icon: string; href?: string; onClick?: () => void }
  contextLabel?: string
  contextIcon?: string
}

/**
 * DashboardShell — wraps every role-specific dashboard page.
 * Composes Sidebar (left desktop nav + mobile drawer + bottom nav) + TopBar (header) + main content area.
 */
export default function DashboardShell({
  children,
  role,
  roleLabel,
  userName,
  userAvatar,
  userStatus = 'Active',
  clinicName,
  clinicIcon,
  searchPlaceholder,
  liveSyncLabel,
  notificationCount,
  navSections,
  primaryAction,
  contextLabel,
  contextIcon,
}: DashboardShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  return (
    <div className="dashboard-shell min-h-screen min-h-dvh bg-surface dark:bg-surface text-on-surface transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      <Sidebar
        role={role}
        roleLabel={roleLabel}
        userName={userName}
        userAvatar={userAvatar}
        userStatus={userStatus}
        clinicName={clinicName}
        contextLabel={contextLabel}
        contextIcon={contextIcon}
        sections={navSections}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        onMobileOpen={() => setMobileDrawerOpen(true)}
      />

      {/* Main content: offset for sidebar on desktop, topbar always */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-h-dvh w-full min-w-0 max-w-full overflow-x-hidden">
        <TopBar
          userName={userName}
          userRole={roleLabel}
          userAvatar={userAvatar}
          clinicName={clinicName}
          clinicIcon={clinicIcon}
          searchPlaceholder={searchPlaceholder}
          liveSyncLabel={liveSyncLabel}
          notificationCount={notificationCount}
          primaryAction={primaryAction}
          onToggleMobileMenu={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        />

        {/* Page content — top-padded for fixed header (h-16), bottom-padded for mobile bottom nav */}
        <main className="flex-1 pt-16 sm:pt-20 px-3 sm:px-4 lg:px-6 pb-24 lg:pb-6 bg-surface dark:bg-surface text-on-surface min-h-screen overflow-x-hidden transition-colors duration-200 w-full min-w-0 max-w-full">
          <div className="w-full max-w-full min-w-0 py-4 sm:py-6 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
