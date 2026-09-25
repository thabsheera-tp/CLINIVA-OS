'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import InstantPatientSearch from '@/components/ui/InstantPatientSearch'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

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
  const {
    setRegisterOpen,
    setVitalsOpen,
    setConsultOpen,
    setPaymentOpen,
    setDispenseOpen,
    setPrescriptionOpen,
  } = useClinicRealtime()

  const handlePrimaryAction = () => {
    if (primaryAction?.onClick) {
      primaryAction.onClick()
      return
    }

    if (primaryAction?.href) {
      router.push(primaryAction.href)
      return
    }

    const label = primaryAction?.label?.toLowerCase() || ''
    if (label.includes('rx') || label.includes('prescription')) {
      setPrescriptionOpen(true)
    } else if (label.includes('vital')) {
      setVitalsOpen(true)
    } else if (label.includes('register') || label.includes('patient')) {
      setRegisterOpen(true)
    } else if (label.includes('dispense')) {
      setDispenseOpen(true)
    } else if (label.includes('invoice') || label.includes('payment') || label.includes('bill')) {
      setPaymentOpen(true)
    } else if (label.includes('consult')) {
      setConsultOpen(true)
    } else if (label.includes('result') || label.includes('sample')) {
      router.push('/lab')
    } else if (label.includes('staff')) {
      router.push('/admin/users')
    } else if (label.includes('order')) {
      router.push('/canteen/orders')
    }
  }

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
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 px-3 sm:px-gutter lg:px-gutter-desktop flex items-center justify-between gap-2 sm:gap-gutter">
        {/* Left: Mobile hamburger + Clinic selector / wordmark */}
        <div className="flex items-center gap-2 sm:gap-gutter min-w-0">
          {/* Hamburger toggle button for mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors touch-tap flex-shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Desktop clinic indicator with dropdown */}
          <div className="relative">
            <button
              onClick={() => setClinicMenuOpen(!clinicMenuOpen)}
              className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 touch-tap"
            >
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">{clinicIcon}</span>
              <span className="text-label-md text-slate-900 dark:text-slate-100 truncate max-w-[180px] xl:max-w-[220px] font-medium">{selectedClinic}</span>
              <span className="material-symbols-outlined text-slate-400 text-[16px]">expand_more</span>
            </button>

            {clinicMenuOpen && (
              <div className="absolute left-0 top-12 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-label-sm text-slate-400 dark:text-slate-500 uppercase font-semibold">Active Campus / Facility</div>
                {['St. Jude Medical Center — Main Hospital', 'St. Jude West Campus (OPD Clinic)', 'St. Jude South Pediatric Wing'].map((campus) => (
                  <button
                    key={campus}
                    onClick={() => {
                      setSelectedClinic(campus)
                      setClinicMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      selectedClinic === campus ? 'text-teal-600 dark:text-teal-400 font-semibold bg-slate-50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{campus}</span>
                    {selectedClinic === campus && <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile: logo wordmark */}
          <div className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
            </div>
            <span className="font-heading font-semibold text-slate-900 dark:text-slate-50 text-headline-sm truncate">
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
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors touch-tap"
            aria-label="Toggle search"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Live sync indicator with dual-ring medical telemetry radar */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{liveSyncLabel}</span>
          </div>

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Notifications with interactive popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors touch-tap"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] leading-tight flex items-center justify-center rounded-full font-bold">
                {notificationCount || 3}
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-label-md font-bold text-slate-900 dark:text-slate-100">Clinical Alerts</span>
                  <span className="text-[11px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-full font-semibold">3 Unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[18px] flex-shrink-0 mt-0.5">priority_high</span>
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-slate-100">Critical Troponin Result</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">Patient Marcus Delacroix: 0.08 ng/mL (STAT alert)</p>
                      <span className="text-[10px] text-slate-400">5 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px] flex-shrink-0 mt-0.5">prescriptions</span>
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-slate-100">Rx Verification Needed</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">Central Pharmacy flagged Lisinopril interaction</p>
                      <span className="text-[10px] text-slate-400">18 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-[18px] flex-shrink-0 mt-0.5">how_to_reg</span>
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-slate-100">New Inpatient Admission</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">Bed A-02 occupied by Priya Mehta</p>
                      <span className="text-[10px] text-slate-400">35 mins ago</span>
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
                onClick={handlePrimaryAction}
                className="btn-primary hidden sm:inline-flex touch-tap"
              >
                <span className="material-symbols-outlined text-[18px]">{primaryAction.icon}</span>
                <span>{primaryAction.label}</span>
              </button>
              <button
                onClick={handlePrimaryAction}
                className="sm:hidden p-2 rounded-xl bg-teal-600 text-white shadow-xs touch-tap flex items-center justify-center"
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
              className="flex items-center gap-space-sm pl-1.5 sm:pl-space-sm border-l border-slate-200 dark:border-slate-800 cursor-pointer group touch-tap"
              aria-label="User profile menu"
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-semibold text-label-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-col text-left hidden lg:flex">
                <div className="flex items-center gap-1">
                  <span className="text-label-md text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate max-w-[120px] font-medium">
                    {userName}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">expand_more</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-label-sm text-slate-500 dark:text-slate-400 font-medium">{userRole}</span>
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-space-md py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-label-sm text-slate-400 dark:text-slate-500 uppercase font-semibold">Switch Workspace</p>
                </div>
                <div className="max-h-56 overflow-y-auto smooth-touch-scroll divide-y divide-slate-100 dark:divide-slate-800">
                  {WORKSPACE_LIST.map((ws) => (
                    <button
                      key={ws.role}
                      onClick={() => handleRoleSwitch(ws.role, ws.path)}
                      className={`w-full flex items-center gap-space-sm px-space-md py-2 text-left text-label-md transition-colors touch-tap ${
                        userRole?.toLowerCase().includes(ws.role) || (ws.role === 'nurse' && userRole?.toLowerCase().includes('nurs'))
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] flex-shrink-0">{ws.icon}</span>
                      <span className="truncate">{ws.label}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <Link
                    href="/login?switch=true"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-space-sm px-space-md py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-label-md touch-tap"
                  >
                    <span className="material-symbols-outlined text-[18px]">switch_account</span>
                    Role Selection Screen
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-space-sm px-space-md py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-label-md touch-tap"
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
        <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <InstantPatientSearch
              autoFocus
              placeholder={searchPlaceholder}
              onSelectPatient={() => setMobileSearchOpen(false)}
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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
