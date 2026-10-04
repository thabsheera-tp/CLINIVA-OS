'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import InstantPatientSearch from '@/components/ui/InstantPatientSearch'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import ClinivaLogo from '@/components/ui/ClinivaLogo'

type TopBarProps = {
  userName: string
  userRole: string
  assignedRoles?: string[]
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
  assignedRoles,
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
  const [userAssignedRoles, setUserAssignedRoles] = useState<string[]>(assignedRoles || [])
  const notificationRef = useRef<HTMLDivElement>(null)
  const supabase = createClientSideClient()

  // Close notifications dropdown on click outside or Escape key
  useEffect(() => {
    if (!notificationsOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationsOpen])
  const {
    setRegisterOpen,
    setVitalsOpen,
    setConsultOpen,
    setPaymentOpen,
    setDispenseOpen,
    setPrescriptionOpen,
  } = useClinicRealtime()

  // Load user's actual assigned roles from session if not provided via props
  useEffect(() => {
    let isMounted = true
    async function resolveRoles() {
      if (assignedRoles && assignedRoles.length > 0) {
        setUserAssignedRoles(assignedRoles)
        return
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && isMounted) {
          const meta = session.user.user_metadata || {}
          const roles: string[] = []
          if (Array.isArray(meta.roles)) {
            roles.push(...meta.roles)
          }
          if (meta.role && !roles.includes(meta.role)) {
            roles.push(meta.role)
          }
          if (roles.length > 0) {
            setUserAssignedRoles(roles)
          }
        }
      } catch {
        // Session resolve fallback
      }
    }
    resolveRoles()
    return () => { isMounted = false }
  }, [assignedRoles, supabase])

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
    // Only allow switching to roles legitimately assigned to this user
    if (userAssignedRoles.length > 0 && !userAssignedRoles.includes(targetRole)) {
      console.warn('Unauthorized workspace switch attempt blocked')
      return
    }
    document.cookie = `cliniva_demo_role=${targetRole}; path=/; max-age=86400; SameSite=Lax`
    setDropdownOpen(false)
    window.location.href = targetPath
  }

  const handleSignOut = async () => {
    document.cookie = 'cliniva_demo_role=; path=/; max-age=0'
    document.cookie = 'cliniva_auth_user=; path=/; max-age=0'
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

  // Filter workspaces to ONLY those assigned to the authenticated user
  const effectiveRoles = userAssignedRoles.length > 0 ? userAssignedRoles : (userRole ? [userRole] : [])
  const authorizedWorkspaces = WORKSPACE_LIST.filter((ws) =>
    effectiveRoles.includes(ws.role)
  )

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 dark:bg-[#122433]/95 backdrop-blur-md border-b border-[#E2E8EC] dark:border-white/[0.08] z-40 px-3 sm:px-gutter lg:px-gutter-desktop flex items-center justify-between gap-2 sm:gap-gutter">
        {/* Left: Mobile hamburger + Clinic selector / wordmark */}
        <div className="flex items-center gap-2 sm:gap-gutter min-w-0">
          {/* Hamburger toggle button for mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl hover:bg-[#F0F4F7] dark:hover:bg-white/5 text-[#60727F] dark:text-[#92A6B5] hover:text-[#172B3A] dark:hover:text-[#E8F0F5] transition-colors touch-tap flex-shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <ClinivaIcon name="menu" size={22} strokeWidth={1.5} />
          </button>

          {/* Desktop clinic indicator with dropdown */}
          <div className="relative">
            <button
              onClick={() => setClinicMenuOpen(!clinicMenuOpen)}
              className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs bg-[#F7F9FA] dark:bg-[#0D1B26] rounded-lg border border-[#E2E8EC] dark:border-white/[0.08] cursor-pointer hover:bg-[#F0F4F7] dark:hover:bg-white/5 transition-colors flex-shrink-0 touch-tap"
            >
              <ClinivaIcon name={clinicIcon} size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
              <span className="text-label-md text-[#123047] dark:text-[#E8F0F5] truncate max-w-[180px] xl:max-w-[220px] font-medium">{selectedClinic}</span>
              <ClinivaIcon name="expand_more" size={16} strokeWidth={1.5} className="text-[#60727F]" />
            </button>

            {clinicMenuOpen && (
              <div className="absolute left-0 top-12 w-72 bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-label-sm text-[#60727F] dark:text-[#92A6B5] uppercase font-semibold">Active Campus / Facility</div>
                {['St. Jude Medical Center — Main Hospital', 'St. Jude West Campus (OPD Clinic)', 'St. Jude South Pediatric Wing'].map((campus) => (
                  <button
                    key={campus}
                    onClick={() => {
                      setSelectedClinic(campus)
                      setClinicMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-label-md hover:bg-[#F7F9FA] dark:hover:bg-white/5 transition-colors flex items-center justify-between ${
                      selectedClinic === campus ? 'text-[#0F8B8D] font-semibold bg-[#E8F6F5] dark:bg-[#0F8B8D]/15' : 'text-[#172B3A] dark:text-[#E8F0F5]'
                    }`}
                  >
                    <span className="truncate">{campus}</span>
                    {selectedClinic === campus && <ClinivaIcon name="check" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile: unified logo wordmark */}
          <Link href="/?intro=true" className="lg:hidden flex items-center min-w-0 flex-shrink-0">
            <ClinivaLogo size="sm" />
          </Link>
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
            className="md:hidden p-2 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-[#E8F0F5] hover:bg-[#F0F4F7] dark:hover:bg-white/5 rounded-full transition-colors touch-tap"
            aria-label="Toggle search"
          >
            <ClinivaIcon name={mobileSearchOpen ? 'close' : 'search'} size={20} strokeWidth={1.5} />
          </button>

          {/* Live sync indicator with dual-ring medical telemetry radar */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border border-[#0F8B8D]/25 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F8B8D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F8B8D]" />
            </span>
            <span className="text-[12px] font-semibold text-[#0F8B8D] dark:text-[#28B5B7]">{liveSyncLabel}</span>
          </div>

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Notifications with interactive popover */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-white hover:bg-[#F0F4F7] dark:hover:bg-white/5 rounded-full transition-colors touch-tap"
              aria-label="Notifications"
            >
              <ClinivaIcon name="notifications" size={20} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C94A4A] text-white text-[10px] leading-tight flex items-center justify-center rounded-full font-bold">
                {notificationCount || 3}
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-[340px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <span className="text-label-md font-bold text-slate-900 dark:text-white">Clinical Alerts</span>
                  <span className="text-[11px] bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/20 px-2 py-0.5 rounded-full font-semibold tabular-nums">3 Unread</span>
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-lg bg-[#C94A4A]/5 dark:bg-red-950/30 border border-[#C94A4A]/15 dark:border-red-900/50 flex gap-2.5 items-start">
                    <ClinivaIcon name="priority_high" size={16} strokeWidth={1.5} className="text-[#C94A4A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-white">Critical Troponin Result</p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300">Patient Marcus Delacroix: 0.08 ng/mL (STAT alert)</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">5 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex gap-2.5 items-start">
                    <ClinivaIcon name="prescriptions" size={16} strokeWidth={1.5} className="text-[#0F8B8D] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-white">Rx Verification Needed</p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300">Central Pharmacy flagged Lisinopril interaction</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">18 mins ago</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex gap-2.5 items-start">
                    <ClinivaIcon name="how_to_reg" size={16} strokeWidth={1.5} className="text-[#0F8B8D] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-label-sm font-semibold text-slate-900 dark:text-white">New Inpatient Admission</p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300">Bed A-02 occupied by Priya Mehta</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">35 mins ago</span>
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
                <ClinivaIcon name={primaryAction.icon} size={16} strokeWidth={1.5} />
                <span>{primaryAction.label}</span>
              </button>
              <button
                onClick={handlePrimaryAction}
                className="sm:hidden p-2 rounded-xl bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white touch-tap flex items-center justify-center transition-colors"
                title={primaryAction.label}
                aria-label={primaryAction.label}
              >
                <ClinivaIcon name={primaryAction.icon} size={16} strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-space-sm pl-1.5 sm:pl-space-sm border-l border-[#E2E8EC] dark:border-white/[0.08] cursor-pointer group touch-tap"
              aria-label="User profile menu"
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0F8B8D]/25"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7] font-semibold text-label-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-col text-left hidden lg:flex">
                <div className="flex items-center gap-1">
                  <span className="text-[13.5px] text-[#123047] dark:text-white group-hover:text-[#0F8B8D] transition-colors truncate max-w-[130px] font-semibold">
                    {userName}
                  </span>
                  <ClinivaIcon name="expand_more" size={16} strokeWidth={1.5} className="text-[#4A5D6B] dark:text-[#9FB1C0]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B]" />
                  <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-semibold capitalize">{userRole}</span>
                </div>
              </div>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-[16rem] bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-space-md py-1 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-1">
                  <p className="text-label-sm text-[#123047] dark:text-white font-semibold">{userName}</p>
                  <p className="text-[11px] text-[#60727F] dark:text-[#92A6B5] font-medium">{userRole}</p>
                </div>

                {/* Show Switch Workspace ONLY if user has multiple assigned roles */}
                {authorizedWorkspaces.length > 1 && (
                  <>
                    <div className="px-space-md py-1 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-1">
                      <p className="text-[11px] text-[#60727F] dark:text-[#92A6B5] uppercase font-semibold">
                        Switch Workspace
                      </p>
                    </div>
                    <div className="max-h-56 overflow-y-auto smooth-touch-scroll divide-y divide-[#E2E8EC]/60 dark:divide-white/[0.04]">
                      {authorizedWorkspaces.map((ws) => {
                        const isCurrent = userRole?.toLowerCase().includes(ws.role) || (ws.role === 'nurse' && userRole?.toLowerCase().includes('nurs'))
                        return (
                          <button
                            key={ws.role}
                            onClick={() => handleRoleSwitch(ws.role, ws.path)}
                            disabled={isCurrent}
                            className={`w-full flex items-center justify-between px-space-md py-2 text-left text-label-md transition-colors touch-tap ${
                              isCurrent
                                ? 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] font-semibold cursor-default'
                                : 'text-[#60727F] dark:text-[#92A6B5] hover:bg-[#F0F4F7] dark:hover:bg-white/5 hover:text-[#172B3A] dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-space-sm min-w-0">
                              <ClinivaIcon name={ws.icon} size={16} strokeWidth={1.5} className="flex-shrink-0" />
                              <span className="truncate">{ws.label}</span>
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] text-[#0F8B8D] font-bold uppercase tracking-wider bg-[#0F8B8D]/10 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                <div className="border-t border-[#E2E8EC] dark:border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-space-sm px-space-md py-2 text-[#C94A4A] hover:bg-[#C94A4A]/10 transition-colors text-label-md touch-tap"
                  >
                    <ClinivaIcon name="logout" size={16} strokeWidth={1.5} />
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
        <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white dark:bg-[#122433] border-b border-[#E2E8EC] dark:border-white/[0.08] p-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <InstantPatientSearch
              autoFocus
              placeholder={searchPlaceholder}
              onSelectPatient={() => setMobileSearchOpen(false)}
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-[#E8F0F5]"
              aria-label="Close search"
            >
              <ClinivaIcon name="close" size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
