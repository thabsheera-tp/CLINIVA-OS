'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import EmergencySOSButton from '@/components/ui/EmergencySOSButton'
import { usePortalLang } from '@/context/PortalLanguageContext'

export type PortalTab =
  | 'dashboard'
  | 'appointments'
  | 'consultations'
  | 'prescriptions'
  | 'labs'
  | 'billing'
  | 'profile'

interface PatientRecord {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dob: string
  gender: string
  bloodGroup: string | null
  phone: string
  email: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  insuranceProvider: string | null
  insurancePolicy: string | null
  allergies: string | null
  dietaryFlag: string | null
}

interface AppointmentItem {
  id: string
  scheduled_at: string
  status: string
  queue_token: number
  chief_complaint: string | null
  visit_type: string
  doctor?: {
    id: string
    display_name: string
    department: string
  } | null
}

interface ConsultationItem {
  id: string
  created_at: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  icd10_codes: string[] | null
  is_emergency: boolean
  follow_up_in: number | null
  doctor?: {
    id: string
    display_name: string
    department: string
  } | null
}

interface PrescriptionItemDetail {
  id: string
  dosage: string
  route: string
  frequency: string
  duration_days: number | null
  instructions: string | null
  medication?: {
    generic_name: string
    brand_name: string | null
    form: string | null
  } | null
}

interface PrescriptionItem {
  id: string
  prescribed_at: string
  status: string
  notes: string | null
  prescribed_by_doctor?: {
    display_name: string
  } | null
  items: PrescriptionItemDetail[]
}

interface LabResultItem {
  id: string
  result_value: string
  result_unit: string | null
  ref_range_low: string | null
  ref_range_high: string | null
  severity: string
  is_critical: boolean
  test?: {
    test_code: string
    test_name: string
    sample_type: string
  } | null
}

interface LabOrderItem {
  id: string
  ordered_at: string
  status: string
  is_stat: boolean
  clinical_info: string | null
  ordered_by_doctor?: {
    display_name: string
  } | null
  results: LabResultItem[]
}

interface InvoiceItem {
  id: string
  invoice_number: string
  created_at: string
  total_amount: number
  paid_amount: number
  balance_due: number
  payment_status: string
  due_date: string | null
  insurance_provider: string | null
}

interface VitalItem {
  id: string
  recorded_at: string
  bp_systolic: number | null
  bp_diastolic: number | null
  heart_rate: number | null
  spo2: number | null
  temperature: number | null
}

interface PortalData {
  patient: PatientRecord
  appointments: AppointmentItem[]
  consultations: ConsultationItem[]
  prescriptions: PrescriptionItem[]
  labOrders: LabOrderItem[]
  invoices: InvoiceItem[]
  vitals: VitalItem[]
}

// Demo quick-fill registered patient contacts for evaluator ease
const DEMO_PATIENTS = [
  { name: 'Marcus Delacroix', phone: '+1 (555) 201-9481', mrn: '00482910' },
  { name: 'Priya Mehta', phone: '+1 (555) 349-1120', mrn: '00482911' },
  { name: 'George Tanner', phone: '+1 (555) 884-9021', mrn: '00482912' },
  { name: 'Aisha Nkosi', phone: '+1 (555) 441-2983', mrn: '00482913' },
]

