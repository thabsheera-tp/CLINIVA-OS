'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { usePortalLang } from '@/context/PortalLanguageContext'

const REMINDERS_I18N = {
  en: {
    badge: 'Smart Adherence Engine',
    title: 'Medication & Health Reminders',
    subtitle: 'Set custom schedules, receive browser alerts, and track daily dose adherence.',
    testAlarm: '🔔 Test Alarm',
    setReminder: '+ Set Reminder',
    alertsTitle: 'Browser Audio-Visual Alerts',
    activeBadge: 'Active',
    reqBadge: 'Permission Required',
    alertsActive: 'Native desktop chime and toast notifications are active.',
    alertsReq: 'Enable browser permission to receive alarms even when the app is in the background.',
    enableAlerts: 'Enable Browser Alerts',
    adherenceTitle: "Today's Medication Adherence",
    takenRatio: (taken: number, total: number, pct: number) => `${taken} of ${total} taken (${pct}%)`,
    timelineTitle: "Today's Medication Timeline",
    timelineSub: 'Chronological schedule of morning, afternoon, and evening prescription doses.',
    alarmTriggered: 'Medication Alarm Triggered Now',
    timeToTake: (med: string, dose: string) => `Time to take ${med} (${dose})`,
    schedFor: (time: string) => `Scheduled for ${time} • Please take with water`,
    markTaken: '✓ Mark as Taken',
    snooze: 'Snooze 15m',
    takeDose: 'Take Dose',
    completed: '✓ Completed',
    takenAt: (time: string) => `✓ Taken at ${time}`,
    rxTitle: 'Active Prescriptions & Pill Inventory',
    rxSub: 'Manage custom dosage frequency and refill stock count.',
    addRx: '+ Add Prescription',
    pillsLeft: (count: number) => `${count} pills left`,
    refillRx: 'Refill Rx',
    slots: {
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      bedtime: 'bedtime',
    } as Record<string, string>,
    mealTiming: {
      after_meal: 'after meal',
      before_meal: 'before meal',
      with_meal: 'with meal',
      empty_stomach: 'empty stomach',
    } as Record<string, string>,
    frequencies: {
      once_daily: 'Once Daily',
      twice_daily: 'Twice Daily',
      three_times_daily: 'Three Times Daily',
      as_needed: 'As Needed',
    } as Record<string, string>,
    modal: {
      title: 'Set Custom Medication Reminder',
      nameLabel: 'Medicine / Prescription Name *',
      namePh: 'e.g., Metformin, Lisinopril, Amoxicillin',
      dosageLabel: 'Dosage *',
      dosagePh: 'e.g., 500mg (1 tablet)',
      classLabel: 'Therapeutic Class',
      freqLabel: 'Dose Frequency',
      freqOnce: 'Once Daily (1x)',
      freqTwice: 'Twice Daily (2x - Morning & Evening)',
      freqThree: 'Three Times Daily (3x - TID)',
      freqAsNeeded: 'As Needed (PRN)',
      timingLabel: 'Alarm Timing(s)',
      mealLabel: 'Meal Timing',
      afterMeal: 'After Meal',
      beforeMeal: 'Before Meal',
      withMeal: 'With Meal',
      emptyStomach: 'Empty Stomach',
      pillsLabel: 'Total Pills / Pack',
      notesLabel: 'Special Instructions',
      notesPh: 'e.g., Take with full glass of water, avoid grapefruit',
      cancel: 'Cancel',
      save: 'Save Reminder Schedule',
    },
    medInstructions: {
      'rem-1': 'Take in the morning with a glass of water for blood pressure management.',
      'rem-2': 'Take with food to prevent gastric irritation.',
      'rem-3': 'Take at bedtime for optimal cholesterol regulation.',
      'rem-4': 'Dietary heart supplement with breakfast & dinner.',
    } as Record<string, string>,
  },
  ml: {
    badge: 'സ്മാർട്ട് മരുന്ന് ട്രാക്കർ',
    title: 'മരുന്ന് & ആരോഗ്യ ഓർക്കാം',
    subtitle: 'കൃത്യസമയത്ത് മരുന്ന് കഴിക്കാൻ സമയക്രമവും ബ്രൗസർ അലാറങ്ങളും സജ്ജമാക്കുക.',
    testAlarm: '🔔 അലാറം പരിശോധിക്കൂ',
    setReminder: '+ ഓർമ്മപ്പെടുത്തൽ ചേർക്കൂ',
    alertsTitle: 'ബ്രൗസർ അലാറം മുന്നറിയിപ്പുകൾ',
    activeBadge: 'പ്രവർത്തനക്ഷമം',
    reqBadge: 'അനുമതി ആവശ്യമാണ്',
    alertsActive: 'ഡെസ്ക്ടോപ്പ് ശബ്ദ അലാറവും അറിയിപ്പുകളും സജീവമാണ്.',
    alertsReq: 'ആപ്പ് തുറക്കാത്തപ്പോഴും അലാറം ലഭിക്കാൻ ബ്രൗസർ അനുമതി നൽകുക.',
    enableAlerts: 'അലാറം അനുമതി നൽകുക',
    adherenceTitle: 'ഇന്നത്തെ മരുന്ന് കഴിച്ച നിരക്ക്',
    takenRatio: (taken: number, total: number, pct: number) => `${total}-ൽ ${taken} കഴിച്ചു (${pct}%)`,
    timelineTitle: 'ഇന്നത്തെ മരുന്ന് സമയക്രമം',
    timelineSub: 'രാവിലെ, ഉച്ചയ്ക്ക്, രാത്രി കഴിക്കേണ്ട മരുന്നുകളുടെ സമയക്രമം.',
    alarmTriggered: 'മരുന്ന് കഴിക്കാനുള്ള സമയം!',
    timeToTake: (med: string, dose: string) => `${med} (${dose}) കഴിക്കാനുള്ള സമയം`,
    schedFor: (time: string) => `സമയക്രമം: ${time} • വെള്ളത്തോടൊപ്പം കഴിക്കുക`,
    markTaken: '✓ കഴിച്ചതായി അടയാളപ്പെടുത്തൂ',
    snooze: '15 മി. മാറ്റിവെക്കൂ',
    takeDose: 'മരുന്ന് കഴിച്ചു',
    completed: '✓ പൂർത്തിയായി',
    takenAt: (time: string) => `✓ സമയം: ${time}`,
    rxTitle: 'നിലവിലെ മരുന്നുകളും ബാക്കി ഗുളികകളും',
    rxSub: 'മരുന്നിന്റെ അളവും ബാക്കി സ്റ്റോക്കും പരിശോധിക്കുക.',
    addRx: '+ മരുന്ന് ചേർക്കൂ',
    pillsLeft: (count: number) => `${count} ഗുളികകൾ ബാക്കി`,
    refillRx: 'വാങ്ങുക',
    slots: {
      morning: 'രാവിലെ',
      afternoon: 'ഉച്ചയ്ക്ക്',
      evening: 'വൈകുന്നേരം',
      bedtime: 'രാത്രി',
    } as Record<string, string>,
    mealTiming: {
      after_meal: 'ഭക്ഷണത്തിന് ശേഷം',
      before_meal: 'ഭക്ഷണത്തിന് മുൻപ്',
      with_meal: 'ഭക്ഷണത്തോടൊപ്പം',
      empty_stomach: 'വെറുംവയറ്റിൽ',
    } as Record<string, string>,
    frequencies: {
      once_daily: 'ദിവസത്തിൽ 1 തവണ',
      twice_daily: 'ദിവസത്തിൽ 2 തവണ',
      three_times_daily: 'ദിവസത്തിൽ 3 തവണ',
      as_needed: 'ആവശ്യാനുസരണം',
    } as Record<string, string>,
    modal: {
      title: 'പുതിയ മരുന്ന് സമയക്രമം ചേർക്കൂ',
      nameLabel: 'മരുന്നിന്റെ പേര് *',
      namePh: 'ഉദാ: മെറ്റ്ഫോർമിൻ, ലിസിനോപ്രിൽ',
      dosageLabel: 'അളവ് (Dosage) *',
      dosagePh: 'ഉദാ: 500mg (1 ഗുളിക)',
      classLabel: 'വിഭാഗം',
      freqLabel: 'കഴിക്കേണ്ട തവണ',
      freqOnce: 'ദിവസത്തിൽ 1 തവണ (1x)',
      freqTwice: 'ദിവസത്തിൽ 2 തവണ (രാവിലെ & രാത്രി)',
      freqThree: 'ദിവസത്തിൽ 3 തവണ (3x)',
      freqAsNeeded: 'ആവശ്യാനുസരണം (PRN)',
      timingLabel: 'അലാറം സമയം(കൾ)',
      mealLabel: 'ഭക്ഷണ ക്രമം',
      afterMeal: 'ഭക്ഷണത്തിന് ശേഷം',
      beforeMeal: 'ഭക്ഷണത്തിന് മുൻപ്',
      withMeal: 'ഭക്ഷണത്തോടൊപ്പം',
      emptyStomach: 'വെറുംവയറ്റിൽ',
      pillsLabel: 'ആകെ ഗുളികകളുടെ എണ്ണം',
      notesLabel: 'പ്രത്യേക നിർദ്ദേശങ്ങൾ',
      notesPh: 'ഉദാ: ധാരാളം വെള്ളത്തോടൊപ്പം കഴിക്കുക',
      cancel: 'റദ്ദാക്കുക',
      save: 'സേവ് ചെയ്യുക',
    },
    medInstructions: {
      'rem-1': 'രക്തസമ്മർദ്ദം നിയന്ത്രിക്കാൻ രാവിലെ ഒരു ഗ്ലാസ് വെള്ളത്തോടൊപ്പം കഴിക്കുക.',
      'rem-2': 'വയറെരിച്ചിൽ ഒഴിവാക്കാൻ ഭക്ഷണത്തോടൊപ്പം കഴിക്കുക.',
      'rem-3': 'കൊളസ്ട്രോൾ നിയന്ത്രണത്തിനായി രാത്രി ഉറങ്ങുന്നതിനുമുമ്പ് കഴിക്കുക.',
      'rem-4': 'പ്രഭാതഭക്ഷണത്തോടും അത്താഴത്തോടും ഒപ്പം കഴിക്കുക.',
    } as Record<string, string>,
  },
}

