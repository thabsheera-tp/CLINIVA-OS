'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  ArrowRight,
  ChevronRight,
  Info,
  X,
  ShieldCheck,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ClinivaLogo from '@/components/ui/ClinivaLogo'

const INTRO_FLAG_KEY = 'cliniva_intro_seen'

const FEATURES = [
  {
    title: 'Patient Management',
    desc: 'Registration, UHID profiles, and queue dispatch.',
    icon: Users,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
  {
    title: 'Doctor Consultation',
    desc: 'SOAP clinical notes, diagnosis, and e-prescriptions.',
    icon: Stethoscope,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
  {
    title: 'Laboratory',
    desc: 'Pathology orders, specimen status, and verified results.',
    icon: FlaskConical,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
  {
    title: 'Pharmacy',
    desc: 'Prescription dispensing, batch tracking, and inventory.',
    icon: Pill,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
  {
    title: 'Nursing',
    desc: 'Ward bed roster, vital signs telemetry, and bedside care.',
    icon: BedDouble,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
  {
    title: 'Billing',
    desc: 'Consolidated invoices, cashier POS, and instant receipts.',
    icon: Receipt,
    iconColor: 'text-[#0F8B8D] dark:text-[#28B5B7]',
    iconBg: 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/15 border-[#0F8B8D]/25',
  },
]

const WORKFLOW_STEPS = [
  'Registration',
  'Consultation',
  'Lab / Pharmacy',
  'Billing',
  'Patient Care',
]

function WelcomeView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceIntro = searchParams.get('intro') === 'true'

  const [isReturningUser, setIsReturningUser] = useState(false)
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false)

  useEffect(() => {
    // Check local storage for returning visitors
    try {
      if (typeof window !== 'undefined') {
        const hasSeenIntro = localStorage.getItem(INTRO_FLAG_KEY) === 'true'
        if (hasSeenIntro && !forceIntro) {
          setIsReturningUser(true)
          router.replace('/login')
        }
      }
    } catch {
      // LocalStorage access may fail in certain restricted contexts
    }
  }, [forceIntro, router])

  const handleProceedToLogin = () => {
    try {
      localStorage.setItem(INTRO_FLAG_KEY, 'true')
    } catch {
      // LocalStorage access may fail in strict private modes
    }
    router.push('/login')
  }

  // Smooth redirect state for returning visitors
  if (isReturningUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] dark:bg-[#0D1B26]">
        <div className="flex items-center gap-2.5 text-xs text-[#60727F] dark:text-[#92A6B5] font-medium">
          <Activity className="w-4 h-4 text-[#0F8B8D] animate-pulse" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F9FA] dark:bg-[#0D1B26] text-[#172B3A] dark:text-[#E8F0F5] font-sans transition-colors antialiased">
      {/* ─── Compact Top Bar ─── */}
      <header className="w-full border-b border-[#E2E8EC] dark:border-white/[0.08] bg-white/95 dark:bg-[#122433]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <ClinivaLogo size="md" badge="Hospital OS" subtitle="Integrated Hospital Management System" />

          {/* Action Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#60727F] dark:text-[#92A6B5] hover:text-[#123047] dark:hover:text-white hover:bg-[#F0F4F7] dark:hover:bg-white/5 transition-colors"
              title="How CLINIVA Works"
            >
              <Info className="w-3.5 h-3.5 text-[#0F8B8D] dark:text-[#28B5B7]" />
              <span className="hidden sm:inline">How CLINIVA Works</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Content: Centered, Focused Welcome ─── */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto w-full text-center">
        {/* Main Heading & Short Tagline */}
        <div className="space-y-2 max-w-2xl mx-auto">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#123047] dark:text-white leading-tight">
            Connected Care. Simplified Operations.
          </h1>
          <p className="text-xs sm:text-sm text-[#60727F] dark:text-[#92A6B5] leading-relaxed max-w-lg mx-auto">
            One secure platform connecting patients, healthcare teams, and hospital operations.
          </p>
        </div>

        {/* ─── Subtle Connected Workflow Visual ─── */}
        <div className="w-full max-w-2xl my-6">
          <div className="px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] flex items-center justify-center flex-wrap gap-1 sm:gap-2 text-[11px] sm:text-xs font-medium text-[#172B3A] dark:text-[#E8F0F5]">
            {WORKFLOW_STEPS.map((step, index) => (
              <React.Fragment key={step}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F9FA] dark:bg-white/[0.04] border border-[#E2E8EC] dark:border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B8D]" />
                  <span>{step}</span>
                </span>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#A0B0BC] flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 6 Small Feature Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-2xl text-left my-2">
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] hover:border-[#D5DFE6] dark:hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border flex-shrink-0 ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-heading font-semibold text-xs sm:text-[13px] text-[#123047] dark:text-white tracking-tight leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[11px] text-[#7A8B99] dark:text-[#8297A6] font-normal leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* ─── CTA Controls ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mt-6 sm:mt-8 w-full">
          <button
            onClick={handleProceedToLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0D7A7C] active:scale-[0.98] text-white font-medium text-xs sm:text-sm transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleProceedToLogin}
            className="text-xs text-[#60727F] dark:text-[#92A6B5] hover:text-[#123047] dark:hover:text-white font-medium py-1.5 px-3 transition-colors inline-flex items-center gap-1"
          >
            <span>Skip Introduction → Login</span>
          </button>
        </div>
      </main>

      {/* ─── Very Small Footer ─── */}
      <footer className="border-t border-[#E2E8EC] dark:border-white/[0.08] py-4 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-[11px] text-[#60727F] dark:text-[#92A6B5]">
          <span className="flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F8B8D]" />
            <span>Secure • Role-Based • Connected Healthcare</span>
          </span>
          <span className="text-[10px] text-[#A0B0BC]">
            CLINIVA OS v2.4
          </span>
        </div>
      </footer>

      {/* ─── Compact "How CLINIVA Works" Modal ─── */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] rounded-2xl max-w-sm w-full p-5 shadow-xl relative text-left"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-heading font-bold text-sm text-[#123047] dark:text-white">
                  How CLINIVA Works
                </h4>
              </div>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="p-1 rounded-md text-[#60727F] hover:text-[#172B3A] dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#60727F] dark:text-[#92A6B5]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A] dark:text-white">
                    Login with your authorized account
                  </p>
                  <p className="text-[11px] text-[#60727F] dark:text-[#92A6B5] mt-0.5">
                    Select your hospital role or sign in with your clinic credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A] dark:text-white">
                    Automatic workspace launch
                  </p>
                  <p className="text-[11px] text-[#60727F] dark:text-[#92A6B5] mt-0.5">
                    CLINIVA automatically opens your role-based workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-[#172B3A] dark:text-white">
                    Role-assigned modules
                  </p>
                  <p className="text-[11px] text-[#60727F] dark:text-[#92A6B5] mt-0.5">
                    Use only the clinical and operational modules assigned to your role.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E2E8EC] dark:border-white/[0.06] flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0F8B8D] text-white text-xs font-semibold hover:bg-[#0D7A7C] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] dark:bg-[#0D1B26]">
          <div className="flex items-center gap-2.5 text-xs text-[#60727F] dark:text-[#92A6B5] font-medium">
            <Activity className="w-4 h-4 text-[#0F8B8D] animate-pulse" />
            <span>Loading Cliniva OS...</span>
          </div>
        </div>
      }
    >
      <WelcomeView />
    </Suspense>
  )
}