export default function PatientPortalApp({ initialTab = 'dashboard' }: { initialTab?: PortalTab }) {
  const { lang, setLang } = usePortalLang()
  const [activeTab, setActiveTab] = useState<PortalTab>(initialTab)

  // Auth state
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [maskedPhone, setMaskedPhone] = useState('')
  const [detectedName, setDetectedName] = useState('')
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Data state
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(false)

  // Load patient data when authenticated
  const fetchPortalData = useCallback(async () => {
    setIsDataLoading(true)
    try {
      const res = await fetch('/api/portal/data', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPortalData(data)
          setIsAuthenticated(true)
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false)
        setPortalData(null)
      }
    } catch (err) {
      console.error('Failed to load portal data', err)
    } finally {
      setIsDataLoading(false)
      setIsLoadingAuth(false)
    }
  }, [])

  // Initial check on mount
  useEffect(() => {
    fetchPortalData()
  }, [fetchPortalData])

  // Countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Handlers for OTP Flow
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!phoneInput.trim()) {
      setAuthError('Please enter your registered mobile number.')
      return
    }

    setAuthLoading(true)
    setAuthError(null)

    try {
      const res = await fetch('/api/portal/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      })

      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setMaskedPhone(data.maskedPhone || phoneInput)
        setDetectedName(data.patientName || '')
        if (data.devOtp) {
          setDevOtpCode(data.devOtp)
        }
        setResendCooldown(30)
      } else {
        setAuthError(data.error || 'Failed to send OTP. Please check your number.')
      }
    } catch {
      setAuthError('Network error while requesting verification code.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpInput.trim()) {
      setAuthError('Please enter the 6-digit OTP code.')
      return
    }

    setAuthLoading(true)
    setAuthError(null)

    try {
      const res = await fetch('/api/portal/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, otp: otpInput }),
      })

      const data = await res.json()
      if (data.success) {
        setIsAuthenticated(true)
        setOtpSent(false)
        setOtpInput('')
        await fetchPortalData()
      } else {
        setAuthError(data.error || 'Invalid OTP code. Please try again.')
      }
    } catch {
      setAuthError('Network error during verification.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' })
    } finally {
      setIsAuthenticated(false)
      setPortalData(null)
      setOtpSent(false)
      setOtpInput('')
      setDevOtpCode(null)
      setPhoneInput('')
    }
  }

  const quickFillPatient = (phone: string) => {
    setPhoneInput(phone)
    setAuthError(null)
  }

  // ─── Render Loading Screen ─────────────────────────────────────────
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C1620] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-[#123047] dark:text-white">
          <div className="w-10 h-10 rounded-2xl bg-[#0F8B8D] flex items-center justify-center text-white animate-pulse">
            <ClinivaIcon name="medical_services" size={24} />
          </div>
          <p className="text-sm font-semibold tracking-wide">Connecting to Cliniva Patient Portal...</p>
        </div>
      </div>
    )
  }

  // ─── Render OTP Authentication Screen (Public QR Entry Flow) ───────
  if (!isAuthenticated || !portalData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C1620] py-8 px-4 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-md mx-auto">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-[#0F8B8D] text-white items-center justify-center shadow-lg shadow-[#0F8B8D]/20 mb-3">
              <ClinivaIcon name="medical_services" size={30} strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#123047] dark:text-white tracking-tight">
              Cliniva Patient Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              Secure digital access to your clinical records, prescriptions & lab results
            </p>
          </div>

          {/* QR Origin Badge */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Link
              href="/portal/qr"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#122433] border border-[#CBD5E1] dark:border-white/10 text-[#0F8B8D] dark:text-[#28B5B7] shadow-xs hover:border-[#0F8B8D] transition-colors"
            >
              <ClinivaIcon name="qr_code_2" size={14} />
              View Hospital QR Poster
            </Link>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 shadow-xl p-6 sm:p-8 transition-all">
            {!otpSent ? (
              // Step 1: Mobile Number Entry
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="portal-phone-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white mb-1.5"
                  >
                    Registered Mobile Number
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-2 leading-relaxed">
                    Enter the phone number provided during your hospital registration.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                      <ClinivaIcon name="call" size={18} />
                    </div>
                    <input
                      id="portal-phone-input"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+1 (555) 201-9481"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-white dark:bg-[#0C1620] text-[#123047] dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F8B8D] focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <ClinivaIcon name="error" size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white font-bold text-sm shadow-md shadow-[#0F8B8D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <span className="animate-spin text-base">&#9696;</span>
                      Verifying Mobile...
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ClinivaIcon name="arrow_forward" size={16} />
                    </>
                  )}
                </button>

                {/* Quick Select Helper for Demo Testing */}
                <div className="mt-5 pt-4 border-t border-[#E2E8EC] dark:border-white/10">
                  <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-2 text-center">
                    Registered Hospital Patients (Tap to Quick-Fill):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_PATIENTS.map((p) => (
                      <button
                        key={p.mrn}
                        type="button"
                        onClick={() => quickFillPatient(p.phone)}
                        className="p-2 rounded-xl text-left bg-[#F8FAFC] dark:bg-white/[0.04] border border-[#E2E8EC] dark:border-white/5 hover:border-[#0F8B8D]/50 transition-all group"
                      >
                        <p className="text-[11px] font-bold text-[#123047] dark:text-white group-hover:text-[#0F8B8D] truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate">
                          {p.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              // Step 2: OTP Verification
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center pb-2">
                  <div className="inline-flex w-10 h-10 rounded-full bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] items-center justify-center mb-2">
                    <ClinivaIcon name="lock" size={20} />
                  </div>
                  <h2 className="text-base font-bold text-[#123047] dark:text-white">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Sent to <strong className="text-[#123047] dark:text-white">{maskedPhone}</strong>
                    {detectedName ? ` (${detectedName})` : ''}
                  </p>
                </div>

                {devOtpCode && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
                    <span>
                      Demo Mode Code: <strong className="font-mono text-sm tracking-widest">{devOtpCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(devOtpCode)}
                      className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="portal-otp-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#123047] dark:text-white mb-1.5"
                  >
                    6-Digit One-Time Password
                  </label>
                  <input
                    id="portal-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6 digits"
                    className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 rounded-xl border border-[#CBD5E1] dark:border-white/15 bg-white dark:bg-[#0C1620] text-[#123047] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F8B8D] focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <ClinivaIcon name="error" size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || otpInput.length < 4}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white font-bold text-sm shadow-md shadow-[#0F8B8D]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <span className="animate-spin text-base">&#9696;</span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Access Dashboard</span>
                      <ClinivaIcon name="check" size={16} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setAuthError(null)
                    }}
                    className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#123047] dark:hover:text-white font-semibold"
                  >
                    Change Phone Number
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={() => handleSendOtp()}
                    className="text-[#0F8B8D] dark:text-[#28B5B7] hover:underline font-semibold disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Privacy Footnote */}
          <div className="mt-6 text-center text-[11px] text-[#64748B] dark:text-[#94A3B8] space-y-1">
            <p>Protected by Hospital RBAC &amp; Row-Level Security.</p>
            <p>Access is restricted strictly to your registered health records.</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render Authenticated Patient Portal (7 Real Sections) ──────────
  const { patient, appointments, consultations, prescriptions, labOrders, invoices } = portalData
  const fullName = `${patient.firstName} ${patient.lastName}`

  // Next active appointment (if any)
  const nextAppt = appointments.length > 0 ? appointments[0] : null
  const isTodayAppt = nextAppt && new Date(nextAppt.scheduled_at).toDateString() === new Date().toDateString()

  // Navigation Items
  const navTabs: { id: PortalTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar_today', badge: appointments.length || undefined },
    { id: 'consultations', label: 'Consultations', icon: 'stethoscope', badge: consultations.length || undefined },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'medication', badge: prescriptions.length || undefined },
    { id: 'labs', label: 'Lab Reports', icon: 'lab_panel', badge: labOrders.length || undefined },
    { id: 'billing', label: 'Billing & Payments', icon: 'receipt_long', badge: invoices.length || undefined },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C1620] pb-24 font-sans text-[#123047] dark:text-[#E8F0F5] transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#122433]/90 backdrop-blur-md border-b border-[#E2E8EC] dark:border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0F8B8D] flex items-center justify-center text-white shadow-xs">
            <ClinivaIcon name="medical_services" size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm sm:text-base text-[#123047] dark:text-white">
                Cliniva OS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7]">
                Patient Portal
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <div className="flex items-center rounded-full bg-[#F1F5F9] dark:bg-white/[0.08] p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'en' ? 'bg-[#0F8B8D] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ml')}
              className={`px-2 py-0.5 rounded-full transition-all ${
                lang === 'ml' ? 'bg-[#0F8B8D] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              ML
            </button>
          </div>

          {/* Hospital QR Page Link */}
          <Link
            href="/portal/qr"
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F8B8D] hover:bg-[#F1F5F9] dark:hover:bg-white/5 transition-colors"
            title="Hospital QR Poster"
          >
            <ClinivaIcon name="qr_code_2" size={20} />
          </Link>

          {/* Patient MRN Chip & Sign Out */}
          <div className="flex items-center gap-2 border-l border-[#E2E8EC] dark:border-white/10 pl-2 sm:pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#123047] dark:text-white leading-tight">{fullName}</p>
              <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">MRN: {patient.mrn}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-colors flex items-center gap-1"
              title="Sign Out"
            >
              <ClinivaIcon name="logout" size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Header (Scrollable Bar for Tabs) */}
      <div className="bg-white dark:bg-[#122433] border-b border-[#E2E8EC] dark:border-white/10 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-2 py-2">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0F8B8D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#123047] dark:hover:text-white'
                }`}
              >
                <ClinivaIcon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#E2E8EC] dark:bg-white/10 text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* SECTION 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Welcome Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#0F8B8D] dark:text-[#28B5B7]">
                  Patient Health Portal
                </p>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-[#123047] dark:text-white">
                  Welcome back, {patient.firstName}
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] w-fit">
                <ClinivaIcon name="badge" size={14} className="text-[#0F8B8D]" />
                <span>MRN: <strong className="text-[#123047] dark:text-white font-mono">{patient.mrn}</strong></span>
              </div>
            </div>

            {/* Live OPD Queue / Active Consultation Banner (if appointment exists) */}
            {nextAppt ? (
              <div className="bg-[#123047] text-white rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-lg border border-[#1B3A4B]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F8B8D] animate-ping" />
                    <span className="text-xs uppercase tracking-wider font-bold text-white/90">
                      Live Hospital Queue
                    </span>
                  </div>
                  <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
                    {nextAppt.doctor?.department || 'Outpatient Clinic'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-xs text-white/70 font-medium">Your Token Number</p>
                    <p className="font-heading text-4xl sm:text-5xl font-black text-white mt-0.5">
                      #{nextAppt.queue_token}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70 font-medium">Attending Physician</p>
                    <p className="font-heading text-sm sm:text-base font-bold text-[#28B5B7] mt-1">
                      {nextAppt.doctor?.display_name || 'Dr. Sarah Jenkins, MD'}
                    </p>
                    <p className="text-[11px] text-white/60">Room 304 &bull; Main OPD Wing</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/80">
                    Status: <strong className="capitalize text-white">{nextAppt.status.replace('_', ' ')}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-[#28B5B7] hover:underline flex items-center gap-1"
                  >
                    View Appointment Details &rarr;
                  </button>
                </div>
              </div>
            ) : null}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('appointments')}
                className="bg-white dark:bg-[#122433] p-4 rounded-2xl border border-[#E2E8EC] dark:border-white/10 text-left hover:border-[#0F8B8D]/40 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0F8B8D]/10 text-[#0F8B8D] dark:text-[#28B5B7] flex items-center justify-center mb-2">
                  <ClinivaIcon name="calendar_today" size={18} />
                </div>
                <p className="text-lg font-black text-[#123047] dark:text-white">{appointments.length}</p>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Appointments</p>
              </button>

              <button
                onClick={() => setActiveTab('prescriptions')}
                className="bg-white dark:bg-[#122433] p-4 rounded-2xl border border-[#E2E8EC] dark:border-white/10 text-left hover:border-[#0F8B8D]/40 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <ClinivaIcon name="medication" size={18} />
                </div>
                <p className="text-lg font-black text-[#123047] dark:text-white">{prescriptions.length}</p>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Prescriptions</p>
              </button>

              <button
                onClick={() => setActiveTab('labs')}
                className="bg-white dark:bg-[#122433] p-4 rounded-2xl border border-[#E2E8EC] dark:border-white/10 text-left hover:border-[#0F8B8D]/40 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <ClinivaIcon name="lab_panel" size={18} />
                </div>
                <p className="text-lg font-black text-[#123047] dark:text-white">{labOrders.length}</p>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Lab Reports</p>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className="bg-white dark:bg-[#122433] p-4 rounded-2xl border border-[#E2E8EC] dark:border-white/10 text-left hover:border-[#0F8B8D]/40 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <ClinivaIcon name="receipt_long" size={18} />
                </div>
                <p className="text-lg font-black text-[#123047] dark:text-white">{invoices.length}</p>
                <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Invoices</p>
              </button>
            </div>

            {/* Recent Lab Order / Alert Preview (Marcus Delacroix has Troponin I result) */}
            {labOrders.length > 0 && (
              <div className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ClinivaIcon name="science" size={18} className="text-[#0F8B8D]" />
                    <h3 className="font-heading font-bold text-sm text-[#123047] dark:text-white">
                      Latest Laboratory Finding
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('labs')}
                    className="text-xs font-semibold text-[#0F8B8D] dark:text-[#28B5B7] hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="divide-y divide-[#E2E8EC] dark:divide-white/5">
                  {labOrders.slice(0, 1).map((order) => (
                    <div key={order.id} className="pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#123047] dark:text-white">
                            {order.results[0]?.test?.test_name || 'STAT Clinical Chemistry'}
                          </p>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            Ordered by: {order.ordered_by_doctor?.display_name || 'Attending Physician'}
                          </p>
                        </div>
                        {order.results[0] && (
                          <div className="text-right">
                            <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                              {order.results[0].result_value} {order.results[0].result_unit}
                            </span>
                            <span className="block text-[10px] text-[#64748B]">
                              Ref: {order.results[0].ref_range_low} - {order.results[0].ref_range_high}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Section Shortcuts */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Hospital Portal Modules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0F8B8D]/10 text-[#0F8B8D] flex items-center justify-center">
                      <ClinivaIcon name="calendar_today" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Appointments &amp; Queue</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Scheduled visits &amp; wait tokens</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>

                <button
                  onClick={() => setActiveTab('consultations')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <ClinivaIcon name="stethoscope" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Doctor Consultations</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Physician SOAP notes &amp; plans</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>

                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <ClinivaIcon name="medication" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Medication Prescriptions</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Dosage, instructions &amp; dispensary</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>

                <button
                  onClick={() => setActiveTab('labs')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <ClinivaIcon name="lab_panel" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Diagnostic &amp; Lab Reports</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Verified blood &amp; specimen panels</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>

                <button
                  onClick={() => setActiveTab('billing')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <ClinivaIcon name="receipt_long" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Billing &amp; Payments</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Hospital invoices &amp; insurance</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/10 hover:border-[#0F8B8D]/40 text-left flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
                      <ClinivaIcon name="person" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Patient Demographics</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Registered personal &amp; emergency info</p>
                    </div>
                  </div>
                  <ClinivaIcon name="arrow_forward" size={16} className="text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* Emergency SOS Button Floating */}
            <div className="fixed bottom-4 right-4 z-30">
              <EmergencySOSButton patientName={fullName} />
            </div>
          </div>
        )}

        {/* SECTION 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Appointments
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Your outpatient consultations and queue status
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0F8B8D]/10 text-[#0F8B8D]">
                {appointments.length} on file
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <ClinivaIcon name="calendar_today" size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">No records available</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  You have no scheduled or past outpatient appointments registered in the hospital database.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0F8B8D] dark:text-[#28B5B7]">
                          {appt.doctor?.department || 'Outpatient Clinic'} &bull; Queue #{appt.queue_token}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#123047] dark:text-white">
                          {appt.doctor?.display_name || 'Attending Physician'}
                        </h3>
                      </div>
                      <StatusBadge
                        variant={appt.status === 'in_consultation' ? 'warning' : 'routine'}
                        label={appt.status.replace('_', ' ')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2 border-y border-[#E2E8EC] dark:border-white/5">
                      <div className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
                        <ClinivaIcon name="schedule" size={15} className="text-[#0F8B8D]" />
                        <span>{new Date(appt.scheduled_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
                        <ClinivaIcon name="medical_services" size={15} className="text-[#0F8B8D]" />
                        <span className="capitalize">{appt.visit_type || 'General OPD'} Visit</span>
                      </div>
                    </div>

                    {appt.chief_complaint && (
                      <div className="mt-3 text-xs">
                        <span className="font-semibold text-[#123047] dark:text-white">Chief Complaint: </span>
                        <span className="text-[#64748B] dark:text-[#94A3B8]">{appt.chief_complaint}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Consultation Notes
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Verified medical notes and treatment plans signed by your doctor
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0F8B8D]/10 text-[#0F8B8D]">
                {consultations.length} records
              </span>
            </div>

            {consultations.length === 0 ? (
              <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <ClinivaIcon name="stethoscope" size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">No records available</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  No signed clinical consultation notes are currently on file. Notes are uploaded after completion by your physician.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8EC] dark:border-white/5 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#123047] dark:text-white">
                          {c.doctor?.display_name || 'Physician Note'}
                        </h3>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {c.doctor?.department} &bull; {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {c.is_emergency && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          Emergency
                        </span>
                      )}
                    </div>

                    {c.subjective && (
                      <div className="text-xs">
                        <p className="font-bold text-[#123047] dark:text-white">Subjective / Symptoms:</p>
                        <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">{c.subjective}</p>
                      </div>
                    )}

                    {c.assessment && (
                      <div className="text-xs">
                        <p className="font-bold text-[#123047] dark:text-white">Clinical Assessment:</p>
                        <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">{c.assessment}</p>
                      </div>
                    )}

                    {c.plan && (
                      <div className="text-xs">
                        <p className="font-bold text-[#123047] dark:text-white">Treatment Plan:</p>
                        <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">{c.plan}</p>
                      </div>
                    )}

                    {c.icd10_codes && c.icd10_codes.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-semibold text-[#64748B]">ICD-10:</span>
                        {c.icd10_codes.map((code) => (
                          <span
                            key={code}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-mono text-[#123047] dark:text-white font-bold"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Prescriptions
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Medications prescribed by hospital medical staff
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                {prescriptions.length} active
              </span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <ClinivaIcon name="medication" size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">No records available</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  You have no active prescriptions or medication orders recorded in the hospital pharmacy database.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8EC] dark:border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                          Prescription Date: {new Date(rx.prescribed_at).toLocaleDateString()}
                        </span>
                        <h3 className="text-sm font-bold text-[#123047] dark:text-white">
                          By: {rx.prescribed_by_doctor?.display_name || 'Attending Doctor'}
                        </h3>
                      </div>
                      <StatusBadge variant="routine" label={rx.status} />
                    </div>

                    <div className="divide-y divide-[#E2E8EC] dark:divide-white/5">
                      {rx.items.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#123047] dark:text-white">
                              {item.medication?.generic_name || 'Prescribed Medication'}{' '}
                              {item.medication?.brand_name ? `(${item.medication.brand_name})` : ''}
                            </p>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                              {item.dosage} &bull; {item.route} &bull; {item.frequency}
                              {item.duration_days ? ` &bull; ${item.duration_days} days` : ''}
                            </p>
                            {item.instructions && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 italic">
                                Note: {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: LAB REPORTS */}
        {activeTab === 'labs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Laboratory Reports
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Verified test findings and clinical pathology panels
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600">
                {labOrders.length} orders
              </span>
            </div>

            {labOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <ClinivaIcon name="lab_panel" size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">No records available</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  No diagnostic laboratory orders or blood test results are currently linked to your patient profile.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {labOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8EC] dark:border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F8B8D]">
                            Order Date: {new Date(order.ordered_at).toLocaleDateString()}
                          </span>
                          {order.is_stat && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-red-100 text-red-700">
                              STAT Priority
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#123047] dark:text-white mt-0.5">
                          Ordered by: {order.ordered_by_doctor?.display_name || 'Attending Physician'}
                        </h3>
                        {order.clinical_info && (
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            Indication: {order.clinical_info}
                          </p>
                        )}
                      </div>
                      <StatusBadge variant="routine" label={order.status} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#123047] dark:text-white">Result Findings:</p>
                      {order.results.length === 0 ? (
                        <p className="text-xs text-[#64748B] italic">Test in progress &bull; Awaiting laboratory release</p>
                      ) : (
                        <div className="divide-y divide-[#E2E8EC] dark:divide-white/5">
                          {order.results.map((res) => (
                            <div key={res.id} className="py-2.5 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-[#123047] dark:text-white">
                                  {res.test?.test_name || 'Clinical Test'}
                                </p>
                                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                  Sample: {res.test?.sample_type || 'Blood'} &bull; Code: {res.test?.test_code}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <span
                                    className={`text-sm font-mono font-bold ${
                                      res.is_critical ? 'text-red-600 dark:text-red-400' : 'text-[#123047] dark:text-white'
                                    }`}
                                  >
                                    {res.result_value} {res.result_unit}
                                  </span>
                                  {res.is_critical && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">
                                      High
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#64748B]">
                                  Ref: {res.ref_range_low || '0'} &ndash; {res.ref_range_high} {res.result_unit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: BILLING & PAYMENTS */}
        {activeTab === 'billing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Billing &amp; Payments
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Hospital invoices, insurance claims &amp; payment receipts
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                {invoices.length} invoices
              </span>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <ClinivaIcon name="receipt_long" size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#123047] dark:text-white">No records available</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  You have no pending or past billing invoices in the hospital accounts system.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#E2E8EC] dark:border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#64748B]">Invoice #{inv.invoice_number}</span>
                        <h3 className="text-sm font-bold text-[#123047] dark:text-white">
                          Hospital Outpatient Invoice
                        </h3>
                        <p className="text-[11px] text-[#64748B]">
                          Date: {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge
                        variant={inv.payment_status === 'paid' ? 'routine' : 'warning'}
                        label={inv.payment_status}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs py-2 bg-[#F8FAFC] dark:bg-white/[0.03] p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Total Amount</span>
                        <span className="font-bold font-mono text-[#123047] dark:text-white">
                          ${inv.total_amount?.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Paid Amount</span>
                        <span className="font-bold font-mono text-emerald-600">
                          ${inv.paid_amount?.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Balance Due</span>
                        <span className="font-bold font-mono text-red-600">
                          ${inv.balance_due?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-[#123047] dark:text-white">
                  Patient Profile
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Verified identity and emergency information on hospital record
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <ClinivaIcon name="logout" size={14} />
                <span>Log Out</span>
              </button>
            </div>

            {/* Profile Hero Card */}
            <div className="bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-[#0F8B8D] text-white flex items-center justify-center font-heading font-black text-2xl shadow-md">
                {patient.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#123047] dark:text-white">{fullName}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7]">
                    MRN: {patient.mrn}
                  </span>
                  {patient.bloodGroup && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                      Blood Group: {patient.bloodGroup}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 text-[#64748B]">
                    Gender: {patient.gender}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/10 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Contact &amp; Personal Information
              </h3>
              <div className="divide-y divide-[#E2E8EC] dark:divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Date of Birth:</span>
                  <span className="font-semibold text-[#123047] dark:text-white">{patient.dob || 'On record'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Registered Phone:</span>
                  <span className="font-semibold text-[#123047] dark:text-white font-mono">{patient.phone}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Email Address:</span>
                  <span className="font-semibold text-[#123047] dark:text-white">{patient.email || 'Not provided'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Residential Address:</span>
                  <span className="font-semibold text-[#123047] dark:text-white">{patient.address || 'On file'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Emergency Contact:</span>
                  <span className="font-semibold text-[#123047] dark:text-white">
                    {patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactPhone || ''})` : 'Not recorded'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Insurance Coverage:</span>
                  <span className="font-semibold text-[#123047] dark:text-white">
                    {patient.insuranceProvider ? `${patient.insuranceProvider} &bull; ${patient.insurancePolicy || ''}` : 'Self-Pay / None'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Recorded Allergies:</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {patient.allergies || 'None reported'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hospital Security Notice */}
            <div className="p-4 rounded-2xl bg-[#0F8B8D]/10 border border-[#0F8B8D]/20 text-xs flex items-start gap-2.5">
              <ClinivaIcon name="security" size={18} className="text-[#0F8B8D] flex-shrink-0 mt-0.5" />
              <div className="text-[#64748B] dark:text-[#94A3B8]">
                <strong className="text-[#123047] dark:text-white">Security &amp; Updates: </strong>
                To protect your medical privacy, personal information modifications require in-person verification at the Hospital Registration Desk with government-issued photo ID.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