export type MedicationReminder = {
  id: string
  medicine_name: string
  dosage: string
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'as_needed'
  schedule_times: string[] // Array of 'HH:mm' 24-hour strings e.g. ['08:00', '20:00']
  meal_timing: 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach'
  instructions: string
  category: 'cardio' | 'diabetes' | 'general' | 'antibiotic' | 'supplement'
  color_code: string
  total_pills: number
  pills_remaining: number
  is_active: boolean
}

export type TimelineDose = {
  id: string // e.g. 'dose-rem-1-08:00'
  reminder_id: string
  medicine_name: string
  dosage: string
  time: string // '08:00'
  display_time: string // '08:00 AM'
  slot: 'morning' | 'afternoon' | 'evening' | 'bedtime'
  meal_timing: string
  instructions: string
  status: 'pending' | 'taken' | 'missed' | 'snoozed'
  taken_at?: string
  color_code: string
}

// Initial clinical medications for Marcus Delacroix
const DEFAULT_REMINDERS: MedicationReminder[] = [
  {
    id: 'rem-1',
    medicine_name: 'Lisinopril',
    dosage: '10mg (1 Tablet)',
    frequency: 'once_daily',
    schedule_times: ['08:00'],
    meal_timing: 'after_meal',
    instructions: 'Take in the morning with a glass of water for blood pressure management.',
    category: 'cardio',
    color_code: 'emerald',
    total_pills: 30,
    pills_remaining: 24,
    is_active: true,
  },
  {
    id: 'rem-2',
    medicine_name: 'Aspirin (Cardio Protection)',
    dosage: '81mg (Low Dose)',
    frequency: 'once_daily',
    schedule_times: ['08:30'],
    meal_timing: 'after_meal',
    instructions: 'Take with food to prevent gastric irritation.',
    category: 'cardio',
    color_code: 'blue',
    total_pills: 60,
    pills_remaining: 45,
    is_active: true,
  },
  {
    id: 'rem-3',
    medicine_name: 'Atorvastatin',
    dosage: '40mg (1 Tablet)',
    frequency: 'once_daily',
    schedule_times: ['21:30'],
    meal_timing: 'after_meal',
    instructions: 'Take at bedtime for optimal cholesterol regulation.',
    category: 'cardio',
    color_code: 'purple',
    total_pills: 30,
    pills_remaining: 18,
    is_active: true,
  },
  {
    id: 'rem-4',
    medicine_name: 'Omega-3 Fish Oil',
    dosage: '1000mg Capsule',
    frequency: 'twice_daily',
    schedule_times: ['08:00', '19:30'],
    meal_timing: 'with_meal',
    instructions: 'Dietary heart supplement with breakfast & dinner.',
    category: 'supplement',
    color_code: 'amber',
    total_pills: 60,
    pills_remaining: 32,
    is_active: true,
  },
]

