'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientSideClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import ClinivaLogo from '@/components/ui/ClinivaLogo'

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

const DEMO_ACCOUNTS = [
  {
    role: 'doctor',
    name: 'Dr. Sarah Jenkins, MD',
    title: 'Physician / CMO',
    department: 'Cardiology & OPD',
    email: 'doctor@cliniva.os',
    icon: 'stethoscope',
    badge: 'Clinical',
  },
  {
    role: 'admin',
    name: 'Alexander Sterling',
    title: 'Hospital Director',
    department: 'Governance & Clinical Administration',
    email: 'admin@cliniva.os',
    icon: 'admin_panel_settings',
    badge: 'Multi-Role (Admin + Doctor)',
  },
  {
    role: 'front_desk',
    name: 'Elena Rostova',
    title: 'Receptionist',
    department: 'Patient Check-in & Queue Dispatch',
    email: 'reception@cliniva.os',
    icon: 'badge',
    badge: 'Operations',
  },
  {
    role: 'nurse',
    name: 'Nurse Priya Sharma, RN',
    title: 'Charge Nurse',
    department: 'Inpatient Ward & Bed Telemetry',
    email: 'nurse@cliniva.os',
    icon: 'local_hospital',
    badge: 'Clinical',
  },
  {
    role: 'pharmacist',
    name: 'Marcus Vance, PharmD',
    title: 'Head Pharmacist',
    department: 'Dispensary & Stock Control',
    email: 'pharmacy@cliniva.os',
    icon: 'pill',
    badge: 'Support',
  },
  {
    role: 'lab_tech',
    name: 'David Kalu, MLS',
    title: 'Pathology Specialist',
    department: 'Diagnostic Laboratory',
    email: 'lab@cliniva.os',
    icon: 'science',
    badge: 'Support',
  },
  {
    role: 'cashier',
    name: 'Hannah Brooks',
    title: 'Finance Cashier',
    department: 'Invoicing & Claims POS',
    email: 'billing@cliniva.os',
    icon: 'receipt_long',
    badge: 'Operations',
  },
  {
    role: 'canteen',
    name: 'Chef Marco Rossi',
    title: 'Dietary Manager',
    department: 'Dietary & Cafeteria',
    email: 'canteen@cliniva.os',
    icon: 'restaurant',
    badge: 'Support',
  },
  {
    role: 'patient',
    name: 'Marcus Delacroix',
    title: 'Registered Patient',
    department: 'Personal Health Records',
    email: 'patient@cliniva.os',
    icon: 'person_pin',
    badge: 'Self-Service',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientSideClient()

  const [email, setEmail] = useState('doctor@cliniva.os')
  const [password, setPassword] = useState('demo1234')
  const [trustDevice, setTrustDevice] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)

  const handleSelectDemoAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword('demo1234')
    setAuthError(null)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    const trimmedEmail = email.trim().toLowerCase()

    try {
      // 1. Attempt Supabase Auth with backend credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (!error && data?.session?.user) {
        const meta = data.session.user.user_metadata || {}
        const userRole = meta.role as string | undefined

        // Determine target workspace from the authenticated user's actual profile
        const targetRoute = userRole ? (ROLE_ROUTES[userRole] ?? '/doctor') : '/doctor'
        
        // Sync cookies for client helpers
        if (userRole) {
          document.cookie = `cliniva_auth_user=${userRole}; path=/; max-age=86400; SameSite=Lax`
          document.cookie = `cliniva_demo_role=${userRole}; path=/; max-age=86400; SameSite=Lax`
        }

        window.location.href = targetRoute
        return
      }
    } catch {
      // Offline fallback handling
    }

    // 2. Demo mode verification: Match email against authorized system accounts
    const matchedAccount = DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === trimmedEmail)

    if (matchedAccount) {
      // Determine the assigned role strictly from the matched authorized account
      const assignedRole = matchedAccount.role
      const targetRoute = ROLE_ROUTES[assignedRole] ?? '/doctor'

      document.cookie = `cliniva_auth_user=${assignedRole}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = `cliniva_demo_role=${assignedRole}; path=/; max-age=86400; SameSite=Lax`

      window.location.href = targetRoute
      return
    }

    setAuthLoading(false)
    setAuthError('Unauthorized account. Please enter a valid authorized clinical email or select a verified test account.')
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] dark:bg-[#0D1B26] text-[#172B3A] dark:text-[#E8F0F5] flex flex-col justify-between selection:bg-[#0F8B8D]/20 transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full border-b border-[#E2E8EC] dark:border-white/[0.08] bg-white/95 dark:bg-[#122433]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/?intro=true" className="flex items-center group">
            <ClinivaLogo size="md" badge="Secure Gateway" />
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium hidden sm:inline">
              St. Jude Medical Center
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Sign-In Screen */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] rounded-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30 flex items-center justify-center mx-auto mb-3">
                <ClinivaIcon name="lock" size={20} strokeWidth={1.5} />
              </div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-[#123047] dark:text-white">
                Enterprise Clinical Sign-In
              </h1>
              <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-1">
                Enter your authorized clinical credentials to access your assigned workspace.
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-[#C94A4A]/10 border border-[#C94A4A]/25 text-[#C94A4A] text-xs flex items-center gap-2">
                <ClinivaIcon name="error" size={18} strokeWidth={1.5} className="flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#123047] dark:text-white mb-1">
                  Clinical Email / Staff ID
                </label>
                <div className="relative">
                  <ClinivaIcon name="mail" size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5D6B] dark:text-[#9FB1C0]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@cliniva.os"
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9FA] dark:bg-[#0D1B26] border border-[#E2E8EC] dark:border-white/[0.1] rounded-xl text-xs sm:text-sm text-[#123047] dark:text-white focus:outline-none focus:border-[#0F8B8D] focus:ring-1 focus:ring-[#0F8B8D]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#123047] dark:text-white">
                    Password / Clinical PIN
                  </label>
                </div>
                <div className="relative">
                  <ClinivaIcon name="key" size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5D6B] dark:text-[#9FB1C0]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9FA] dark:bg-[#0D1B26] border border-[#E2E8EC] dark:border-white/[0.1] rounded-xl text-xs sm:text-sm text-[#123047] dark:text-white focus:outline-none focus:border-[#0F8B8D] focus:ring-1 focus:ring-[#0F8B8D]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                  <input
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0F8B8D] focus:ring-[#0F8B8D] border-[#E2E8EC]"
                  />
                  <span>Trust clinical workstation (8h)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-[#0F8B8D] hover:bg-[#0D7A7C] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <ClinivaIcon name="progress_activity" size={18} strokeWidth={1.5} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ClinivaIcon name="login" size={18} strokeWidth={1.5} />
                    <span>Sign In & Open Workspace</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-6 pt-5 border-t border-[#E2E8EC] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#4A5D6B] dark:text-[#9FB1C0] hover:text-[#123047] dark:hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <ClinivaIcon name="badge" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
                  <span>Demo Accounts for Testing</span>
                </span>
                <ClinivaIcon name={showDemoCredentials ? 'expand_less' : 'expand_more'} size={18} strokeWidth={1.5} />
              </button>

              {showDemoCredentials && (
                <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto pr-1 smooth-touch-scroll text-left">
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mb-2">
                    Click any authorized account to fill credentials:
                  </p>
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = email.toLowerCase() === acc.email.toLowerCase()
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleSelectDemoAccount(acc)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors border ${
                          isSelected
                            ? 'bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border-[#0F8B8D]/40 text-[#123047] dark:text-[#28B5B7]'
                            : 'bg-[#F7F9FA] dark:bg-white/[0.03] border-[#E2E8EC] dark:border-white/[0.06] text-[#123047] dark:text-[#E8F0F5] hover:bg-[#F0F4F7] dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ClinivaIcon name={acc.icon} size={18} strokeWidth={1.5} className="flex-shrink-0 text-[#0F8B8D]" />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#123047] dark:text-white truncate">{acc.name}</p>
                            <p className="text-[11px] text-[#4A5D6B] dark:text-[#9FB1C0] font-medium truncate">{acc.email}</p>
                          </div>
                        </div>
                        {acc.badge && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E2E8EC]/80 dark:bg-white/10 text-[#4A5D6B] dark:text-[#9FB1C0] flex-shrink-0">
                            {acc.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8EC] dark:border-white/[0.08] py-4 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
          <span className="flex items-center gap-1.5 justify-center">
            <ClinivaIcon name="verified_user" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
            <span>Role-Based Access Control • HIPAA & SOC-2 Certified</span>
          </span>
          <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0]">
            CLINIVA OS v2.4 Enterprise
          </span>
        </div>
      </footer>
    </div>
  )
}
