'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSideClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ui/ThemeToggle'

type RoleCategory = 'all' | 'clinical' | 'operations' | 'admin'

interface RoleCardItem {
  role: string
  label: string
  department: string
  badge: string
  category: 'clinical' | 'operations' | 'admin'
  icon: string
  email: string
  quickStat: string
  features: string[]
  accent: {
    iconBg: string
    badgeBg: string
    ringColor: string
    glowHover: string
    launchBtn: string
  }
}

const ROLE_CARDS: RoleCardItem[] = [
  {
    role: 'doctor',
    label: 'Doctor Portal',
    department: 'Clinical Consultation & OPD',
    badge: 'Physician / CMO',
    category: 'clinical',
    icon: 'stethoscope',
    email: 'doctor@cliniva.os',
    quickStat: '14 Waiting OPD',
    features: ['OPD Triage Queue', 'SOAP Clinical Notes', 'e-Prescriptions'],
    accent: {
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
      ringColor: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      glowHover: 'group-hover:text-emerald-700',
      launchBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  },
  {
    role: 'front_desk',
    label: 'Front Desk',
    department: 'Registration & Queue Dispatch',
    badge: 'Outpatient Reception',
    category: 'operations',
    icon: 'badge',
    email: 'reception@cliniva.os',
    quickStat: '32 Tokens Issued',
    features: ['UHID Generation', 'Queue Dispatcher', 'Specialty Triage'],
    accent: {
      iconBg: 'bg-sky-50 text-sky-700 border border-sky-200/60',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/50',
      ringColor: 'hover:border-sky-500 hover:shadow-sky-500/10',
      glowHover: 'group-hover:text-sky-700',
      launchBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
  },
  {
    role: 'nurse',
    label: 'Nursing Ward',
    department: 'Inpatient Monitoring & MAR',
    badge: 'Ward Station',
    category: 'clinical',
    icon: 'local_hospital',
    email: 'nurse@cliniva.os',
    quickStat: '24 Beds Occupied',
    features: ['Bed Roster Map', 'Vitals Telemetry', 'Med Administration'],
    accent: {
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/50',
      ringColor: 'hover:border-rose-500 hover:shadow-rose-500/10',
      glowHover: 'group-hover:text-rose-700',
      launchBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  },
  {
    role: 'pharmacist',
    label: 'Pharmacy & Stock',
    department: 'Dispense & Inventory Control',
    badge: 'Central Dispensary',
    category: 'operations',
    icon: 'pill',
    email: 'pharmacy@cliniva.os',
    quickStat: '9 Orders Due',
    features: ['Prescription Dispense', 'Batch Expiry Alerts', 'Stock Purchase Orders'],
    accent: {
      iconBg: 'bg-violet-50 text-violet-700 border border-violet-200/60',
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200/50',
      ringColor: 'hover:border-violet-500 hover:shadow-violet-500/10',
      glowHover: 'group-hover:text-violet-700',
      launchBtn: 'bg-violet-600 hover:bg-violet-700 text-white',
    },
  },
  {
    role: 'lab_tech',
    label: 'Lab & Diagnostics',
    department: 'Pathology & Specimen Tracking',
    badge: 'Diagnostics Lab',
    category: 'clinical',
    icon: 'science',
    email: 'lab@cliniva.os',
    quickStat: '11 Tests In-flight',
    features: ['Specimen Accession', 'Analyzer HL7 Sync', 'Normal Range Verification'],
    accent: {
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/50',
      ringColor: 'hover:border-amber-500 hover:shadow-amber-500/10',
      glowHover: 'group-hover:text-amber-700',
      launchBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  },
  {
    role: 'cashier',
    label: 'Billing & Cashier',
    department: 'Invoicing & TPA Claims',
    badge: 'Finance & Accounts',
    category: 'operations',
    icon: 'receipt_long',
    email: 'billing@cliniva.os',
    quickStat: '7 Invoices Pending',
    features: ['Itemized Invoicing', 'Insurance Pre-Auth', 'Split Payment Receipts'],
    accent: {
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200/60',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/50',
      ringColor: 'hover:border-teal-500 hover:shadow-teal-500/10',
      glowHover: 'group-hover:text-teal-700',
      launchBtn: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
  },
  {
    role: 'admin',
    label: 'Admin Suite',
    department: 'Governance & Operations Analytics',
    badge: 'Administration',
    category: 'admin',
    icon: 'admin_panel_settings',
    email: 'admin@cliniva.os',
    quickStat: 'System Operational',
    features: ['Department Analytics', 'Staff RBAC Security', 'Audit Trail Logs'],
    accent: {
      iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200/50',
      ringColor: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
      glowHover: 'group-hover:text-indigo-700',
      launchBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  },
  {
    role: 'canteen',
    label: 'Canteen & Dietary',
    department: 'Patient Nutrition & Cafeteria POS',
    badge: 'Dietary Services',
    category: 'admin',
    icon: 'restaurant',
    email: 'canteen@cliniva.os',
    quickStat: '42 Trays Dispatched',
    features: ['Ward Diet Schedules', 'Allergen Guard', 'Cafeteria Point-of-Sale'],
    accent: {
      iconBg: 'bg-orange-50 text-orange-700 border border-orange-200/60',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200/50',
      ringColor: 'hover:border-orange-500 hover:shadow-orange-500/10',
      glowHover: 'group-hover:text-orange-700',
      launchBtn: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
  },
  {
    role: 'patient',
    label: 'Patient Portal',
    department: 'Personal Health Records & Care',
    badge: 'Patient Access',
    category: 'admin',
    icon: 'person_pin',
    email: 'patient@cliniva.os',
    quickStat: 'Self-Service Ready',
    features: ['Unified Health Record', 'Prescription History', 'Lab Report Download'],
    accent: {
      iconBg: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
      badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200/50',
      ringColor: 'hover:border-cyan-500 hover:shadow-cyan-500/10',
      glowHover: 'group-hover:text-cyan-700',
      launchBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    },
  },
]

const ROLE_ROUTES: Record<string, string> = {
  doctor: '/doctor',
  front_desk: '/front-desk',
  nurse: '/nursing',
  pharmacist: '/pharmacy',
  lab_tech: '/lab',
  cashier: '/billing',
  admin: '/admin',
  canteen: '/canteen',
  patient: '/portal',
}

const CATEGORIES: { id: RoleCategory; label: string; count: number }[] = [
  { id: 'all', label: 'All Workspaces', count: 9 },
  { id: 'clinical', label: 'Clinical Care', count: 3 },
  { id: 'operations', label: 'Operations', count: 3 },
  { id: 'admin', label: 'Admin & Services', count: 3 },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientSideClient()

  const [activeCategory, setActiveCategory] = useState<RoleCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [launchingRole, setLaunchingRole] = useState<string | null>(null)
  
  // Enterprise Sign In Modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authRole, setAuthRole] = useState<RoleCardItem>(ROLE_CARDS[0])
  const [email, setEmail] = useState(ROLE_CARDS[0].email)
  const [password, setPassword] = useState('demo1234')
  const [trustDevice, setTrustDevice] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filtered role list
  const filteredRoles = useMemo(() => {
    return ROLE_CARDS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.features.some((f) => f.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const handleQuickLaunch = (card: RoleCardItem) => {
    setLaunchingRole(card.role)
    document.cookie = `cliniva_demo_role=${card.role}; path=/; max-age=86400`
    const dest = ROLE_ROUTES[card.role] ?? '/doctor'
    window.location.href = dest
  }

  const openAuthModalForRole = (card: RoleCardItem) => {
    setAuthRole(card)
    setEmail(card.email)
    setPassword('demo1234')
    setAuthError(null)
    setShowAuthModal(true)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.session) {
        const userRole = data.session.user.user_metadata?.role as string | undefined
        const dest = userRole ? (ROLE_ROUTES[userRole] ?? '/') : '/'
        window.location.href = dest
        return
      }
    } catch {
      // Offline fallback
    }

    // Demo role fallback
    document.cookie = `cliniva_demo_role=${authRole.role}; path=/; max-age=86400`
    const dest = ROLE_ROUTES[authRole.role] ?? '/doctor'
    window.location.href = dest
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden flex flex-col justify-between selection:bg-primary/20">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-br from-primary/10 via-secondary-fixed/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-sky-400/10 via-primary-fixed/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#bcc9c6_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Top Brand & Enterprise Status Bar */}
      <header className="w-full border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_12px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Medical Facility Info */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#008378] text-white flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">vital_signs</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-headline-sm sm:text-headline-md font-bold tracking-tight text-on-surface">
                  Cliniva OS
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-fixed/50 text-on-primary-fixed-variant border border-primary-fixed">
                  v2.4 Enterprise
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant font-medium leading-none hidden sm:block">
                St. Jude Medical Center — Integrated Clinical Workstation
              </p>
            </div>
          </a>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Workspaces Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-[12px] text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-on-surface">9 Workspaces Ready</span>
            </div>

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Staff Sign-In Trigger */}
            <button
              onClick={() => openAuthModalForRole(ROLE_CARDS[0])}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface font-semibold text-label-md transition-all shadow-sm hover:shadow active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">key</span>
              <span className="hidden sm:inline">Enterprise Staff Sign-In</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-fixed/50 border border-secondary-fixed text-on-primary-fixed-variant text-[12px] font-semibold mb-3">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            <span>Single Click Sandbox & Role Navigation</span>
          </div>

          <h1 className="font-heading text-headline-lg sm:text-display-lg text-on-surface font-bold tracking-tight mb-3">
            Select Your Clinical Workspace
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Experience role-tailored dashboards designed with high-contrast clinical typography, 
            instant patient queues, and HL7-synchronized workflows.
          </p>
        </div>

        {/* Filter and Search Bar Toolbar */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-outline-variant/40 shadow-card mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto smooth-touch-scroll pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-label-md font-semibold transition-all whitespace-nowrap flex items-center gap-2 touch-tap ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Live Search Box */}
            <div className="relative w-full sm:w-72 md:w-80 flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role or capability..."
                className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[14px]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        {filteredRoles.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 shadow-card max-w-md mx-auto">
            <span className="material-symbols-outlined text-outline text-[48px] mb-2">search_off</span>
            <h3 className="font-heading text-headline-sm font-semibold text-on-surface mb-1">No roles matched</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              We couldn&apos;t find any roles matching &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="btn-primary text-label-md py-2 px-4 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredRoles.map((card) => {
              const isLaunching = launchingRole === card.role

              return (
                <div
                  key={card.role}
                  onClick={() => handleQuickLaunch(card)}
                  className={`group relative bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-card-hover ${card.accent.ringColor}`}
                >
                  {/* Subtle top ambient glow */}
                  <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Row: Icon + Badge + Live Stat */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {/* Icon container */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${card.accent.iconBg}`}
                      >
                        <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
                      </div>

                      {/* Badge and Quick Stat */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${card.accent.badgeBg}`}
                        >
                          {card.badge}
                        </span>
                        <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {card.quickStat}
                        </span>
                      </div>
                    </div>

                    {/* Role Title & Subtitle */}
                    <div className="mb-4">
                      <h3
                        className={`font-heading text-headline-sm font-bold text-on-surface transition-colors ${card.accent.glowHover}`}
                      >
                        {card.label}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                        {card.department}
                      </p>
                    </div>

                    {/* Feature Capability Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {card.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-surface-container-low border border-outline-variant/30 rounded-md text-[11px] font-medium text-on-surface-variant group-hover:bg-surface-container transition-colors"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    {/* Launch Workspace Button */}
                    <a
                      href={ROLE_ROUTES[card.role] ?? '/doctor'}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickLaunch(card)
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${card.accent.launchBtn}`}
                    >
                      {isLaunching ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                          </span>
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch Workspace</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </a>

                    {/* Credentials Sign-In Shortcut Button */}
                    <button
                      type="button"
                      title="Enter custom credentials for this role"
                      onClick={(e) => {
                        e.stopPropagation()
                        openAuthModalForRole(card)
                      }}
                      className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center flex-shrink-0 touch-tap"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Helper Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            </div>
            <div>
              <p className="text-body-sm font-semibold text-on-surface">
                Instant Sandbox Mode Active
              </p>
              <p className="text-[12px] text-on-surface-variant">
                Every role opens a fully simulated dashboard pre-loaded with patient charts, live vitals telemetry, and sample clinical orders.
              </p>
            </div>
          </div>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-1 text-primary font-semibold text-label-md hover:underline whitespace-nowrap"
          >
            <span>Clinic Setup Wizard</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </main>

      {/* Enterprise Staff Authentication Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-modal border border-outline-variant/30 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${authRole.accent.iconBg}`}
                >
                  <span className="material-symbols-outlined text-[22px]">{authRole.icon}</span>
                </div>
                <div>
                  <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                    Enterprise Staff Sign In
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    {authRole.label} • {authRole.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Role Switcher Chips inside Modal */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Switch Role Preset
              </label>
              <div className="flex gap-1.5 overflow-x-auto smooth-touch-scroll pb-1">
                {ROLE_CARDS.map((c) => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => {
                      setAuthRole(c)
                      setEmail(c.email)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all border ${
                      authRole.role === c.role
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface font-semibold block mb-1">
                  Enterprise Email / Hospital ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cliniva.os"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-label-md text-on-surface font-semibold">
                    Password / Passcode
                  </label>
                  <span className="text-[12px] text-primary hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              {/* MFA Trust Device */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                />
                <span className="text-body-sm text-on-surface-variant">
                  Trust this clinical workstation (MFA bypass 8h)
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Authenticate & Launch Workspace</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false)
                    handleQuickLaunch(authRole)
                  }}
                  className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label-md font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Bypass with Instant Preview Mode</span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-outline-variant/20 text-center">
              <p className="text-[12px] text-on-surface-variant">
                Need card reader access or token reset? <br />
                <span className="text-primary font-semibold">IT Biomedical Helpdesk (Ext. 4000)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compliance & Security Footer */}
      <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest/70 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[12px] text-on-surface-variant">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              HIPAA & SOC-2 Type II Certified
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-primary text-[16px]">hub</span>
              HL7 v2.5 & FHIR R4 Ready
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
              AES-256 Multi-Tenant Isolation
            </span>
          </div>

          <div className="text-[12px] text-on-surface-variant font-medium">
            © {new Date().getFullYear()} Cliniva OS. St. Jude Medical Center.
          </div>
        </div>
      </footer>
    </div>
  )
}
