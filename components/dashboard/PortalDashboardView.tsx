'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import AISymptomChecker from '@/components/patient/AISymptomChecker'
import FamilyHealthLocker from '@/components/patient/FamilyHealthLocker'
import SmartMedicationReminders from '@/components/patient/SmartMedicationReminders'
import EmergencySOSButton from '@/components/ui/EmergencySOSButton'

type Props = {
  firstName: string
}

function PortalShell({ children, firstName }: { children: React.ReactNode; firstName: string }) {
  const pathname = usePathname()

  const NAV = [
    { label: 'Home',    icon: 'home',          href: '/portal' },
    { label: 'Locker',  icon: 'family_restroom', href: '/portal/locker' },
    { label: 'Queue',   icon: 'queue',          href: '/portal/queue' },
    { label: 'Records', icon: 'folder_shared',  href: '/portal/records' },
    { label: 'Rx',      icon: 'medication',     href: '/portal/prescriptions' },
    { label: 'Profile', icon: 'person',         href: '/portal/profile' },
  ]

  return (
    <div className="patient-shell bg-surface min-h-screen pb-24">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 px-gutter-mobile py-3 flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[16px]">medical_services</span>
          </div>
          <span className="font-heading font-semibold text-primary">Cliniva OS</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <button className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-tertiary text-on-tertiary text-[9px] flex items-center justify-center rounded-full font-bold">2</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
            {firstName.charAt(0)}
          </div>
        </div>
      </header>

      <div className="px-gutter-mobile py-space-md space-y-space-md">
        {children}
      </div>

      {/* Floating Prominent Emergency SOS Button */}
      <EmergencySOSButton patientName={`${firstName} Delacroix`} />

      {/* Mobile Bottom Nav - with correct paths */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-around px-2 py-2 z-50 shadow-lg">
        {NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors rounded-xl ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-primary' : ''}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Portal Home Dashboard ────────────────────────────────────────────────────
export function PortalHome({ firstName }: Props) {
  const { queue, activePatient } = useClinicRealtime()
  const currentToken = activePatient?.token ?? 7
  const waitingAhead = queue.filter(p => p.status === 'waiting' && p.token < 7).length

  return (
    <PortalShell firstName={firstName}>
      {/* Welcome */}
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">Good morning,</p>
        <h1 className="font-heading text-headline-lg-mobile text-on-surface font-semibold">{firstName}</h1>
      </div>

      {/* Prominent Emergency SOS & Ambulance Dispatch Banner */}
      <EmergencySOSButton variant="banner" patientName={`${firstName} Delacroix`} className="my-1" />

      {/* Live Queue Token Card */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-space-md text-on-primary relative overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0, 104, 95, 0.25)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
              <span className="text-label-sm text-on-primary/80 uppercase tracking-wider font-semibold">Live Queue Radar</span>
            </div>
            <span className="text-label-sm bg-white/15 px-2 py-0.5 rounded-full font-medium">OPD — Cardiology</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-sm text-on-primary/70 font-medium">Your Token</p>
              <p className="font-heading text-[52px] font-bold leading-none">#7</p>
            </div>
            <div className="text-right">
              <p className="text-label-sm text-on-primary/70 font-medium">Currently In Examination</p>
              <p className="font-heading text-[36px] font-bold leading-none">#{currentToken}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-sm pt-space-sm border-t border-white/20">
            <span className="text-label-sm text-on-primary/70">{currentToken === 7 ? 'It is your turn now!' : `${waitingAhead} patient(s) ahead`}</span>
            <span className="text-label-md font-bold">{currentToken === 7 ? 'Proceed to Room 304' : '~15 minutes'}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Appointment */}
      <div className="clinical-card p-space-md">
        <div className="flex items-start justify-between mb-space-sm">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">Next Appointment</h2>
          <StatusBadge variant="routine" label="Confirmed" />
        </div>
        <div className="flex items-start gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed/40 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">stethoscope</span>
          </div>
          <div className="flex-1">
            <p className="text-label-lg text-on-surface font-semibold">Dr. Sarah Jenkins, MD</p>
            <p className="text-body-sm text-on-surface-variant">Cardiovascular Medicine • Room 304</p>
            <div className="flex items-center gap-space-sm mt-space-sm">
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>Today</span>
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-[16px]">schedule</span>09:45 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions — with real navigation */}
      <div>
        <h2 className="font-heading text-headline-sm text-on-surface font-semibold mb-space-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-space-sm">
          {[
            { label: 'Family Health Locker', icon: 'family_restroom', color: 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300', href: '/portal/locker' },
            { label: 'AI Symptom Checker', icon: 'smart_toy',        color: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300', href: '/portal/symptoms' },
            { label: 'Book Appointment',   icon: 'calendar_add_on',  color: 'bg-primary-fixed/40', href: '/portal/queue' },
            { label: 'My Prescriptions',   icon: 'medication',       color: 'bg-secondary-fixed/40', href: '/portal/prescriptions' },
            { label: 'Medical Records',    icon: 'folder_shared',    color: 'bg-surface-container', href: '/portal/records' },
            { label: 'My Profile',         icon: 'person',           color: 'bg-surface-container', href: '/portal/profile' },
          ].map((action) => (
            <Link key={action.label} href={action.href} className={`${action.color} rounded-xl p-space-md flex flex-col items-start gap-space-sm hover:brightness-95 transition-all text-left`}>
              <span className="material-symbols-outlined text-primary text-[24px]">{action.icon}</span>
              <span className="text-label-md text-on-surface font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Embedded AI Symptom Checker */}
      <AISymptomChecker className="mt-space-md" />
    </PortalShell>
  )
}

// ─── AI Symptom Checker Sub-Page ──────────────────────────────────────────────
export function PortalSymptomChecker({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <AISymptomChecker />
    </PortalShell>
  )
}

// ─── Family Health Locker Sub-Page ────────────────────────────────────────────
export function PortalFamilyLocker({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <FamilyHealthLocker />
    </PortalShell>
  )
}

// ─── Queue Status Sub-Page ────────────────────────────────────────────────────
export function PortalQueue({ firstName }: Props) {
  const { queue, activePatient } = useClinicRealtime()
  const myToken = 7

  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">Live OPD Queue</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">Your Waiting Status</h1>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-on-primary" style={{ boxShadow: '0 8px 24px rgba(0, 104, 95, 0.25)' }}>
        <div className="text-center space-y-2">
          <p className="text-label-sm text-on-primary/70 uppercase tracking-wider">Your Token Number</p>
          <p className="font-heading text-[80px] font-black leading-none">#{myToken}</p>
          <p className="text-label-md text-on-primary/80">Now serving: #{activePatient?.token ?? 7}</p>
        </div>
      </div>

      <div className="clinical-card p-5 space-y-3">
        <h3 className="font-semibold text-on-surface">Patients Ahead of You</h3>
        <div className="space-y-2">
          {queue.filter(p => p.token < myToken && p.status === 'waiting').map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20">
              <span className="font-mono font-bold text-on-surface">#{p.token}</span>
              <span className="text-body-sm text-on-surface-variant">{p.wait}</span>
            </div>
          ))}
          {queue.filter(p => p.token < myToken && p.status === 'waiting').length === 0 && (
            <p className="text-body-sm text-on-surface-variant py-2">🎉 You are next! Please proceed to Room 304.</p>
          )}
        </div>
      </div>
    </PortalShell>
  )
}

// ─── Medical Records Sub-Page ─────────────────────────────────────────────────
export function PortalRecords({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">Clinical History</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">My Medical Records</h1>
      </div>

      {/* Lab Results */}
      <div className="clinical-card">
        <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">Lab Results</h2>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            { test: 'Complete Blood Count', date: 'Today', status: 'normal' },
            { test: 'Troponin I (STAT)', date: 'Today', status: 'review' },
            { test: 'Echocardiogram Report', date: '2 days ago', status: 'normal' },
            { test: 'Serum Lipid Panel', date: '2 weeks ago', status: 'normal' },
          ].map((r) => (
            <div key={r.test} className="flex items-center justify-between px-space-md py-space-sm">
              <div>
                <p className="text-label-md text-on-surface font-medium">{r.test}</p>
                <p className="text-body-sm text-on-surface-variant">{r.date}</p>
              </div>
              <StatusBadge variant={r.status === 'normal' ? 'routine' : 'warning'} label={r.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Visit History */}
      <div className="clinical-card">
        <div className="p-space-md border-b border-outline-variant/20">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">Visit History</h2>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            { date: 'Today', reason: 'Chest pain & shortness of breath', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2021-08-12', reason: 'Acute MI — Stent Placement', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2020-03-15', reason: 'Annual Cardiac Checkup', doctor: 'Dr. Alan Bradley', dept: 'General Medicine' },
          ].map((v) => (
            <div key={v.date} className="px-space-md py-space-sm">
              <div className="flex items-center justify-between">
                <p className="text-label-md text-on-surface font-semibold">{v.reason}</p>
                <p className="text-body-sm text-outline">{v.date}</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{v.doctor} · {v.dept}</p>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  )
}

// ─── Prescriptions & Medication Reminders Sub-Page ───────────────────────────
export function PortalPrescriptions({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <SmartMedicationReminders />
    </PortalShell>
  )
}

export function PortalReminders({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <SmartMedicationReminders />
    </PortalShell>
  )
}

// ─── Profile Sub-Page ─────────────────────────────────────────────────────────
export function PortalProfile({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">Account</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">My Health Profile</h1>
      </div>

      <div className="clinical-card p-5 flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-headline-md">
          {firstName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-on-surface text-body-lg">Marcus Delacroix</p>
          <p className="text-body-sm text-on-surface-variant">MRN: 00482910</p>
        </div>
      </div>

      <div className="clinical-card p-5 space-y-3">
        <h3 className="font-semibold text-on-surface">Personal Information</h3>
        {[
          { label: 'Date of Birth', value: '1970-04-12 (54 years)' },
          { label: 'Gender', value: 'Male' },
          { label: 'Blood Group', value: 'O+' },
          { label: 'Phone', value: '+1 (555) 201-9481' },
          { label: 'Known Allergies', value: 'Penicillin, Sulfa' },
          { label: 'Primary Physician', value: 'Dr. Sarah Jenkins, MD' },
        ].map(info => (
          <div key={info.label} className="flex items-center justify-between text-body-sm border-b border-outline-variant/10 pb-2">
            <span className="text-on-surface-variant">{info.label}</span>
            <span className="font-semibold text-on-surface">{info.value}</span>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

// ─── Default Export: Portal Home ─────────────────────────────────────────────
export default function PortalDashboardView({ firstName }: Props) {
  return <PortalHome firstName={firstName} />
}
