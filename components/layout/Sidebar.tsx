'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export type NavSection = {
  label: string
  items: NavItem[]
}

export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: string | number
  badgeVariant?: 'default' | 'live' | 'alert'
}

type SidebarProps = {
  role: string
  roleLabel: string
  userName: string
  userAvatar?: string | null
  userStatus?: string
  clinicName?: string
  contextLabel?: string
  contextIcon?: string
  sections: NavSection[]
  footerContent?: React.ReactNode
  mobileOpen?: boolean
  onMobileClose?: () => void
  onMobileOpen?: () => void
}

export default function Sidebar({
  role,
  roleLabel,
  userName,
  userAvatar,
  userStatus = 'Active',
  clinicName = 'St. Jude Medical Center',
  contextLabel,
  contextIcon = 'meeting_room',
  sections,
  footerContent,
  mobileOpen = false,
  onMobileClose,
  onMobileOpen,
}: SidebarProps) {
  const pathname = usePathname()

  const renderNavSections = (isMobile = false) => (
    <div className="flex-1 overflow-y-auto px-gutter py-space-md smooth-touch-scroll">
      {sections.map((section) => (
        <div key={section.label} className="mb-space-md">
          <div className="mb-space-xs px-space-xs text-label-sm text-on-surface-variant uppercase tracking-wider">
            {section.label}
          </div>
          <nav className="space-y-space-xs">
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) onMobileClose?.()
                  }}
                  className={clsx(
                    'flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all duration-150 group touch-tap relative',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs border-l-4 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  )}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span
                      className={clsx(
                        'material-symbols-outlined text-[20px] transition-colors flex-shrink-0',
                        isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="text-label-lg truncate">{item.label}</span>
                  </div>

                  {item.badge != null && (
                    <span
                      className={clsx(
                        'text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-1',
                        item.badgeVariant === 'live'
                          ? 'inline-flex items-center gap-1 bg-primary/15 text-primary border border-primary/20'
                          : item.badgeVariant === 'alert'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-surface-container text-on-surface border border-outline-variant/30'
                      )}
                    >
                      {item.badgeVariant === 'live' && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                        </span>
                      )}
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}
    </div>
  )

  const renderFooter = () => (
    <div className="p-gutter border-t border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
      {footerContent ?? (
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-label-md text-on-surface font-semibold truncate">
                {contextLabel ?? clinicName}
              </span>
              <span className="text-body-sm text-on-surface-variant truncate">{roleLabel}</span>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">
              {contextIcon}
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/30">
            <span className="text-label-sm text-on-surface-variant truncate max-w-[120px]">
              {userName}
            </span>
            <span className="inline-flex items-center gap-1 text-label-sm text-secondary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {userStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest z-50 flex-col justify-between border-r border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.02)] hidden lg:flex">
        {/* Logo + Brand */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-gutter flex items-center gap-space-sm border-b border-outline-variant/20 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-headline-sm text-primary font-semibold tracking-tight">
                Cliniva OS
              </span>
              <span className="text-label-sm text-on-surface-variant truncate">{roleLabel}</span>
            </div>
          </div>

          {/* Nav sections */}
          {renderNavSections(false)}
        </div>

        {/* Footer */}
        {renderFooter()}
      </aside>

      {/* 2. Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="relative w-80 max-w-[85vw] h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between z-10 border-r border-outline-variant/30 animate-in slide-in-from-left duration-200">
            {/* Header with Close button */}
            <div className="h-16 px-gutter flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-low/40 flex-shrink-0">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">medical_services</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading text-headline-sm text-primary font-semibold tracking-tight">
                    Cliniva OS
                  </span>
                  <span className="text-label-sm text-on-surface-variant truncate">{roleLabel}</span>
                </div>
              </div>
              <button
                onClick={onMobileClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-on-surface touch-tap"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Nav sections */}
            {renderNavSections(true)}

            {/* Footer */}
            {renderFooter()}
          </aside>
        </div>
      )}

      {/* 3. Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 flex items-center justify-around px-1 py-1.5 safe-area-pb shadow-lg">
        {/* Top 4 primary actions */}
        {sections[0]?.items.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] touch-tap',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                {item.badge != null && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[56px] text-center leading-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* 5th action: "More" button to toggle complete drawer */}
        <button
          onClick={onMobileOpen}
          className={clsx(
            'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] touch-tap',
            mobileOpen ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
          )}
          aria-label="More navigation options"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
          <span className="text-[10px] tracking-tight truncate max-w-[56px] text-center leading-tight mt-0.5">
            More
          </span>
        </button>
      </nav>
    </>
  )
}
