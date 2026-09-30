'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { usePortalLang } from '@/context/PortalLanguageContext'
import AISymptomChecker from '@/components/patient/AISymptomChecker'
import FamilyHealthLocker from '@/components/patient/FamilyHealthLocker'
import SmartMedicationReminders from '@/components/patient/SmartMedicationReminders'
import EmergencySOSButton from '@/components/ui/EmergencySOSButton'

type Props = { firstName: string }

// ─── Sample Notifications ──────────────────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    icon: 'calendar_today',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Appointment Reminder',
    body: 'Dr. Sarah Jenkins, MD — Today at 09:45 AM, Room 304',
    time: '8 min ago',
    unread: true,
  },
  {
    id: 2,
    icon: 'medication',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    title: 'Medication Due',
    body: 'Aspirin 75mg — Take with water after breakfast',
    time: '25 min ago',
    unread: true,
  },
  {
    id: 3,
    icon: 'lab_panel',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    title: 'Lab Results Ready',
    body: 'Complete Blood Count results are now available',
    time: '1 hour ago',
    unread: false,
  },
]

// ─── Notification Panel ────────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-surface-container-lowest z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-outline-variant/20">
          <div>
            <h2 className="font-heading font-bold text-on-surface text-base">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-on-surface-variant mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-semibold hover:underline px-2 py-1"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px]">notifications_off</span>
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low/60 ${n.unread ? 'bg-primary/[0.03]' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`material-symbols-outlined text-[18px] ${n.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-sm leading-snug ${n.unread ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                      {n.title}
                    </p>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-outline mt-1">{n.time}</p>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors flex-shrink-0 mt-0.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-outline-variant/20">
          <button className="w-full py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-xl transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────────
function PortalShell({ children, firstName }: { children: React.ReactNode; firstName: string }) {
  const pathname = usePathname()
  const { lang, setLang, t } = usePortalLang()
  const [notifOpen, setNotifOpen] = useState(false)

  const NAV = [
    { key: 'nav_home',      icon: 'home',            href: '/portal' },
    { key: 'nav_locker',    icon: 'family_restroom',  href: '/portal/locker' },
    { key: 'nav_queue',     icon: 'queue',            href: '/portal/queue' },
    { key: 'nav_records',   icon: 'folder_shared',    href: '/portal/records' },
    { key: 'nav_reminders', icon: 'medication',       href: '/portal/reminders' },
    { key: 'nav_profile',   icon: 'person',           href: '/portal/profile' },
  ] as const

  return (
    <div className="patient-shell bg-surface min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[16px]">medical_services</span>
          </div>
          <span className="font-heading font-semibold text-primary">Cliniva OS</span>
        </div>
        <div className="flex items-center gap-1.5">

          {/* Language Toggle — simple segmented EN / ML pill */}
          <div className="flex items-center rounded-full bg-surface-container border border-outline-variant/40 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-full transition-all ${lang === 'en' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ml')}
              className={`px-2 py-0.5 rounded-full transition-all ${lang === 'ml' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="മലയാളം"
            >
              ML
            </button>
          </div>

          {/* Notification Button */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-tertiary text-on-tertiary text-[9px] flex items-center justify-center rounded-full font-bold">2</span>
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold flex-shrink-0">
            {firstName.charAt(0)}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}

      {/* Page Content */}
      <div className="px-4 sm:px-6 py-4 space-y-4 w-full max-w-lg mx-auto">
        {children}
      </div>

      {/* Floating SOS Button */}
      <div className="fixed bottom-[68px] right-4 z-40">
        <EmergencySOSButton patientName={`${firstName} Delacroix`} />
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-around px-2 py-2 z-50 shadow-lg">
        {NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-0 flex-1 transition-colors rounded-xl ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'text-primary' : ''}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold truncate w-full text-center ${isActive ? 'text-primary' : ''}`}>
                {t(item.key)}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Portal Home ───────────────────────────────────────────────────────────────

export function PortalHome({ firstName }: Props) {
  const { queue, activePatient } = useClinicRealtime()
  const { t } = usePortalLang()
  const currentToken = activePatient?.token ?? 7
  const waitingAhead = queue.filter(p => p.status === 'waiting' && p.token < 7).length

  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">{t('greeting')}</p>
        <h1 className="font-heading text-headline-lg-mobile text-on-surface font-semibold">{firstName}</h1>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-4 text-on-primary relative overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0, 104, 95, 0.25)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
              <span className="text-label-sm text-on-primary/80 uppercase tracking-wider font-semibold">{t('live_queue')}</span>
            </div>
            <span className="text-label-sm bg-white/15 px-2 py-0.5 rounded-full font-medium">{t('opd_cardiology')}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-sm text-on-primary/70 font-medium">{t('your_token')}</p>
              <p className="font-heading text-[52px] font-bold leading-none">#7</p>
            </div>
            <div className="text-right">
              <p className="text-label-sm text-on-primary/70 font-medium">{t('now_in_room')}</p>
              <p className="font-heading text-[36px] font-bold leading-none">#{currentToken}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
            <span className="text-label-sm text-on-primary/70">
              {currentToken === 7 ? t('your_turn') : `${waitingAhead} ${t('patients_ahead')}`}
            </span>
            <span className="text-label-md font-bold">
              {currentToken === 7 ? t('proceed_room') : t('approx_wait')}
            </span>
          </div>
        </div>
      </div>

      <div className="clinical-card p-4">
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">{t('next_appointment')}</h2>
          <StatusBadge variant="routine" label={t('confirmed')} />
        </div>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed/40 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">stethoscope</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-lg text-on-surface font-semibold">Dr. Sarah Jenkins, MD</p>
            <p className="text-body-sm text-on-surface-variant">{t('cardio_dept')}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
                {t('today')}
              </span>
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>09:45 AM
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-headline-sm text-on-surface font-semibold mb-3">{t('quick_actions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'action_locker',    icon: 'family_restroom', iconColor: 'text-indigo-600 dark:text-indigo-300', bg: 'bg-indigo-500/10 border border-indigo-500/25', href: '/portal/locker' },
            { key: 'action_ai',        icon: 'smart_toy',       iconColor: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/25', href: '/portal/symptoms' },
            { key: 'action_consult',   icon: 'calendar_add_on', iconColor: 'text-primary', bg: 'bg-primary/10 border border-primary/20', href: '/portal/queue' },
            { key: 'action_reminders', icon: 'medication',      iconColor: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/10 border border-amber-500/25', href: '/portal/reminders' },
            { key: 'action_records',   icon: 'folder_shared',   iconColor: 'text-on-surface-variant', bg: 'bg-surface-container border border-outline-variant/30', href: '/portal/records' },
            { key: 'action_profile',   icon: 'badge',           iconColor: 'text-on-surface-variant', bg: 'bg-surface-container border border-outline-variant/30', href: '/portal/profile' },
          ] as const).map((action) => (
            <Link
              key={action.key}
              href={action.href}
              className={`${action.bg} rounded-2xl p-4 flex flex-col items-start gap-2 transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]`}
            >
              <span className={`material-symbols-outlined text-[24px] ${action.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
              <span className="text-[13px] text-on-surface font-semibold leading-tight">{t(action.key)}</span>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/portal/symptoms"
        className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:brightness-105 transition-all active:scale-[0.98]">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{t('triage_teaser_title')}</p>
          <p className="text-xs text-white/80">{t('triage_teaser_sub')}</p>
        </div>
        <span className="material-symbols-outlined text-white/70 text-[20px]">arrow_forward_ios</span>
      </Link>
    </PortalShell>
  )
}

