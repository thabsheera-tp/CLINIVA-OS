'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  Stethoscope,
  Users,
  BedDouble,
  Pill,
  FlaskConical,
  Receipt,
  Building2,
  HeartPulse,
  Coffee,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Zap,
  ChevronRight,
  Clock,
  Search,
  Menu,
  X,
  Layers,
  Shield,
  Check,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export interface DepartmentWorkspace {
  id: string
  title: string
  subtitle: string
  category: 'clinical' | 'operations' | 'support'
  simpleDescription: string
  icon: any
  route: string
  badge: string
  color: {
    bg: string
    darkBg: string
    text: string
    darkText: string
    border: string
    darkBorder: string
    badgeBg: string
    badgeText: string
  }
  whatItDoes: string[]
  sampleAction: string
}

const WORKSPACES: DepartmentWorkspace[] = [
  {
    id: 'front-desk',
    title: 'Front Desk & Reception',
    subtitle: 'Patient Registration & Token Queue',
    category: 'operations',
    simpleDescription: 'Welcomes patients, creates digital patient profiles (UHID), and issues live waiting tokens for doctor OPD.',
    icon: Users,
    route: '/front-desk',
    badge: 'Front Desk',
    color: {
      bg: 'bg-sky-500/10',
      darkBg: 'dark:bg-sky-500/20',
      text: 'text-sky-700',
      darkText: 'dark:text-sky-400',
      border: 'border-sky-200',
      darkBorder: 'dark:border-sky-800',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
      badgeText: 'text-sky-700 dark:text-sky-300',
    },
    whatItDoes: [
      'Fast 1-minute patient check-in',
      'Instant unique patient ID (UHID)',
      'Live queue token tracking',
    ],
    sampleAction: 'Register & queue patient',
  },
  {
    id: 'doctor',
    title: 'Doctor Consultation (OPD)',
    subtitle: 'Clinical Notes, Diagnoses & e-Prescriptions',
    category: 'clinical',
    simpleDescription: 'Where doctors examine patients, write digital SOAP notes, record diagnoses, and issue instant digital prescriptions.',
    icon: Stethoscope,
    route: '/doctor',
    badge: 'Doctors & OPD',
    color: {
      bg: 'bg-emerald-500/10',
      darkBg: 'dark:bg-emerald-500/20',
      text: 'text-emerald-700',
      darkText: 'dark:text-emerald-400',
      border: 'border-emerald-200',
      darkBorder: 'dark:border-emerald-800',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
    whatItDoes: [
      'View waiting patients in real-time',
      'Type easy clinical notes & SOAP records',
      '1-click digital prescriptions to pharmacy',
    ],
    sampleAction: 'Consult & write prescription',
  },
  {
    id: 'nursing',
    title: 'Nursing & Inpatient Ward',
    subtitle: 'Bed Management & Patient Vitals',
    category: 'clinical',
    simpleDescription: 'Helps nurses record patient vitals (BP, pulse, temp), manage inpatient bed allocation, and coordinate daily bedside care.',
    icon: BedDouble,
    route: '/nursing',
    badge: 'Nursing Ward',
    color: {
      bg: 'bg-rose-500/10',
      darkBg: 'dark:bg-rose-500/20',
      text: 'text-rose-700',
      darkText: 'dark:text-rose-400',
      border: 'border-rose-200',
      darkBorder: 'dark:border-rose-800',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
    },
    whatItDoes: [
      'Visual bed occupancy map',
      'Fast vital signs entry at bedside',
      'Medication administration tracking',
    ],
    sampleAction: 'Check vitals & ward beds',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy & Dispensary',
    subtitle: 'Prescription Dispensing & Stock',
    category: 'support',
    simpleDescription: 'Receives prescriptions directly from doctors, dispenses medicines to patients, and keeps track of medicine inventory.',
    icon: Pill,
    route: '/pharmacy',
    badge: 'Dispensary',
    color: {
      bg: 'bg-violet-500/10',
      darkBg: 'dark:bg-violet-500/20',
      text: 'text-violet-700',
      darkText: 'dark:text-violet-400',
      border: 'border-violet-200',
      darkBorder: 'dark:border-violet-800',
      badgeBg: 'bg-violet-50 dark:bg-violet-950/60',
      badgeText: 'text-violet-700 dark:text-violet-300',
    },
    whatItDoes: [
      'Instant alerts when doctor writes Rx',
      '1-click medicine dispensing',
      'Stock counts & expiration tracking',
    ],
    sampleAction: 'Dispense medicines',
  },
  {
    id: 'lab',
    title: 'Diagnostic Laboratory',
    subtitle: 'Pathology, Test Orders & Reports',
    category: 'support',
    simpleDescription: 'Processes doctor test orders, accepts patient samples, enters pathology findings, and generates clear test reports.',
    icon: FlaskConical,
    route: '/lab',
    badge: 'Lab & Diagnostics',
    color: {
      bg: 'bg-amber-500/10',
      darkBg: 'dark:bg-amber-500/20',
      text: 'text-amber-700',
      darkText: 'dark:text-amber-400',
      border: 'border-amber-200',
      darkBorder: 'dark:border-amber-800',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
    },
    whatItDoes: [
      'Real-time lab request queue',
      'Fast entry of lab test results',
      'Instant report release to doctor & patient',
    ],
    sampleAction: 'Review tests & enter results',
  },
  {
    id: 'billing',
    title: 'Billing & Cashier POS',
    subtitle: 'Consolidated Invoices & Receipts',
    category: 'operations',
    simpleDescription: 'Combines doctor fees, bed charges, medicines, and lab tests into a single transparent bill with immediate receipt printing.',
    icon: Receipt,
    route: '/billing',
    badge: 'Billing & POS',
    color: {
      bg: 'bg-teal-500/10',
      darkBg: 'dark:bg-teal-500/20',
      text: 'text-teal-700',
      darkText: 'dark:text-teal-400',
      border: 'border-teal-200',
      darkBorder: 'dark:border-teal-800',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
      badgeText: 'text-teal-700 dark:text-teal-300',
    },
    whatItDoes: [
      'All charges combined into 1 bill',
      'Accepts cash, card, and UPI payments',
      'Print clean itemized patient receipts',
    ],
    sampleAction: 'Collect payment & print bill',
  },
  {
    id: 'admin',
    title: 'Hospital Administration',
    subtitle: 'Staff Roles, Pricing & Settings',
    category: 'operations',
    simpleDescription: 'Gives clinic directors and hospital managers complete control over staff logins, service price lists, and clinic settings.',
    icon: Building2,
    route: '/admin',
    badge: 'Admin & Ops',
    color: {
      bg: 'bg-indigo-500/10',
      darkBg: 'dark:bg-indigo-500/20',
      text: 'text-indigo-700',
      darkText: 'dark:text-indigo-400',
      border: 'border-indigo-200',
      darkBorder: 'dark:border-indigo-800',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
    },
    whatItDoes: [
      'Manage doctors, nurses, and staff access',
      'Set prices for consultations & tests',
      'View hospital-wide audit logs',
    ],
    sampleAction: 'Manage clinic settings',
  },
  {
    id: 'portal',
    title: 'Patient Health Portal',
    subtitle: 'Personal Records, Prescriptions & Reports',
    category: 'clinical',
    simpleDescription: 'A secure, friendly portal where patients can see past visit summaries, check doctor prescriptions, and download lab results.',
    icon: HeartPulse,
    route: '/portal',
    badge: 'Patient Portal',
    color: {
      bg: 'bg-cyan-500/10',
      darkBg: 'dark:bg-cyan-500/20',
      text: 'text-cyan-700',
      darkText: 'dark:text-cyan-400',
      border: 'border-cyan-200',
      darkBorder: 'dark:border-cyan-800',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
    },
    whatItDoes: [
      'Access medical history from home',
      'Read clear medication instructions',
      'Download lab test results anytime',
    ],
    sampleAction: 'View patient records',
  },
  {
    id: 'canteen',
    title: 'Hospital Canteen & Meals',
    subtitle: 'Staff & Patient Dietary Orders',
    category: 'support',
    simpleDescription: 'Manages cafeteria orders, meal plans for admitted patients, and quick dining checkout for hospital staff.',
    icon: Coffee,
    route: '/canteen',
    badge: 'Canteen POS',
    color: {
      bg: 'bg-orange-500/10',
      darkBg: 'dark:bg-orange-500/20',
      text: 'text-orange-700',
      darkText: 'dark:text-orange-400',
      border: 'border-orange-200',
      darkBorder: 'dark:border-orange-800',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/60',
      badgeText: 'text-orange-700 dark:text-orange-300',
    },
    whatItDoes: [
      'Order fresh patient meal trays',
      'Staff cafeteria meal accounts',
      'Dietary restriction tracking',
    ],
    sampleAction: 'Order meals & view menu',
  },
]

const FAQS = [
  {
    q: 'What is Cliniva OS?',
    a: 'Cliniva OS is an all-in-one digital operating system for clinics and hospitals. It replaces paper records, physical tokens, and scattered software by connecting front desk reception, doctors, nurses, pharmacy, laboratory, and billing into one unified platform.',
  },
  {
    q: 'Do staff members need special training to use it?',
    a: 'No. Cliniva OS is designed to be as simple and intuitive as modern phone apps. Clean fonts, large buttons, and clear step-by-step forms mean doctors, nurses, and receptionists can start using it in less than 15 minutes.',
  },
  {
    q: 'How does information flow between departments?',
    a: 'Everything is synchronized in real time. When a doctor issues a prescription, it immediately shows up in the Pharmacy queue. When the lab finishes a blood test, the doctor and patient see the result instantly.',
  },
  {
    q: 'Can patients check their own records?',
    a: 'Yes! Patients have their own dedicated Patient Portal where they can view their visit dates, prescription dosages, download laboratory reports, and see past bills.',
  },
  {
    q: 'Can I test each department right now?',
    a: 'Yes, you can click on any department card on this page to immediately open that workspace and try its features.',
  },
]

export default function SimpleLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical' | 'operations' | 'support'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filteredWorkspaces = useMemo(() => {
    return WORKSPACES.filter((ws) => {
      const matchesCategory = activeCategory === 'all' || ws.category === activeCategory
      const matchesSearch =
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.simpleDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.whatItDoes.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200 overflow-x-hidden">
      
      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Simple System Tagline */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight font-heading">
                  Cliniva OS
                </span>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-200/80 dark:border-teal-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Live
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Simple Hospital & Clinic OS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              What Is It?
            </a>
            <a href="#how-it-works" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              How It Works
            </a>
            <a href="#departments" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              Departments ({WORKSPACES.length})
            </a>
            <a href="#benefits" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              Benefits
            </a>
            <a href="#faq" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/doctor"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02]"
            >
              <span>Doctor Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-teal-600"
              >
                What Is It?
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-teal-600"
              >
                How It Works
              </a>
              <a
                href="#departments"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-teal-600"
              >
                Departments
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-teal-600"
              >
                FAQ
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/front-desk"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Front Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section: Telling About The System Simply ─── */}
      <section className="relative pt-10 sm:pt-20 pb-12 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Simple Friendly Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 text-[11px] sm:text-sm font-semibold mb-4 sm:mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span>Simple, Paperless Hospital Software</span>
        </div>

        {/* Clear, Big, Plain-English Headline */}
        <h1 className="text-[28px] leading-tight sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight sm:leading-[1.18] mb-4 sm:mb-6 font-heading">
          Healthcare management,{' '}
          <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            made simple.
          </span>
        </h1>

        {/* The Simple Explanation */}
        <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-1">
          Cliniva OS connects consultations, patient queues, prescriptions, inpatient beds, lab tests, and billing into one clean, easy-to-use platform.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex flex-col xs:flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-sm xs:max-w-md mx-auto mb-6 sm:mb-10 w-full">
          <a
            href="#departments"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-lg shadow-teal-700/20 transition-all active:scale-[0.98]"
          >
            <Layers className="w-4 h-4" />
            <span>Launch Live Demo</span>
          </a>

          <a
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors active:scale-[0.98]"
          >
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Staff Login</span>
          </a>
        </div>

        {/* Quick 1-Click Role Switcher Bar */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-md max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Tap Any Role to Enter:</span>
            </span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold whitespace-nowrap">
              1-Click Access
            </span>
          </div>

          {/* Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
            {WORKSPACES.slice(0, 8).map((ws) => {
              const Icon = ws.icon
              return (
                <Link
                  key={ws.id}
                  href={ws.route}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-200 group transition-all snap-start flex-shrink-0 w-16 sm:w-auto"
                  title={`Open ${ws.title}`}
                >
                  <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight text-center leading-tight">
                    {ws.title.split(' ')[0]}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Key Simplicity Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 sm:pt-10 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-2 sm:items-start sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 block">No Installation</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Works in any browser</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:items-start sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 block">Pre-loaded Data</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Ready to demo now</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:items-start sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 block">Mobile Friendly</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Works on phones & tablets</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:items-start sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 block">Instant 1-Click</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Access any workspace</span>
            </div>
          </div>
        </div>

      </section>

      {/* ─── Section: What is Cliniva OS? (Simple Comparison) ─── */}
      <section id="about" className="py-10 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2 block">
              Why Cliniva OS?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-heading">
              What Cliniva OS Does For Your Clinic
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Clinics often struggle with paper folders, hard-to-read doctor handwriting, lost lab slips, and billing delays. Here is how Cliniva OS fixes that simply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center gap-2 mb-4 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <X className="w-5 h-5 p-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60" />
                <span>The Traditional Hospital Headache</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Physical paper folders that get lost, damaged, or misplaced.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Handwritten doctor notes and prescriptions that are hard to read.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Patients having to carry lab slips by hand from room to room.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Billing mismatches where medications or procedures get forgotten.</span>
                </li>
              </ul>
            </div>

            {/* The Cliniva OS Way */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <Check className="w-5 h-5 p-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60" />
                <span>With Cliniva OS (Simple & Digital)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>One permanent digital ID (UHID) stores all visit records safely in the cloud.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Clean digital prescriptions sent instantly to the pharmacy screen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Lab results uploaded immediately so doctors can see them without walking anywhere.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Single itemized invoice with zero revenue leakage and clear receipts.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Section: How It Works in 4 Simple Steps ─── */}
      <section id="how-it-works" className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2 block">
            The Patient Journey
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-heading">
            How The System Works In 4 Easy Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
            Every step connects smoothly so the patient has zero delays.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-base flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                Patient Check-In
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Front desk registers the patient in under a minute, generates their unique UHID, and assigns an OPD queue token.
              </p>
            </div>
            <Link
              href="/front-desk"
              className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Front Desk Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-base flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                Vitals & Triage
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Nurses record blood pressure, pulse, oxygen, and temperature. For admitted patients, ward beds are assigned instantly.
              </p>
            </div>
            <Link
              href="/nursing"
              className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Nursing Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-base flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                Doctor Consultation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                The doctor reviews the patient, enters diagnosis notes, and creates digital prescriptions sent straight to pharmacy.
              </p>
            </div>
            <Link
              href="/doctor"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Doctor Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-base flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                Dispense & Single Bill
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Pharmacy hands over the medicines, lab releases reports, and the cashier provides one itemized bill with no confusion.
              </p>
            </div>
            <Link
              href="/billing"
              className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Billing & Pharmacy</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </section>

      {/* ─── Section: Departments / Workspaces Directory ─── */}
      <section id="departments" className="py-10 sm:py-20 bg-white/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2 block">
              Modular Departments
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-heading">
              Explore All Hospital Workspaces
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Each hospital role has a dedicated screen designed specifically for their job. Click any workspace to try it.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
            
            {/* Category Tabs — horizontal scroll on mobile */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 rounded-xl bg-slate-100 dark:bg-slate-800 scrollbar-hide snap-x">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap snap-start ${
                  activeCategory === 'all'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All ({WORKSPACES.length})
              </button>
              <button
                onClick={() => setActiveCategory('clinical')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap snap-start ${
                  activeCategory === 'clinical'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Clinical
              </button>
              <button
                onClick={() => setActiveCategory('operations')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap snap-start ${
                  activeCategory === 'operations'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Operations
              </button>
              <button
                onClick={() => setActiveCategory('support')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap snap-start ${
                  activeCategory === 'support'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Lab & Canteen
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredWorkspaces.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color.bg} ${card.color.darkBg} ${card.color.border} ${card.color.darkBorder} ${card.color.text} ${card.color.darkText}`}>
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${card.color.badgeBg} ${card.color.badgeText} ${card.color.border} ${card.color.darkBorder}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 font-heading group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {card.simpleDescription}
                    </p>

                    {/* What It Does Checkpoints */}
                    <div className="space-y-1.5 mb-4">
                      {card.whatItDoes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Link */}
                  <Link
                    href={card.route}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-700 hover:text-white dark:hover:bg-teal-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Open {card.title.split(' ')[0]} Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No departments match &ldquo;{searchQuery}&rdquo;.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
                className="mt-2 text-xs font-semibold text-teal-700 underline"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ─── Section: Key Benefits ─── */}
      <section id="benefits" className="py-10 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2 block">
            Simplicity & Speed
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-heading">
            Built To Save Time, Not Waste It
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
            Every screen in Cliniva OS is designed to reduce clicks, prevent errors, and let clinical staff focus on patients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 font-heading">
              Lightning Fast
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No slow loading spinners or heavy software to install. Works instantly in any browser on clinic computers, tablets, or phones.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 font-heading">
              Role-Based Privacy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Doctors see clinical charts, pharmacists see medicine queues, and cashiers handle payments. Medical records stay secure and confidential.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 font-heading">
              Bedside Touch Friendly
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Large touch targets and clear cards allow nurses and doctors to log vitals and update records comfortably on ward tablets.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section: Simple FAQ ─── */}
      <section id="faq" className="py-10 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2 block">
              Quick Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Everything you need to know about the system in simple terms.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ─── Ready to Start CTA Banner ─── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-700 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 font-heading">
              Ready to experience Cliniva OS?
            </h2>
            <p className="text-teal-100 text-xs sm:text-base max-w-xl mx-auto mb-5 sm:mb-8 leading-relaxed">
              Open any workspace instantly — no sign-up required.
            </p>
            <div className="flex flex-col xs:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <Link
                href="/front-desk"
                className="w-full xs:w-auto px-5 sm:px-6 py-3 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Start at Front Desk
              </Link>
              <Link
                href="/doctor"
                className="w-full xs:w-auto px-5 sm:px-6 py-3 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 text-white font-semibold text-sm border border-teal-500/40 transition-all active:scale-[0.98]"
              >
                Open Doctor Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Clean Modern Footer ─── */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 sm:py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center sm:flex-row sm:justify-between gap-2 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
              <Activity className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-heading">Cliniva OS</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Hospital & Clinic Management System</span>
          </div>
          <div>
            © {new Date().getFullYear()} Cliniva OS. Built for simplicity & speed.
          </div>
        </div>
      </footer>

    </div>
  )
}
