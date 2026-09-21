'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import InstantPatientSearch from '@/components/ui/InstantPatientSearch'

type TopBarProps = {
  userName: string
  userRole: string
  userAvatar?: string | null
  clinicName?: string
  clinicIcon?: string
  searchPlaceholder?: string
  liveSyncLabel?: string
  notificationCount?: number
  primaryAction?: { label: string; icon: string; href?: string; onClick?: () => void }
  onToggleMobileMenu?: () => void
}

export default function TopBar({
  userName,
  userRole,
  userAvatar,
  clinicName = 'St. Jude Medical Center',
  clinicIcon = 'local_hospital',
  searchPlaceholder = 'Search patients, records...',
  liveSyncLabel = 'Live Sync',
  notificationCount = 0,
  primaryAction,
  onToggleMobileMenu,
}: TopBarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [clinicMenuOpen, setClinicMenuOpen] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState(clinicName)
  const supabase = createClientSideClient()

  const handleRoleSwitch = (targetRole: string, targetPath: string) => {
    document.cookie = `cliniva_demo_role=${targetRole}; path=/; max-age=86400`
    setDropdownOpen(false)
    window.location.href = targetPath
  }

  const handleSignOut = async () => {
    document.cookie = 'cliniva_demo_role=; path=/; max-age=0'
    try {
      await supabase.auth.signOut()
    } catch {}
    window.location.href = '/login'
  }

  const WORKSPACE_LIST = [
    { role: 'doctor',     label: 'Doctor Workspace',        path: '/doctor',     icon: 'stethoscope' },
    { role: 'front_desk', label: 'Front Desk & OPD',        path: '/front-desk', icon: 'badge' },
    { role: 'nurse',      label: 'Nursing & IP Ward',       path: '/nursing',    icon: 'local_hospital' },
    { role: 'pharmacist', label: 'Pharmacy & Stock',        path: '/pharmacy',   icon: 'pill' },
    { role: 'lab_tech',   label: 'Lab & Diagnostics',       path: '/lab',        icon: 'science' },
    { role: 'cashier',    label: 'Billing & Cashier',       path: '/billing',    icon: 'receipt_long' },
    { role: 'admin',      label: 'Admin & Management',      path: '/admin',      icon: 'admin_panel_settings' },
    { role: 'canteen',    label: 'Canteen & Meals',         path: '/canteen',    icon: 'restaurant' },
    { role: 'patient',    label: 'Patient Portal',          path: '/portal',     icon: 'person_pin' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 z-40 px-3 sm:px-gutter lg:px-gutter-desktop flex items-center justify-between gap-2 sm:gap-gutter">
        {/* Left: Mobile hamburger + Clinic selector / wordmark */}
        <div className="flex items-center gap-2 sm:gap-gutter min-w-0">
          {/* Hamburger toggle button for mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors touch-tap flex-shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Desktop clinic indicator with dropdown */}
          <div className="relative">
            <button
              onClick={() => setClinicMenuOpen(!clinicMenuOpen)}
              className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-low rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors flex-shrink-0 touch-tap"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">{clinicIcon}</span>
              <span className="text-label-md text-on-surface truncate max-w-[180px] xl:max-w-[220px]">{selectedClinic}</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
            </button>

            {clinicMenuOpen && (
              <div className="absolute left-0 top-12 w-72 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-label-sm text-on-surface-variant uppercase font-semibold">Active Campus / Facility</div>
                {['St. Jude Medical Center — Main Hospital', 'St. Jude West Campus (OPD Clinic)', 'St. Jude South Pediatric Wing'].map((campus) => (
                  <button
                    key={campus}
                    onClick={() => {
                      setSelectedClinic(campus)
                      setClinicMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                      selectedClinic === campus ? 'text-primary font-semibold bg-surface-container-low' : 'text-on-surface'
                    }`}
                  >
                    <span className="truncate">{campus}</span>
                    {selectedClinic === campus && <span className="material-symbols-outlined text-primary text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile: logo wordmark */}
          <div className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
            </div>
            <span className="font-heading font-semibold text-primary text-headline-sm truncate">
              Cliniva OS
            </span>
          </div>
        </div>

        {/* Center: Instant Live Debounced Search */}
        <div className="flex-1 max-w-xl hidden md:block px-2">
          <InstantPatientSearch placeholder={searchPlaceholder} />
        </div>

        {/* Right: Search toggle (mobile) + Live sync + notifications + theme + action + avatar */}
        <div className="flex items-center gap-1 sm:gap-space-sm flex-shrink-0">
          {/* Mobile search toggle button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors touch-tap"
            aria-label="Toggle search"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Live sync indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-space-sm py-1 bg-surface-container rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
            <span className="text-label-sm text-on-surface">{liveSyncLabel}</span>
          </div>

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Notifications with interactive popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors touch-tap"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-tertiary text-on-tertiary text-[10px] leading-tight flex items-center justify-center rounded-full font-bold">
                {notificationCount || 3}
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-modal p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
                  <span className="text-label-md font-bold text-on-surface">Clinical Alerts</span>
                  <span className="text-[11px] bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-semibold">3 Unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-error/5 border border-error/20 flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-error text-[18px] flex-shrink-0 mt-0.5">priority_high</span>
                    <div>
                      <p className="text-label-sm font-semibold text-on-surface">Critical Troponin Result</p>
                      <p className="text-[12px] text-on-surface-variant">Patient Marcus Delacroix: 0.08 ng/mL (STAT alert)</p>
                      <span className="text-[10px] text-outline">5 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-container-low flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">prescriptions</span>
                    <div>
                      <p className="text-label-sm font-semibold text-on-surface">Rx Verification Needed</p>
                      <p className="text-[12px] text-on-surface-variant">Central Pharmacy flagged Lisinopril interaction</p>
                      <span className="text-[10px] text-outline">18 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-container-low flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0 mt-0.5">how_to_reg</span>
                    <div>
                      <p className="text-label-sm font-semibold text-on-surface">New Inpatient Admission</p>
                      <p className="text-[12px] text-on-surface-variant">Bed A-02 occupied by Priya Mehta</p>
                      <span className="text-[10px] text-outline">35 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary action CTA — Full button on sm+, compact icon on mobile */}
          {primaryAction && (
            <>
              <button
                onClick={primaryAction.onClick}
                className="btn-primary hidden sm:inline-flex touch-tap"
              >
                <span className="material-symbols-outlined text-[18px]">{primaryAction.icon}</span>
                <span>{primaryAction.label}</span>
              </button>
              <button
                onClick={primaryAction.onClick}
                className="sm:hidden p-2 rounded-full bg-primary text-on-primary shadow-sm touch-tap flex items-center justify-center"
                title={primaryAction.label}
                aria-label={primaryAction.label}
              >
                <span className="material-symbols-outlined text-[18px]">{primaryAction.icon}</span>
              </button>
            </>
          )}

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-space-sm pl-1.5 sm:pl-space-sm border-l border-outline-variant/30 cursor-pointer group touch-tap"
              aria-label="User profile menu"
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-semibold text-label-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-col text-left hidden lg:flex">
                <div className="flex items-center gap-1">
                  <span className="text-label-md text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px]">
                    {userName}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-label-sm text-secondary font-semibold">{userRole}</span>
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-64 max-w-[calc(100vw-1.5rem)] bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-space-md py-1 border-b border-outline-variant/20 mb-1">
                  <p className="text-label-sm text-on-surface-variant uppercase font-semibold">Switch Workspace</p>
                </div>
                <div className="max-h-56 overflow-y-auto smooth-touch-scroll divide-y divide-outline-variant/10">
                  {WORKSPACE_LIST.map((ws) => (
                    <button
                      key={ws.role}
                      onClick={() => handleRoleSwitch(ws.role, ws.path)}
                      className={`w-full flex items-center gap-space-sm px-space-md py-2 text-left text-label-md transition-colors touch-tap ${
                        userRole?.toLowerCase().includes(ws.role) || (ws.role === 'nurse' && userRole?.toLowerCase().includes('nurs'))
                          ? 'bg-secondary-fixed/30 text-primary font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] flex-shrink-0">{ws.icon}</span>
                      <span className="truncate">{ws.label}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-outline-variant/20 mt-1 pt-1">
                  <Link
                    href="/login?switch=true"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-space-sm px-space-md py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-label-md touch-tap"
                  >
                    <span className="material-symbols-outlined text-[18px]">switch_account</span>
                    Role Selection Screen
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-space-sm px-space-md py-2 text-tertiary hover:bg-error-container/20 transition-colors text-label-md touch-tap"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Expandable Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 p-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <InstantPatientSearch
              autoFocus
              placeholder={searchPlaceholder}
              onSelectPatient={() => setMobileSearchOpen(false)}
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-on-surface-variant hover:text-on-surface"
              aria-label="Close search"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