// ─── AI Symptom Checker Sub-Page ───────────────────────────────────────────────
export function PortalSymptomChecker({ firstName }: Props) {
  const { t } = usePortalLang()
  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5 mb-1">
        <p className="text-body-sm text-on-surface-variant">{t('ai_badge')}</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">{t('ai_title')}</h1>
      </div>
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
  const { t } = usePortalLang()
  const myToken = 7

  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">{t('queue_sub')}</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">{t('queue_title')}</h1>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-on-primary" style={{ boxShadow: '0 8px 24px rgba(0, 104, 95, 0.25)' }}>
        <div className="text-center space-y-2">
          <p className="text-label-sm text-on-primary/70 uppercase tracking-wider">{t('your_token')}</p>
          <p className="font-heading text-[80px] font-black leading-none">#{myToken}</p>
          <p className="text-label-md text-on-primary/80">{t('now_in_room')}: #{activePatient?.token ?? 7}</p>
        </div>
      </div>

      <div className="clinical-card p-5 space-y-3">
        <h3 className="font-semibold text-on-surface">{t('queue_ahead')}</h3>
        <div className="space-y-2">
          {queue.filter(p => p.token < myToken && p.status === 'waiting').map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20">
              <span className="font-mono font-bold text-on-surface">#{p.token}</span>
              <span className="text-body-sm text-on-surface-variant">{p.wait}</span>
            </div>
          ))}
          {queue.filter(p => p.token < myToken && p.status === 'waiting').length === 0 && (
            <p className="text-body-sm text-on-surface-variant py-2">{t('queue_next')}</p>
          )}
        </div>
      </div>
    </PortalShell>
  )
}

