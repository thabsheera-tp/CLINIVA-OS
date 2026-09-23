'use client'

import { useState } from 'react'
import {
  Activity,
  Stethoscope,
  Users,
  BedDouble,
  Pill,
  FlaskConical,
  Receipt,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Zap,
  FileText,
  X,
  Sparkles,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClientSideClient } from '@/lib/supabase/client'

interface WorkspaceCard {
  id: string
  title: string
  subtitle: string
  description: string
  icon: any
  route: string
  badge: string
  color: {
    bg: string
    text: string
    btn: string
  }
}

const WORKSPACES: WorkspaceCard[] = [
  {
    id: 'doctor',
    title: 'Doctor Portal',
    subtitle: 'OPD Consultations & SOAP',
    description: 'Patient queue triage, clinical SOAP notes, diagnoses, and digital e-prescriptions.',
    icon: Stethoscope,
    route: '/doctor',
    badge: 'Clinical Care',
    color: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  },
  {
    id: 'front_desk',
    title: 'Front Desk',
    subtitle: 'Patient Registration & Tokens',
    description: 'Quick patient intake, UHID issuance, real-time token queues, and doctor scheduling.',
    icon: Users,
    route: '/front-desk',
    badge: 'Reception',
    color: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      text: 'text-sky-700',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
  },
  {
    id: 'nurse',
    title: 'Nursing Ward',
    subtitle: 'Bed Roster & Vitals Tracking',
    description: 'Real-time bed occupancy grid, patient vitals monitoring, and medication administration.',
    icon: BedDouble,
    route: '/nursing',
    badge: 'Inpatient Care',
    color: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      text: 'text-rose-700',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  },
  {
    id: 'pharmacist',
    title: 'Pharmacy',
    subtitle: 'Dispensing & Stock Inventory',
    description: 'Direct prescription dispensing, batch expiry notifications, and medication stock alerts.',
    icon: Pill,
    route: '/pharmacy',
    badge: 'Dispensary',
    color: {
      bg: 'bg-violet-50 text-violet-700 border-violet-200',
      text: 'text-violet-700',
      btn: 'bg-violet-600 hover:bg-violet-700 text-white',
    },
  },
  {
    id: 'lab_tech',
    title: 'Diagnostics Lab',
    subtitle: 'Specimens & Test Reports',
    badge: 'Pathology',
    description: 'Sample barcode accession, test result entry, normal range checks, and PDF report releases.',
    icon: FlaskConical,
    route: '/lab',
    color: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-700',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  },
  {
    id: 'cashier',
    title: 'Billing & Cashier',
    subtitle: 'Invoicing & Payments',
    badge: 'Finance',
    description: 'Itemized hospital bills combining doctor fees, bed charges, pharmacy supplies, and lab tests.',
    icon: Receipt,
    route: '/billing',
    color: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      text: 'text-teal-700',
      btn: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
  },
]

export default function SimpleLandingPage() {
  const supabase = createClientSideClient()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(WORKSPACES[0])
  const [email, setEmail] = useState('doctor@cliniva.os')
  const [password, setPassword] = useState('demo1234')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleLaunchWorkspace = (card: WorkspaceCard) => {
    document.cookie = `cliniva_demo_role=${card.id}; path=/; max-age=86400`
    window.location.href = card.route
  }

  const handleOpenAuth = (card?: WorkspaceCard) => {
    const target = card || WORKSPACES[0]
    setSelectedRole(target)
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
        const userRole = data.session.user.user_metadata?.role as string | undefined
        const matched = WORKSPACES.find((w) => w.id === userRole)
        window.location.href = matched ? matched.route : '/doctor'
        return
      }
    } catch {
      // Offline fallback
    }

    // Demo role fallback
    document.cookie = `cliniva_demo_role=${selectedRole.id}; path=/; max-age=86400`
    window.location.href = selectedRole.route
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* ─── Simple Navigation Header ─── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Cliniva OS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Hospital Suite
              </span>
            </div>
          </a>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#workspaces" className="hover:text-teal-700 transition-colors">
              Departments
            </a>
            <a href="#why-cliniva" className="hover:text-teal-700 transition-colors">
              Why Cliniva
            </a>
            <a href="/onboarding" className="hover:text-teal-700 transition-colors">
              Clinic Setup
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={() => handleOpenAuth()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => handleLaunchWorkspace(WORKSPACES[0])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors min-h-[40px]"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section (Clean, Spacious & Friendly) ─── */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Simple, Paperless Hospital Software</span>
        </div>

        {/* Clear Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
          Healthcare management, <br className="hidden sm:inline" />
          <span className="text-teal-700">made simple.</span>
        </h1>

        {/* Approachable Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Cliniva OS connects consultations, patient queues, prescriptions, inpatient beds, lab tests, and billing into one clean, easy-to-use platform.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-10">
          <button
            onClick={() => handleLaunchWorkspace(WORKSPACES[0])}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-xs transition-colors min-h-[46px]"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            onClick={() => handleOpenAuth()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors min-h-[46px]"
          >
            <Lock className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            <span>Staff Login</span>
          </button>
        </div>

        {/* Key Stats Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-4 border-t border-slate-200">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No Installation Needed
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Pre-loaded Sample Data
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Instant 1-Click Access
          </span>
        </div>
      </section>

      {/* ─── Departments Chooser Section (Super Simple & Visual) ─── */}
      <section id="workspaces" className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Choose a Department
            </h2>
            <p className="text-sm text-slate-600">
              Click any workspace below to immediately test the live, interactive system.
            </p>
          </div>

          {/* 6 Clean Workspace Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {WORKSPACES.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.id}
                  onClick={() => handleLaunchWorkspace(card)}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${card.color.bg}`}>
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {card.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-teal-700 transition-colors">
                      {card.title}
                    </h3>
                    <div className="text-xs font-medium text-slate-500 mb-2">
                      {card.subtitle}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {card.description}
                    </p>
                  </div>

                  {/* 1-Click Launch Button */}
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-xs font-semibold text-teal-700 group-hover:underline inline-flex items-center gap-1">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[11px] text-slate-400">1-click</span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ─── Why Cliniva OS (4 Simple Points) ─── */}
      <section id="why-cliniva" className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Why Clinics Prefer Cliniva OS
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to remove administrative friction so doctors and staff can focus on patients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <Zap className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Easy to Learn</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No lengthy training required. Intuitive screens that staff understand in minutes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">100% Paperless</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant digital charts, electronic prescriptions, and itemized billing receipts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Cloud Secured</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encrypted patient medical records with continuous automated cloud backups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center sm:text-left">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 mx-auto sm:mx-0">
              <Smartphone className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Works on Any Device</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Responsive experience on desktop workstations, clinic tablets, and mobile phones.
            </p>
          </div>

        </div>

      </section>

      {/* ─── Simple Staff Sign In Modal ─── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Staff Sign In
                </h3>
                <p className="text-xs text-slate-500">
                  Select a role preset or enter credentials
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Quick Role Preset Switcher */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Role Preset:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {WORKSPACES.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(w)
                      setEmail(`${w.id}@cliniva.os`)
                    }}
                    className={`px-2 py-1.5 rounded text-xs font-semibold border transition-all text-center ${
                      selectedRole.id === w.id
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {w.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {authError && (
              <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Sign In to Workspace'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false)
                    handleLaunchWorkspace(selectedRole)
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Instant Demo Bypass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Simple Clean Footer ─── */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Cliniva OS</span>
            <span>•</span>
            <span>St. Jude Medical Center</span>
            <span>•</span>
            <span>IT Helpline: Ext. 4000</span>
          </div>
          <div>
            © {new Date().getFullYear()} Cliniva OS. Simple & Modular Healthcare System.
          </div>
        </div>
      </footer>

    </div>
  )
}


