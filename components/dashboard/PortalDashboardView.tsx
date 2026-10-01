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
import ClinivaIcon from '@/components/ui/ClinivaIcon'

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
              <ClinivaIcon name="close" size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-on-surface-variant">
              <ClinivaIcon name="notifications_off" size={40} strokeWidth={1.5} />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low/60 ${n.unread ? 'bg-primary/[0.03]' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <ClinivaIcon name={n.icon} size={18} strokeWidth={1.5} className={n.iconColor} />
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
                  <ClinivaIcon name="close" size={16} strokeWidth={1.5} />
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
            <ClinivaIcon name="medical_services" size={16} strokeWidth={1.5} />
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
            <ClinivaIcon name="notifications" size={20} strokeWidth={1.5} />
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
              <ClinivaIcon
                name={item.icon}
                size={20}
                strokeWidth={1.5}
                className={isActive ? 'text-primary' : ''}
              />
              <span className={`text-[11px] font-semibold truncate w-full text-center ${isActive ? 'text-primary' : ''}`}>
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
        <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{t('greeting')}</p>
        <h1 className="font-heading text-xl sm:text-2xl text-on-surface font-bold">{firstName}</h1>
      </div>

      <div className="bg-[#123047] text-white rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-card border border-[#1B3A4B]">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0F8B8D] animate-pulse" />
              <span className="text-xs text-white/90 uppercase tracking-wider font-semibold">{t('live_queue')}</span>
            </div>
            <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-medium text-white">{t('opd_cardiology')}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 font-medium">{t('your_token')}</p>
              <p className="font-heading text-[48px] font-bold leading-none text-white">#7</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80 font-medium">{t('now_in_room')}</p>
              <p className="font-heading text-[32px] font-bold leading-none text-[#28B5B7]">#{currentToken}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/15">
            <span className="text-xs text-white/80 font-medium">
              {currentToken === 7 ? t('your_turn') : `${waitingAhead} ${t('patients_ahead')}`}
            </span>
            <span className="text-xs font-bold text-white">
              {currentToken === 7 ? t('proceed_room') : t('approx_wait')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">{t('next_appointment')}</h2>
          <StatusBadge variant="routine" label={t('confirmed')} />
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7] flex-shrink-0">
            <ClinivaIcon name="stethoscope" size={20} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#123047] dark:text-white font-semibold">Dr. Sarah Jenkins, MD</p>
            <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{t('cardio_dept')}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                <ClinivaIcon name="calendar_today" size={14} strokeWidth={1.5} className="text-[#0F8B8D]" />
                {t('today')}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                <ClinivaIcon name="schedule" size={14} strokeWidth={1.5} className="text-[#0F8B8D]" />09:45 AM
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider mb-3">{t('quick_actions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'action_locker',    icon: 'family_restroom', href: '/portal/locker' },
            { key: 'action_ai',        icon: 'smart_toy',       href: '/portal/symptoms' },
            { key: 'action_consult',   icon: 'calendar_add_on', href: '/portal/queue' },
            { key: 'action_reminders', icon: 'medication',      href: '/portal/reminders' },
            { key: 'action_records',   icon: 'folder_shared',   href: '/portal/records' },
            { key: 'action_profile',   icon: 'badge',           href: '/portal/profile' },
          ] as const).map((action) => (
            <Link
              key={action.key}
              href={action.href}
              className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-3.5 flex flex-col items-start gap-2 transition-all shadow-card hover:border-[#0F8B8D]/40 active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7]">
                <ClinivaIcon name={action.icon} size={18} strokeWidth={1.5} />
              </div>
              <span className="text-xs text-[#123047] dark:text-white font-semibold leading-tight">{t(action.key)}</span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/portal/symptoms"
        className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] text-[#123047] dark:text-[#E8F0F5] shadow-card hover:border-[#0F8B8D]/40 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-lg bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7] flex-shrink-0">
          <ClinivaIcon name="smart_toy" size={18} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#123047] dark:text-white">{t('triage_teaser_title')}</p>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{t('triage_teaser_sub')}</p>
        </div>
        <ClinivaIcon name="arrow_forward_ios" size={16} strokeWidth={1.5} className="text-[#4A5D6B] dark:text-[#9FB1C0]" />
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

      <div className="bg-primary-navy rounded-xl p-6 text-white shadow-sm border border-slate-700/30">
        <div className="text-center space-y-2">
          <p className="text-label-sm text-slate-300 uppercase tracking-wider">{t('your_token')}</p>
          <p className="font-heading text-[80px] font-black leading-none text-white">#{myToken}</p>
          <p className="text-label-md text-slate-300">{t('now_in_room')}: #{activePatient?.token ?? 7}</p>
        </div>
      </div>

      <div className="clinical-card p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">{t('queue_ahead')}</h3>
        <div className="space-y-2">
          {queue.filter(p => p.token < myToken && p.status === 'waiting').map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20">
              <span className="font-mono font-bold text-sm text-[#123047] dark:text-white">#{p.token}</span>
              <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{p.wait}</span>
            </div>
          ))}
          {queue.filter(p => p.token < myToken && p.status === 'waiting').length === 0 && (
            <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium py-2">{t('queue_next')}</p>
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
        <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{t('records_sub')}</p>
        <h1 className="font-heading text-xl sm:text-2xl text-on-surface font-bold">{t('records_title')}</h1>
      </div>

      <div className="clinical-card">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
          <h2 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">{t('lab_results')}</h2>
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
                <p className="text-sm text-[#123047] dark:text-white font-semibold">{r.test}</p>
                <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">{r.date}</p>
              </div>
              <StatusBadge variant={r.status === 'normal' ? 'routine' : 'warning'} label={r.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="clinical-card">
        <div className="p-4 border-b border-outline-variant/20">
          <h2 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">{t('visit_history')}</h2>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {[
            { date: t('today'),   reason: 'Chest pain & shortness of breath', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2021-08-12', reason: 'Acute MI — Stent Placement',        doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
            { date: '2020-03-15', reason: 'Annual Cardiac Checkup',            doctor: 'Dr. Alan Bradley',  dept: 'General Medicine' },
          ].map((v) => (
            <div key={v.date + v.reason} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#123047] dark:text-white flex-1 pr-2">{v.reason}</p>
                <p className="text-xs font-medium text-[#4A5D6B] dark:text-[#9FB1C0] flex-shrink-0">{v.date}</p>
              </div>
              <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">{v.doctor} &middot; {v.dept}</p>
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
        <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{t('profile_sub')}</p>
        <h1 className="font-heading text-xl sm:text-2xl text-on-surface font-bold">{t('profile_title')}</h1>
      </div>

      <div className="clinical-card p-5 flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-headline-md">
          {firstName.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-base text-[#123047] dark:text-white">Marcus Delacroix</p>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">MRN: 00482910</p>
        </div>
      </div>

      <div className="clinical-card p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">{t('personal_info')}</h3>
        {([
          { key: 'lbl_dob',       value: '1970-04-12 (54 years)' },
          { key: 'lbl_gender',    value: 'Male' },
          { key: 'lbl_blood',     value: 'O+' },
          { key: 'lbl_phone',     value: '+1 (555) 201-9481' },
          { key: 'lbl_allergies', value: 'Penicillin, Sulfa' },
          { key: 'lbl_physician', value: 'Dr. Sarah Jenkins, MD' },
        ] as const).map(info => (
          <div key={info.key} className="flex items-center justify-between text-xs border-b border-outline-variant/10 pb-2.5 gap-2">
            <span className="text-[#4A5D6B] dark:text-[#9FB1C0] font-medium flex-shrink-0">{t(info.key)}</span>
            <span className="font-semibold text-sm text-[#123047] dark:text-white text-right">{info.value}</span>
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