// ─── Medical Records Sub-Page ─────────────────────────────────────────────────
export function PortalRecords({ firstName }: Props) {
  const { t } = usePortalLang()
  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">{t('records_sub')}</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">{t('records_title')}</h1>
      </div>

      <div className="clinical-card">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">{t('lab_results')}</h2>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            { test: 'Complete Blood Count',  date: t('today'),   status: 'normal' },
            { test: 'Troponin I (STAT)',      date: t('today'),   status: 'review' },
            { test: 'Echocardiogram Report', date: '2 days ago',  status: 'normal' },
            { test: 'Serum Lipid Panel',     date: '2 weeks ago', status: 'normal' },
          ].map((r) => (
            <div key={r.test} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-label-md text-on-surface font-medium">{r.test}</p>
                <p className="text-body-sm text-on-surface-variant">{r.date}</p>
              </div>
              <StatusBadge variant={r.status === 'normal' ? 'routine' : 'warning'} label={r.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="clinical-card">
        <div className="p-4 border-b border-outline-variant/20">
          <h2 className="font-heading text-headline-sm text-on-surface font-semibold">{t('visit_history')}</h2>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            { date: t('today'),   reason: 'Chest pain & shortness of breath', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2021-08-12', reason: 'Acute MI — Stent Placement',        doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2020-03-15', reason: 'Annual Cardiac Checkup',            doctor: 'Dr. Alan Bradley',  dept: 'General Medicine' },
          ].map((v) => (
            <div key={v.date + v.reason} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-label-md text-on-surface font-semibold flex-1 pr-2">{v.reason}</p>
                <p className="text-body-sm text-outline flex-shrink-0">{v.date}</p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{v.doctor} &middot; {v.dept}</p>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  )
}

// ─── Medication Reminders Sub-Page ────────────────────────────────────────────
export function PortalReminders({ firstName }: Props) {
  return (
    <PortalShell firstName={firstName}>
      <SmartMedicationReminders />
    </PortalShell>
  )
}

/** @deprecated Use PortalReminders instead */
export function PortalPrescriptions({ firstName }: Props) {
  return <PortalReminders firstName={firstName} />
}

// ─── Profile Sub-Page ─────────────────────────────────────────────────────────
export function PortalProfile({ firstName }: Props) {
  const { t } = usePortalLang()
  return (
    <PortalShell firstName={firstName}>
      <div className="flex flex-col space-y-0.5">
        <p className="text-body-sm text-on-surface-variant">{t('profile_sub')}</p>
        <h1 className="font-heading text-headline-md text-on-surface font-semibold">{t('profile_title')}</h1>
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
        <h3 className="font-semibold text-on-surface">{t('personal_info')}</h3>
        {([
          { key: 'lbl_dob',       value: '1970-04-12 (54 years)' },
          { key: 'lbl_gender',    value: 'Male' },
          { key: 'lbl_blood',     value: 'O+' },
          { key: 'lbl_phone',     value: '+1 (555) 201-9481' },
          { key: 'lbl_allergies', value: 'Penicillin, Sulfa' },
          { key: 'lbl_physician', value: 'Dr. Sarah Jenkins, MD' },
        ] as const).map(info => (
          <div key={info.key} className="flex items-center justify-between text-body-sm border-b border-outline-variant/10 pb-2 gap-2">
            <span className="text-on-surface-variant flex-shrink-0">{t(info.key)}</span>
            <span className="font-semibold text-on-surface text-right">{info.value}</span>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

// ─── Default Export ────────────────────────────────────────────────────────────
export default function PortalDashboardView({ firstName }: Props) {
  return <PortalHome firstName={firstName} />
}
