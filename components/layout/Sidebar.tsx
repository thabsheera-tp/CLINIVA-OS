'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import ClinivaLogo from '@/components/ui/ClinivaLogo'

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
          <div className="mb-space-xs px-space-xs text-xs text-[#4F6372] dark:text-[#A0B3C2] uppercase tracking-wider font-bold">
            {section.label}
          </div>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const isExact = pathname === item.href
              const hasExactSibling = section.items.some(other => other.href === pathname)
              const isActive = isExact || (!hasExactSibling && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) onMobileClose?.()
                  }}
                  className={clsx(
                    'flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all duration-150 group touch-tap relative border',
                    isActive
                      ? 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] font-semibold border-[#0F8B8D]/30 shadow-xs pl-4'
                      : 'text-[#4A5D6B] dark:text-[#9FB1C0] hover:bg-[#F0F4F7] dark:hover:bg-white/[0.06] hover:text-[#123047] dark:hover:text-white border-transparent'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#0F8B8D] dark:bg-[#28B5B7]" />
                  )}
                  <div className="flex items-center gap-space-sm min-w-0">
                    <ClinivaIcon
                      name={item.icon}
                      size={18}
                      strokeWidth={1.5}
                      className={clsx(
                        'transition-colors flex-shrink-0',
                        isActive ? 'text-[#0F8B8D] dark:text-[#28B5B7]' : 'text-[#8EA2B0] dark:text-[#6D879C] group-hover:text-[#0F8B8D] dark:group-hover:text-[#28B5B7]'
                      )}
                    />
                    <span className="text-[14.5px] font-medium tracking-tight truncate">{item.label}</span>
                  </div>

                  {item.badge != null && (
                    <span
                      className={clsx(
                        'text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-1',
                        item.badgeVariant === 'live'
                          ? 'inline-flex items-center gap-1 bg-[#E8F6F5] text-[#0F8B8D] border border-[#0F8B8D]/25'
                          : item.badgeVariant === 'alert'
                          ? 'bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/25'
                          : 'bg-[#F0F4F7] text-[#60727F] border border-[#E2E8EC]'
                      )}
                    >
                      {item.badgeVariant === 'live' && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F8B8D] opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0F8B8D]" />
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
    <div className="p-gutter border-t border-[#E2E8EC] dark:border-white/[0.08] bg-white dark:bg-[#0D1B26] flex-shrink-0">
      {footerContent ?? (
        <div className="p-space-md bg-[#F7F9FA] dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] flex flex-col gap-space-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-label-md text-[#123047] dark:text-white font-semibold truncate">
                {contextLabel ?? clinicName}
              </span>
              <span className="text-body-sm text-[#60727F] dark:text-[#92A6B5] truncate">{roleLabel}</span>
            </div>
            <ClinivaIcon name={contextIcon} size={18} strokeWidth={1.5} className="text-[#0F8B8D] flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-[#E2E8EC] dark:border-white/[0.06]">
            <span className="text-label-sm text-[#60727F] dark:text-[#92A6B5] truncate max-w-[120px]">
              {userName}
            </span>
            <span className="inline-flex items-center gap-1 text-label-sm text-[#0F8B8D] dark:text-[#28B5B7] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B]" />
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
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#0D1B26] z-50 flex flex-col justify-between border-r border-[#E2E8EC] dark:border-white/[0.08] hidden lg:flex">
        {/* Logo + Brand */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-gutter flex items-center border-b border-[#E2E8EC] dark:border-white/[0.08] flex-shrink-0">
            <Link href="/?intro=true" className="flex items-center min-w-0">
              <ClinivaLogo size="md" subtitle={roleLabel} />
            </Link>
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
          <aside className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#0D1B26] flex flex-col justify-between z-10 border-r border-[#E2E8EC] dark:border-white/[0.08] animate-in slide-in-from-left duration-200">
            {/* Header with Close button */}
            <div className="h-16 px-gutter flex items-center justify-between border-b border-[#E2E8EC] dark:border-white/[0.08] bg-[#F7F9FA] dark:bg-[#122433] flex-shrink-0">
              <Link href="/?intro=true" className="flex items-center min-w-0" onClick={onMobileClose}>
                <ClinivaLogo size="md" subtitle={roleLabel} />
              </Link>
              <button
                onClick={onMobileClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F0F4F7] dark:hover:bg-white/5 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-white touch-tap"
                aria-label="Close navigation"
              >
                <ClinivaIcon name="close" size={18} strokeWidth={1.5} />
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
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D1B26]/95 backdrop-blur-md border-t border-[#E2E8EC] dark:border-white/[0.08] flex items-stretch justify-around px-1"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {/* Top 4 primary actions */}
        {sections[0]?.items.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all min-w-[52px] min-h-[48px] touch-tap',
                isActive
                  ? 'text-[#0F8B8D] font-semibold'
                  : 'text-[#60727F] dark:text-[#92A6B5] hover:text-[#172B3A] dark:hover:text-white'
              )}
            >
              <div className="relative">
                <ClinivaIcon name={item.icon} size={20} strokeWidth={1.5} />
                {item.badge != null && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#0F8B8D] animate-pulse" />
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
            'flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all min-w-[52px] min-h-[48px] touch-tap',
            mobileOpen ? 'text-[#0F8B8D] font-semibold' : 'text-[#60727F] dark:text-[#92A6B5] hover:text-[#172B3A] dark:hover:text-white'
          )}
          aria-label="More navigation options"
        >
          <ClinivaIcon name="menu" size={20} strokeWidth={1.5} />
          <span className="text-[10px] tracking-tight truncate max-w-[56px] text-center leading-tight mt-0.5">
            More
          </span>
        </button>
      </nav>
    </>
  )
}

