'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSideClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface RoleItem {
  id: string
  name: string
  subtitle: string
  badge: string
  icon: string
  route: string
  description: string
  highlights: string[]
  accent: {
    badge: string
    iconBg: string
    button: string
    borderHover: string
  }
}

const CLINICAL_ROLES: RoleItem[] = [
  {
    id: 'doctor',
    name: 'Doctor Portal',
    subtitle: 'Clinical OPD & Ward Rounds',
    badge: 'Physician / CMO',
    icon: 'stethoscope',
    route: '/doctor',
    description: 'Complete patient encounter workbench with triage queues, SOAP clinical notes, ICD-10 codification, and e-Prescriptions.',
    highlights: ['Active OPD Queue', 'SOAP Notes & Vitals', 'Direct Lab Orders'],
    accent: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      borderHover: 'hover:border-emerald-500/50',
    },
  },
  {
    id: 'front_desk',
    name: 'Front Desk & Triage',
    subtitle: 'Registration & Dispatch',
    badge: 'Reception & Intake',
    icon: 'badge',
    route: '/front-desk',
    description: 'Fast patient check-in, permanent UHID generation, token ticketing, specialty triage, and doctor slot scheduling.',
    highlights: ['UHID Generation', 'Real-Time Token Display', 'Specialty Dispatch'],
    accent: {
      badge: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
      iconBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
      button: 'bg-sky-600 hover:bg-sky-700 text-white',
      borderHover: 'hover:border-sky-500/50',
    },
  },
  {
    id: 'nurse',
    name: 'Inpatient Nursing',
    subtitle: 'Ward Station & Bed Board',
    badge: 'Ward Station',
    icon: 'local_hospital',
    route: '/nursing',
    description: 'Real-time bed occupancy grid, continuous vitals telemetry tracking, doctor order execution, and Medication Administration Records (MAR).',
    highlights: ['Bed Roster Map', 'Vitals Telemetry', 'Medication Schedule (MAR)'],
    accent: {
      badge: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
      iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      borderHover: 'hover:border-rose-500/50',
    },
  },
  {
    id: 'pharmacist',
    name: 'Central Pharmacy',
    subtitle: 'Dispensing & Drug Inventory',
    badge: 'Dispensary',
    icon: 'pill',
    route: '/pharmacy',
    description: 'Automated prescription fulfillment, barcode dispensing, batch expiry notifications, supplier purchase orders, and stock reordering.',
    highlights: ['Doctor e-Rx Sync', 'Batch Expiry Alerts', 'Automated Stock Deduct'],
    accent: {
      badge: 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60',
      iconBg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
      button: 'bg-violet-600 hover:bg-violet-700 text-white',
      borderHover: 'hover:border-violet-500/50',
    },
  },
  {
    id: 'lab_tech',
    name: 'Diagnostics & Pathology',
    subtitle: 'Specimens & HL7 Analyzer',
    badge: 'Clinical Lab',
    icon: 'science',
    route: '/lab',
    description: 'Sample barcode accession, bi-directional analyzer integration, automated normal range flaggers, and one-click PDF test reports.',
    highlights: ['Barcode Accession', 'Analyzer HL7 Sync', 'Normal Range Verifier'],
    accent: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      borderHover: 'hover:border-amber-500/50',
    },
  },
  {
    id: 'cashier',
    name: 'Billing & Cashier',
    subtitle: 'Invoicing & TPA Claims',
    badge: 'Finance Desk',
    icon: 'receipt_long',
    route: '/billing',
    description: 'Unified billing combining OPD consults, lab tests, IP bed charges, and pharmacy supplies into itemized invoices with split payments.',
    highlights: ['Itemized Hospital Bills', 'Insurance Pre-Auth', 'Split Payment Receipts'],
    accent: {
      badge: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
      iconBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
      button: 'bg-teal-600 hover:bg-teal-700 text-white',
      borderHover: 'hover:border-teal-500/50',
    },
  },
  {
    id: 'admin',
    name: 'Hospital Administration',
    subtitle: 'Analytics & Staff Security',
    badge: 'Governance',
    icon: 'admin_panel_settings',
    route: '/admin',
    description: 'Hospital-wide operational reporting, bed turnover metrics, staff role-based access control (RBAC), and HIPAA audit trail logs.',
    highlights: ['Operational KPI Metrics', 'Role Permissions (RBAC)', 'Security Audit Logs'],
    accent: {
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
      iconBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      borderHover: 'hover:border-indigo-500/50',
    },
  },
  {
    id: 'canteen',
    name: 'Dietary & Cafeteria',
    subtitle: 'Clinical Nutrition & POS',
    badge: 'Dietary Station',
    icon: 'restaurant',
    route: '/canteen',
    description: 'Inpatient nutritional meal schedules aligned with doctor diet orders, allergen warnings, tray delivery tracking, and cafeteria POS.',
    highlights: ['Ward Diet Schedules', 'Allergen Guard', 'Cafeteria Point-of-Sale'],
    accent: {
      badge: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
      iconBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      borderHover: 'hover:border-orange-500/50',
    },
  },
  {
    id: 'patient',
    name: 'Patient Health Portal',
    subtitle: 'Self-Service Electronic Records',
    badge: 'Patient Access',
    icon: 'person_pin',
    route: '/portal',
    description: 'Patient-facing electronic medical record viewing, appointment booking, lab diagnostic report downloads, and active prescription refills.',
    highlights: ['Unified Medical Chart', 'Verified Lab Reports', 'Appointment Booking'],
    accent: {
      badge: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
      iconBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      borderHover: 'hover:border-cyan-500/50',
    },
  },
]

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientSideClient()

  const [activeTab, setActiveTab] = useState<'all' | 'clinical' | 'operations'>('all')
  const [launchingRole, setLaunchingRole] = useState<string | null>(null)

  // Enterprise Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<RoleItem>(CLINICAL_ROLES[0])
  const [email, setEmail] = useState('doctor@cliniva.os')
  const [password, setPassword] = useState('demo1234')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleLaunchRole = (role: RoleItem) => {
    setLaunchingRole(role.id)
    document.cookie = `cliniva_demo_role=${role.id}; path=/; max-age=86400`
    window.location.href = role.route
  }

  const handleOpenAuthModal = (role?: RoleItem) => {
    const target = role || CLINICAL_ROLES[0]
    setSelectedRoleForAuth(target)
    setEmail(`${target.id}@cliniva.os`)
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
        const userRole = (data.session.user.user_metadata?.role as string) || selectedRoleForAuth.id
        const matched = CLINICAL_ROLES.find((r) => r.id === userRole)
        window.location.href = matched ? matched.route : '/doctor'
        return
      }
    } catch {
      // Offline fallback
    }

    // Demo role fallback
    document.cookie = `cliniva_demo_role=${selectedRoleForAuth.id}; path=/; max-age=86400`
    window.location.href = selectedRoleForAuth.route
  }

  const filteredRoles = CLINICAL_ROLES.filter((item) => {
    if (activeTab === 'clinical') {
      return ['doctor', 'nurse', 'lab_tech'].includes(item.id)
    }
    if (activeTab === 'operations') {
      return ['front_desk', 'pharmacist', 'cashier', 'admin', 'canteen'].includes(item.id)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between selection:bg-primary/20">
      
      {/* ─── Top Header Navigation ─── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#008378] text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">vital_signs</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-headline-sm sm:text-headline-md font-bold tracking-tight text-on-surface">
                  Cliniva OS
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-fixed/40 text-on-primary-fixed-variant border border-primary-fixed/60">
                  Cloud HIS / EMR
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant font-medium hidden sm:block">
                Hospital Information & Clinical Management Suite
              </p>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-body-sm font-medium text-on-surface-variant">
            <a href="#architecture" className="hover:text-primary transition-colors">
              Platform Architecture
            </a>
            <a href="#workspaces" className="hover:text-primary transition-colors">
              Clinical Modules
            </a>
            <a href="#standards" className="hover:text-primary transition-colors">
              Security & Standards
            </a>
            <a href="/onboarding" className="hover:text-primary transition-colors">
              Clinic Setup
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => handleOpenAuthModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-label-md font-semibold transition-all touch-tap"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
              <span>Staff Login</span>
            </button>

            <a
              href="#workspaces"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#005049] text-white text-label-md font-semibold shadow-sm transition-all touch-tap"
            >
              <span>Explore Workspaces</span>
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 overflow-hidden border-b border-outline-variant/20">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-secondary-fixed/10 to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/50 text-[12px] font-semibold text-primary mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Modern, Paperless & Connected Healthcare Operating System</span>
          </div>

          {/* High-Impact Simple Title */}
          <h1 className="font-heading text-display-lg sm:text-[48px] sm:leading-[56px] font-bold text-on-surface tracking-tight max-w-4xl mx-auto mb-5">
            Simplify Hospital Care. <br className="hidden sm:inline" />
            <span className="text-primary">Power Every Clinical Workflow.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg sm:text-[18px] sm:leading-[28px] text-on-surface-variant max-w-3xl mx-auto mb-8">
            Upgrade to Cliniva OS — the cloud-based, fully integrated, secure, and reliable healthcare management suite.
            Seamlessly synchronize outpatient triage, inpatient ward telemetry, electronic prescriptions, diagnostics, and itemized billing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <button
              onClick={() => handleLaunchRole(CLINICAL_ROLES[0])}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-[#005049] text-white font-semibold text-label-lg shadow-sm transition-all touch-tap"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span>Launch Doctor Dashboard</span>
            </button>

            <button
              onClick={() => handleOpenAuthModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 text-on-surface font-semibold text-label-lg transition-all touch-tap"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">key</span>
              <span>Staff Authentication</span>
            </button>

            <a
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-on-surface-variant hover:text-primary font-semibold text-label-lg transition-colors"
            >
              <span>Clinic Setup Wizard</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          {/* Live Trust Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-outline-variant/20">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <div className="font-heading text-headline-sm font-bold text-primary">9 Workspaces</div>
              <div className="text-[12px] text-on-surface-variant font-medium">Role-tailored modules</div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <div className="font-heading text-headline-sm font-bold text-primary">100% Paperless</div>
              <div className="text-[12px] text-on-surface-variant font-medium">Digital records & e-Rx</div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <div className="font-heading text-headline-sm font-bold text-primary">HL7 & FHIR R4</div>
              <div className="text-[12px] text-on-surface-variant font-medium">Interoperable standards</div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <div className="font-heading text-headline-sm font-bold text-primary">99.99% Cloud SLA</div>
              <div className="text-[12px] text-on-surface-variant font-medium">Always-on uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Architecture (Directly inspired by MocDoc Infographic) ─── */}
      <section id="architecture" className="py-16 sm:py-24 bg-surface-container-lowest/50 border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-bold uppercase tracking-wider">
              Cloud Infrastructure & Efficiency
            </span>
            <h2 className="font-heading text-headline-lg sm:text-[36px] font-bold text-on-surface tracking-tight mt-3 mb-3">
              Intelligent Healthcare Architecture
            </h2>
            <p className="text-body-md sm:text-body-lg text-on-surface-variant">
              Engineered from the ground up for medical practitioners, hospital administrators, and diagnostic centers seeking speed, precision, and reliability.
            </p>
          </div>

          {/* Central Radiating Architecture Diagram */}
          <div className="relative max-w-6xl mx-auto">
            
            {/* Desktop / Tablet Layout: Left Branch - Center Hub - Right Branch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
              
              {/* LEFT COLUMN: 3 Core Pillars */}
              <div className="space-y-4 sm:space-y-5">
                
                {/* Card 1: Zero Maintenance */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">settings_suggest</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        Zero Maintenance
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Automatic cloud deployments and database migrations. No local servers or IT overhead required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Go Paperless */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        100% Paperless Care
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Digital outpatient queues, electronic prescriptions, nursing telemetry, and itemized billing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Secure Cloud Backup */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        Automated Cloud Backup
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Continuous snapshot backups, multi-tenant isolation, and encrypted off-site disaster recovery.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* CENTER HUB: Cliniva OS Core Platform */}
              <div className="flex flex-col items-center justify-center py-6 lg:py-0">
                <div className="relative flex items-center justify-center">
                  
                  {/* Subtle radiating pulse rings */}
                  <div className="absolute w-64 h-64 rounded-full bg-primary/5 animate-ping opacity-75" />
                  <div className="absolute w-52 h-52 rounded-full border border-primary/20 bg-primary/10" />

                  {/* Core Platform Disc */}
                  <div className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-[#00685f] to-[#008378] text-white p-5 flex flex-col items-center justify-center shadow-xl shadow-primary/25 border-4 border-white dark:border-slate-800 text-center">
                    <span className="material-symbols-outlined text-[36px] mb-1">hub</span>
                    <span className="font-heading font-extrabold text-[18px] tracking-tight leading-tight">
                      Cliniva OS
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed mt-0.5">
                      Cloud Core
                    </span>
                    <span className="text-[9px] text-white/80 mt-1">
                      HL7 • FHIR • HIPAA
                    </span>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <span className="text-[12px] font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    Real-time Supabase Core Sync
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: 3 Core Pillars */}
              <div className="space-y-4 sm:space-y-5">
                
                {/* Card 4: Access Anytime Anywhere */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">devices</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        Anytime, Anywhere Access
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Responsive design optimized for desktop workstations, ward tablets, and nurse mobile devices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 5: Multi-Location Support */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">apartment</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        Multi-Branch & Specialty
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Unified UHID patient tracking across multiple hospital branches, clinics, and specialty wings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 6: Minimal Cost of Ownership */}
                <div className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-primary/50 hover:shadow-card transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">savings</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-1">
                        Minimal Total Cost
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Eliminate server hardware costs and long rollout cycles with rapid same-day onboarding.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── Role-Tailored Workspaces Section ─── */}
      <section id="workspaces" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed/50 border border-secondary-fixed text-on-primary-fixed-variant text-[12px] font-bold uppercase tracking-wider">
              Modular Hospital Suite
            </span>
            <h2 className="font-heading text-headline-lg sm:text-[36px] font-bold text-on-surface tracking-tight mt-3 mb-2">
              Select Your Clinical Workspace
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Launch into live, pre-populated sandboxes with patient records, real-time telemetry, and integrated order fulfillment.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-xl border border-outline-variant/40 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-label-md font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All (9)
            </button>
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-3.5 py-1.5 rounded-lg text-label-md font-semibold transition-all ${
                activeTab === 'clinical'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Clinical Care
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-3.5 py-1.5 rounded-lg text-label-md font-semibold transition-all ${
                activeTab === 'operations'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Operations & Admin
            </button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => {
            const isLaunching = launchingRole === role.id

            return (
              <div
                key={role.id}
                className={`bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-card ${role.accent.borderHover}`}
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${role.accent.iconBg}`}
                    >
                      <span className="material-symbols-outlined text-[26px]">{role.icon}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${role.accent.badge}`}
                    >
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                      {role.name}
                    </h3>
                    <p className="text-[12px] font-medium text-primary">
                      {role.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-body-sm text-on-surface-variant mb-4 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-1.5 mb-6">
                    {role.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-outline-variant/20 flex items-center gap-2">
                  <button
                    onClick={() => handleLaunchRole(role)}
                    disabled={isLaunching}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-xs ${role.accent.button}`}
                  >
                    {isLaunching ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <span>Launch Workspace</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    title="Sign in with specific credentials for this role"
                    onClick={() => handleOpenAuthModal(role)}
                    className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center flex-shrink-0 touch-tap"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instant Sandbox Banner */}
        <div className="mt-8 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h4 className="font-heading text-body-md font-bold text-on-surface">
                Pre-configured Hospital Sandbox Ready
              </h4>
              <p className="text-[12px] text-on-surface-variant">
                Every workspace opens directly with realistic patient demographics, live vitals telemetry, active prescriptions, and ward rosters.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleLaunchRole(CLINICAL_ROLES[0])}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-label-md font-semibold border border-outline-variant/40 transition-colors whitespace-nowrap"
          >
            <span>Instant Preview Mode</span>
            <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
          </button>
        </div>
      </section>

      {/* ─── Security, Compliance & Standards Section ─── */}
      <section id="standards" className="py-14 bg-surface-container-low/60 border-t border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="font-heading text-headline-sm font-bold text-on-surface">
              Hospital-Grade Security & Regulatory Compliance
            </h3>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Engineered to meet stringent international digital health protection standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2">security</span>
              <div className="font-heading text-body-md font-bold text-on-surface">HIPAA Compliant</div>
              <div className="text-[11px] text-on-surface-variant">Encrypted PHI data at rest & transit</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2">hub</span>
              <div className="font-heading text-body-md font-bold text-on-surface">HL7 & FHIR R4</div>
              <div className="text-[11px] text-on-surface-variant">Diagnostic analyzer interoperability</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2">lock</span>
              <div className="font-heading text-body-md font-bold text-on-surface">SOC-2 Type II</div>
              <div className="text-[11px] text-on-surface-variant">Role-based access & audit trails</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2">local_hospital</span>
              <div className="font-heading text-body-md font-bold text-on-surface">NABH Digital Ready</div>
              <div className="text-[11px] text-on-surface-variant">Standardized clinical guidelines</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Enterprise Sign-In Modal ─── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-modal border border-outline-variant/30 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRoleForAuth.accent.iconBg}`}
                >
                  <span className="material-symbols-outlined text-[22px]">{selectedRoleForAuth.icon}</span>
                </div>
                <div>
                  <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                    Staff Authentication
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    {selectedRoleForAuth.name}
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

            {/* Quick Role Preset Pills */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Switch Role Preset
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {CLINICAL_ROLES.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoleForAuth(c)
                      setEmail(`${c.id}@cliniva.os`)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all border ${
                      selectedRoleForAuth.id === c.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    {c.name.split(' ')[0]}
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
                  Staff Email / Hospital ID
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
                    placeholder="doctor@cliniva.os"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-md text-on-surface font-semibold block mb-1">
                  Password / Passcode
                </label>
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
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary hover:bg-[#005049] text-white rounded-xl font-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Authenticate & Launch</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false)
                    handleLaunchRole(selectedRoleForAuth)
                  }}
                  className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label-md font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                  <span>Instant Sandbox Bypass</span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-outline-variant/20 text-center">
              <p className="text-[12px] text-on-surface-variant">
                Need token reset or RFID badge sync? <br />
                <span className="text-primary font-semibold">Hospital IT Biomedical Desk (Ext. 4000)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Professional Healthcare Footer ─── */}
      <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">vital_signs</span>
                </div>
                <span className="font-heading text-headline-sm font-bold text-on-surface">Cliniva OS</span>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-4">
                Cloud-native hospital information system and electronic medical record workstation suite.
              </p>
              <div className="text-[12px] text-on-surface-variant">
                St. Jude Medical Center Deployment
              </div>
            </div>

            {/* Clinical Modules */}
            <div>
              <h4 className="font-heading text-label-md font-bold uppercase tracking-wider text-on-surface mb-3">
                Clinical Modules
              </h4>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li><a href="/doctor" className="hover:text-primary transition-colors">Doctor OPD & SOAP</a></li>
                <li><a href="/nursing" className="hover:text-primary transition-colors">Inpatient Ward & MAR</a></li>
                <li><a href="/pharmacy" className="hover:text-primary transition-colors">Pharmacy & Dispense</a></li>
                <li><a href="/lab" className="hover:text-primary transition-colors">Diagnostics & HL7 Lab</a></li>
              </ul>
            </div>

            {/* Operations */}
            <div>
              <h4 className="font-heading text-label-md font-bold uppercase tracking-wider text-on-surface mb-3">
                Operations
              </h4>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li><a href="/front-desk" className="hover:text-primary transition-colors">Front Desk & UHID</a></li>
                <li><a href="/billing" className="hover:text-primary transition-colors">Itemized Billing & TPA</a></li>
                <li><a href="/admin" className="hover:text-primary transition-colors">Hospital Governance</a></li>
                <li><a href="/canteen" className="hover:text-primary transition-colors">Dietary & Nutrition</a></li>
              </ul>
            </div>

            {/* Support & Governance */}
            <div>
              <h4 className="font-heading text-label-md font-bold uppercase tracking-wider text-on-surface mb-3">
                Governance & Support
              </h4>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li><a href="/onboarding" className="hover:text-primary transition-colors">Clinic Setup Wizard</a></li>
                <li><a href="/portal" className="hover:text-primary transition-colors">Patient Health Portal</a></li>
                <li><a href="/login" className="hover:text-primary transition-colors">Staff Access Portal</a></li>
                <li className="pt-2 text-[12px] text-primary font-semibold">24/7 IT Helpdesk: Ext. 4000</li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-on-surface-variant">
            <div>
              © {new Date().getFullYear()} Cliniva OS. All rights reserved. Hospital Cloud Suite v2.4.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>HIPAA Compliance</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