function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m < 10 ? `0${m}` : m} ${ampm}`
}

function getTimeSlot(time24: string): 'morning' | 'afternoon' | 'evening' | 'bedtime' {
  const hour = parseInt(time24.split(':')[0], 10)
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'bedtime'
}

// Gentle audio synthesizer chime for medication alerts (zero dependencies, native Web Audio API)
function playGentleMedicationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3) // A5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(440, now) // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.3) // E5

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 1.2)
    osc2.stop(now + 1.2)
  } catch {
    // AudioContext blocked by browser autoplay policy
  }
}

export default function SmartMedicationReminders({ className = '' }: { className?: string }) {
  const { lang } = usePortalLang()
  const i18n = REMINDERS_I18N[lang] || REMINDERS_I18N.en

  // Reminders state
  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cliniva_med_reminders')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {}
      }
    }
    return DEFAULT_REMINDERS
  })

  // Doses for Today
  const [timelineDoses, setTimelineDoses] = useState<TimelineDose[]>([])

  // Browser Notification Status
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isAlertActive, setIsAlertActive] = useState<{ medicine: string; dosage: string; time: string } | null>(null)
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null)

  // Add Reminder Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [newDosage, setNewDosage] = useState('1 Tablet')
  const [newFrequency, setNewFrequency] = useState<MedicationReminder['frequency']>('once_daily')
  const [newTimes, setNewTimes] = useState<string[]>(['08:00'])
  const [newMeal, setNewMeal] = useState<MedicationReminder['meal_timing']>('after_meal')
  const [newInstructions, setNewInstructions] = useState('')
  const [newCategory, setNewCategory] = useState<MedicationReminder['category']>('cardio')
  const [newPills, setNewPills] = useState<number>(30)

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Save reminders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cliniva_med_reminders', JSON.stringify(reminders))
    }
  }, [reminders])

  // Build Today's Doses Timeline from active reminders
  const generateTodayDoses = useCallback(() => {
    const doses: TimelineDose[] = []

    reminders
      .filter((r) => r.is_active)
      .forEach((rem) => {
        rem.schedule_times.forEach((timeStr) => {
          const doseId = `${rem.id}-${timeStr}`
          // Read taken status from localStorage if saved for today
          const todayKey = `dose_${new Date().toISOString().split('T')[0]}_${doseId}`
          const savedStatus = typeof window !== 'undefined' ? localStorage.getItem(todayKey) : null

          let status: TimelineDose['status'] = 'pending'
          let taken_at: string | undefined = undefined

          if (savedStatus) {
            try {
              const parsed = JSON.parse(savedStatus)
              status = parsed.status
              taken_at = parsed.taken_at
            } catch {
              status = savedStatus as any
            }
          }

          doses.push({
            id: doseId,
            reminder_id: rem.id,
            medicine_name: rem.medicine_name,
            dosage: rem.dosage,
            time: timeStr,
            display_time: formatTimeDisplay(timeStr),
            slot: getTimeSlot(timeStr),
            meal_timing: rem.meal_timing.replace('_', ' '),
            instructions: rem.instructions,
            status,
            taken_at,
            color_code: rem.color_code,
          })
        })
      })

    // Sort chronologically
    doses.sort((a, b) => a.time.localeCompare(b.time))
    setTimelineDoses(doses)
  }, [reminders])

  useEffect(() => {
    generateTodayDoses()
  }, [generateTodayDoses])

  // Requirement 2: Browser Notification Permission Requester
  const requestNotificationAccess = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        playGentleMedicationChime()
        new Notification('Cliniva OS Medication Reminders Enabled', {
          body: 'You will receive scheduled alerts when it is time to take your medicine.',
          icon: '/favicon.ico',
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Trigger alert helper
  const triggerNotificationAlert = useCallback((medicine: string, dosage: string, time: string) => {
    playGentleMedicationChime()
    setIsAlertActive({ medicine, dosage, time })

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Medication Reminder: ${medicine} ${dosage}`, {
        body: `It is ${formatTimeDisplay(time)}. Please take your scheduled dose now.`,
        icon: '/favicon.ico',
      })
    }
  }, [])

  // Live timer check: checks if any scheduled dose matches current time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentHours = String(now.getHours()).padStart(2, '0')
      const currentMinutes = String(now.getMinutes()).padStart(2, '0')
      const currentTimeString = `${currentHours}:${currentMinutes}`

      timelineDoses.forEach((dose) => {
        if (dose.status === 'pending' && dose.time === currentTimeString) {
          triggerNotificationAlert(dose.medicine_name, dose.dosage, dose.time)
        }
      })
    }, 30000) // Check every 30s

    return () => clearInterval(interval)
  }, [timelineDoses, triggerNotificationAlert])

  // Mark Dose as Taken
  const handleMarkDoseTaken = (doseId: string) => {
    const nowTimeStr = formatTimeDisplay(
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    )

    setTimelineDoses((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? { ...d, status: 'taken', taken_at: nowTimeStr }
          : d
      )
    )

    // Save to localStorage for today
    const todayKey = `dose_${new Date().toISOString().split('T')[0]}_${doseId}`
    localStorage.setItem(todayKey, JSON.stringify({ status: 'taken', taken_at: nowTimeStr }))

    // Deduct remaining pills from reminder
    const dose = timelineDoses.find((d) => d.id === doseId)
    if (dose) {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === dose.reminder_id && r.pills_remaining > 0
            ? { ...r, pills_remaining: r.pills_remaining - 1 }
            : r
        )
      )
    }

    setAlertSuccessMsg(`Recorded: ${dose?.medicine_name} taken at ${nowTimeStr}!`)
    setTimeout(() => setAlertSuccessMsg(null), 3000)

    // Also close alert banner if this dose was actively alerting
    if (isAlertActive && isAlertActive.medicine === dose?.medicine_name) {
      setIsAlertActive(null)
    }
  }

  // Snooze Dose
  const handleSnoozeDose = (doseId: string) => {
    setTimelineDoses((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: 'snoozed' } : d))
    )
    setIsAlertActive(null)
    setAlertSuccessMsg('Reminder snoozed for 15 minutes.')
    setTimeout(() => setAlertSuccessMsg(null), 3000)
  }

  // Add Reminder Submit
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMedName.trim()) return

    const newRem: MedicationReminder = {
      id: `rem-${Date.now()}`,
      medicine_name: newMedName.trim(),
      dosage: newDosage.trim(),
      frequency: newFrequency,
      schedule_times: newTimes,
      meal_timing: newMeal,
      instructions: newInstructions.trim() || 'Take as prescribed by your physician.',
      category: newCategory,
      color_code:
        newCategory === 'cardio'
          ? 'emerald'
          : newCategory === 'diabetes'
          ? 'blue'
          : newCategory === 'antibiotic'
          ? 'rose'
          : 'amber',
      total_pills: newPills,
      pills_remaining: newPills,
      is_active: true,
    }

    try {
      const supabase = createClientSideClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await (supabase.from('patient_medication_reminders') as any).insert({
          user_id: session.user.id,
          medicine_name: newRem.medicine_name,
          dosage: newRem.dosage,
          frequency: newRem.frequency,
          schedule_times: newRem.schedule_times,
          meal_timing: newRem.meal_timing,
          instructions: newRem.instructions,
          category: newRem.category,
          color_code: newRem.color_code,
          total_pills: newRem.total_pills,
          pills_remaining: newRem.pills_remaining,
        })
      }
    } catch {}

    setReminders((prev) => [newRem, ...prev])
    setIsAddModalOpen(false)
    setNewMedName('')
    setNewDosage('1 Tablet')
    setNewInstructions('')
    setAlertSuccessMsg(`Created schedule for ${newRem.medicine_name}!`)
    setTimeout(() => setAlertSuccessMsg(null), 3000)
  }

  // Handle Frequency Change in Add Modal
  const handleFrequencyChange = (freq: MedicationReminder['frequency']) => {
    setNewFrequency(freq)
    if (freq === 'once_daily') setNewTimes(['08:00'])
    else if (freq === 'twice_daily') setNewTimes(['08:00', '20:00'])
    else if (freq === 'three_times_daily') setNewTimes(['08:00', '13:00', '20:00'])
    else if (freq === 'as_needed') setNewTimes(['12:00'])
  }

  // Adherence Calculation
  const totalDosesToday = timelineDoses.length
  const takenDosesToday = timelineDoses.filter((d) => d.status === 'taken').length
  const adherencePercent =
    totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100

  return (
    <div className={`space-y-space-md ${className}`}>
      {/* Toast Alert Feedback */}
      {alertSuccessMsg && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md flex items-center gap-2 text-body-sm font-semibold animate-fadeIn">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{alertSuccessMsg}</span>
        </div>
      )}

      {/* ── Active Live Alert Banner (Triggered when alarm rings) ── */}
      {isAlertActive && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-primary/15 to-emerald-500/20 border-2 border-primary rounded-2xl shadow-lg animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-lg flex-shrink-0 animate-bounce">
              🔔
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {i18n.alarmTriggered}
              </span>
              <h3 className="font-heading text-title-md font-extrabold text-on-surface">
                {i18n.timeToTake(isAlertActive.medicine, isAlertActive.dosage)}
              </h3>
              <p className="text-body-xs text-on-surface-variant">
                {i18n.schedFor(formatTimeDisplay(isAlertActive.time))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                const matched = timelineDoses.find((d) => d.medicine_name === isAlertActive.medicine)
                if (matched) handleMarkDoseTaken(matched.id)
                else setIsAlertActive(null)
              }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-label-sm transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{i18n.markTaken}</span>
            </button>
            <button
              onClick={() => {
                const matched = timelineDoses.find((d) => d.medicine_name === isAlertActive.medicine)
                if (matched) handleSnoozeDose(matched.id)
                else setIsAlertActive(null)
              }}
              className="btn-secondary py-2 px-3 text-label-sm"
            >
              {i18n.snooze}
            </button>
          </div>
        </div>
      )}

      {/* ── Header with Notification Permission Status & Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <span className="text-label-xs font-bold uppercase tracking-wider text-primary">
              {i18n.badge}
            </span>
          </div>
          <h1 className="font-heading text-headline-sm sm:text-headline-md font-bold text-on-surface mt-1">
            {i18n.title}
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            {i18n.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Test Alarm CTA */}
          <button
            onClick={() => {
              triggerNotificationAlert(
                reminders[0]?.medicine_name || 'Lisinopril',
                reminders[0]?.dosage || '10mg',
                '08:00'
              )
            }}
            title="Test notification sound and banner alert"
            className="btn-secondary py-2 px-3 rounded-xl text-label-xs font-semibold flex items-center gap-1.5"
          >
            <span>{i18n.testAlarm}</span>
          </button>

          {/* Add Reminder CTA */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary py-2 px-4 rounded-xl text-label-sm font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span>{i18n.setReminder}</span>
          </button>
        </div>
      </div>

      {/* ── Notification Status & Adherence Bar Card ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
          {/* Browser Notification Status */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-label-md text-on-surface">
                  {i18n.alertsTitle}
                </span>
                <span
                  className={`px-2 py-0.2 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {notificationPermission === 'granted' ? i18n.activeBadge : i18n.reqBadge}
                </span>
              </div>
              <p className="text-body-xs text-on-surface-variant">
                {notificationPermission === 'granted'
                  ? i18n.alertsActive
                  : i18n.alertsReq}
              </p>
            </div>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationAccess}
              className="py-1.5 px-3.5 bg-primary text-on-primary rounded-xl text-label-xs font-bold hover:bg-primary/90 transition-all self-start sm:self-auto"
            >
              {i18n.enableAlerts}
            </button>
          )}
        </div>

        {/* Daily Adherence Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-label-sm font-bold text-on-surface">
              {i18n.adherenceTitle}
            </span>
            <span className="text-label-sm font-bold font-mono text-primary">
              {i18n.takenRatio(takenDosesToday, totalDosesToday, adherencePercent)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                adherencePercent === 100
                  ? 'bg-emerald-500'
                  : adherencePercent >= 50
                  ? 'bg-primary'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Requirement 3: Clean Timeline View Showing Today's Doses ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-md shadow-sm space-y-space-md">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div>
            <h2 className="font-heading text-title-md font-bold text-on-surface">
              {i18n.timelineTitle}
            </h2>
            <p className="text-body-xs text-on-surface-variant">
              {i18n.timelineSub}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-label-xs font-bold bg-surface-container-high text-on-surface">
            {new Date().toLocaleDateString(lang === 'ml' ? 'ml-IN' : undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/30">
          {timelineDoses.map((dose) => {
            const isTaken = dose.status === 'taken'
            const isSnoozed = dose.status === 'snoozed'

            return (
              <div key={dose.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <span
                  className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isTaken
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isSnoozed
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-surface-container-lowest border-primary text-primary'
                  }`}
                >
                  {isTaken ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </span>

                {/* Dose Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isTaken
                      ? 'bg-surface-container-low/40 border-outline-variant/20 opacity-80'
                      : 'bg-surface-container-low border-outline-variant/40 shadow-xs hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-label-md font-extrabold text-primary">
                          {dose.display_time}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface">
                          {i18n.slots[dose.slot] || dose.slot}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary-fixed/40 text-on-secondary-fixed capitalize">
                          {i18n.mealTiming[dose.meal_timing.replace(' ', '_')] || dose.meal_timing}
                        </span>
                      </div>

                      <h3
                        className={`font-heading text-title-md font-bold mt-1 ${
                          isTaken ? 'line-through text-on-surface-variant' : 'text-on-surface'
                        }`}
                      >
                        {dose.medicine_name}{' '}
                        <span className="text-body-sm font-normal text-on-surface-variant">
                          • {dose.dosage}
                        </span>
                      </h3>

                      <p className="text-body-xs text-on-surface-variant mt-0.5">
                        {i18n.medInstructions[dose.reminder_id] || dose.instructions}
                      </p>

                      {isTaken && dose.taken_at && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                          <span>{i18n.takenAt(dose.taken_at)}</span>
                        </p>
                      )}
                    </div>

                    {/* Dose Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isTaken ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-label-sm border border-emerald-500/30">
                          {i18n.completed}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSnoozeDose(dose.id)}
                            className="btn-secondary py-2 px-3 text-label-xs rounded-xl"
                          >
                            {i18n.snooze}
                          </button>
                          <button
                            onClick={() => handleMarkDoseTaken(dose.id)}
                            className="btn-primary py-2 px-4 rounded-xl text-label-sm font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{i18n.takeDose}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Active Prescriptions & Refill Inventory ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-md shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div>
            <h3 className="font-heading text-title-md font-bold text-on-surface">
              {i18n.rxTitle}
            </h3>
            <p className="text-body-xs text-on-surface-variant">
              {i18n.rxSub}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-label-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>{i18n.addRx}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading font-bold text-label-md text-on-surface">
                    {rem.medicine_name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      rem.pills_remaining <= 5
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {i18n.pillsLeft(rem.pills_remaining)}
                  </span>
                </div>
                <p className="text-body-xs text-on-surface-variant font-medium">
                  {rem.dosage} • {i18n.frequencies[rem.frequency] || rem.frequency.replace('_', ' ')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {rem.schedule_times.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-[11px] rounded-md font-bold"
                    >
                      {formatTimeDisplay(t)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-body-xs">
                <span className="text-on-surface-variant capitalize">
                  {i18n.mealTiming[rem.meal_timing] || rem.meal_timing.replace('_', ' ')}
                </span>
                <span className="text-primary font-semibold hover:underline cursor-pointer">
                  {i18n.refillRx}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Custom Medication Reminder Setter ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-title-md font-bold text-on-surface">
                  {i18n.modal.title}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReminderSubmit} className="space-y-3.5 mt-4">
              {/* Medicine Name */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  {i18n.modal.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder={i18n.modal.namePh}
                  className="input-field"
                />
              </div>

              {/* Dosage & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    {i18n.modal.dosageLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder={i18n.modal.dosagePh}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    {i18n.modal.classLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="cardio">Cardiovascular</option>
                    <option value="diabetes">Endocrine / Diabetes</option>
                    <option value="antibiotic">Antibiotic / Infection</option>
                    <option value="supplement">Supplement / Vitamin</option>
                    <option value="general">General / Other</option>
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  {i18n.modal.freqLabel}
                </label>
                <select
                  value={newFrequency}
                  onChange={(e) => handleFrequencyChange(e.target.value as any)}
                  className="input-field"
                >
                  <option value="once_daily">{i18n.modal.freqOnce}</option>
                  <option value="twice_daily">{i18n.modal.freqTwice}</option>
                  <option value="three_times_daily">{i18n.modal.freqThree}</option>
                  <option value="as_needed">{i18n.modal.freqAsNeeded}</option>
                </select>
              </div>

              {/* Schedule Times */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  {i18n.modal.timingLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {newTimes.map((time, idx) => (
                    <input
                      key={idx}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const updated = [...newTimes]
                        updated[idx] = e.target.value
                        setNewTimes(updated)
                      }}
                      className="input-field text-center font-mono"
                    />
                  ))}
                </div>
              </div>

              {/* Meal Timing & Pills Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    {i18n.modal.mealLabel}
                  </label>
                  <select
                    value={newMeal}
                    onChange={(e) => setNewMeal(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="after_meal">{i18n.modal.afterMeal}</option>
                    <option value="before_meal">{i18n.modal.beforeMeal}</option>
                    <option value="with_meal">{i18n.modal.withMeal}</option>
                    <option value="empty_stomach">{i18n.modal.emptyStomach}</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    {i18n.modal.pillsLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPills}
                    onChange={(e) => setNewPills(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  {i18n.modal.notesLabel}
                </label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder={i18n.modal.notesPh}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  {i18n.modal.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  {i18n.modal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
