'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import StartConsultationModal from '@/components/modals/StartConsultationModal'
import RecordVitalsModal from '@/components/modals/RecordVitalsModal'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import StatusBadge from '@/components/ui/StatusBadge'
import { usePatientByMrn, usePatientVitals, useActivePrescriptions } from '@/hooks/useClinicData'
import { SkeletonCard, SkeletonRow } from '@/components/ui/LoadingSkeleton'

// ─── Shared Data ─────────────────────────────────────────────────────────────

const PATIENTS = [
  { mrn: '00482910', name: 'Marcus Delacroix', age: '54M', dob: '1970-04-12', blood: 'O+', phone: '+1 (555) 201-9481', condition: 'Hypertensive Heart Disease', bp: '128/82', hr: '74', spo2: '98%', temp: '98.4°F', lastVisit: 'Today', status: 'In Consultation', triage: 'Urgent', allergy: 'Penicillin, Sulfa', weight: '82 kg', height: '178 cm', prescriptions: ['Atorvastatin 40mg', 'Lisinopril 10mg'], history: ['Hypertension (2018)', 'MI (2021) - Stent Placed', 'GERD (2019)'] },
  { mrn: '00482911', name: 'Priya Mehta', age: '41F', dob: '1983-09-24', blood: 'B+', phone: '+1 (555) 349-1120', condition: 'Bilateral Pneumonia', bp: '118/76', hr: '92', spo2: '95%', temp: '100.2°F', lastVisit: 'Today', status: 'Waiting', triage: 'Urgent', allergy: 'Aspirin', weight: '58 kg', height: '162 cm', prescriptions: ['Amoxicillin-Clavulanate 875mg'], history: ['Recurrent Bronchitis (2022, 2023)', 'Asthma (childhood)'] },
  { mrn: '00482912', name: 'George Tanner', age: '67M', dob: '1957-11-03', blood: 'A+', phone: '+1 (555) 884-9021', condition: 'Type 2 Diabetes Mellitus', bp: '134/86', hr: '78', spo2: '97%', temp: '98.6°F', lastVisit: '3 days ago', status: 'Follow-up', triage: 'Routine', allergy: 'None Known', weight: '95 kg', height: '175 cm', prescriptions: ['Metformin HCl 1000mg', 'Glimepiride 2mg'], history: ['T2DM (2015)', 'Obesity (BMI 31)', 'Knee Osteoarthritis (2020)'] },
  { mrn: '00482913', name: 'Aisha Nkosi', age: '29F', dob: '1995-02-18', blood: 'A-', phone: '+1 (555) 441-2983', condition: 'Supraventricular Tachycardia', bp: '110/70', hr: '110', spo2: '99%', temp: '98.2°F', lastVisit: '1 week ago', status: 'Checked In', triage: 'Urgent', allergy: 'Ibuprofen', weight: '62 kg', height: '168 cm', prescriptions: ['Metoprolol Tartrate 25mg'], history: ['SVT — First Presentation (2023)', 'No Prior Cardiac History'] },
  { mrn: '00482914', name: 'David Chen', age: '52M', dob: '1972-08-30', blood: 'AB+', phone: '+1 (555) 672-0091', condition: 'Dyslipidemia & Hypertension', bp: '142/90', hr: '80', spo2: '98%', temp: '98.6°F', lastVisit: '2 weeks ago', status: 'Active', triage: 'Routine', allergy: 'Latex', weight: '88 kg', height: '172 cm', prescriptions: ['Rosuvastatin 20mg', 'Aspirin 81mg'], history: ['Dyslipidemia (2020)', 'Stage 1 Hypertension (2021)', 'Appendectomy (2005)'] },
  { mrn: '00482915', name: 'Maria Sanchez', age: '38F', dob: '1986-06-15', blood: 'O-', phone: '+1 (555) 912-3847', condition: 'Annual Screening', bp: '120/80', hr: '72', spo2: '99%', temp: '98.4°F', lastVisit: '1 month ago', status: 'Completed', triage: 'Routine', allergy: 'None Known', weight: '65 kg', height: '165 cm', prescriptions: ['Vitamin D3 2000IU'], history: ['Appendectomy (2012)', 'No Chronic Conditions'] },
]

// ─── Patient Detail Page ──────────────────────────────────────────────────────
function PatientDetailView({ mrn }: { mrn: string }) {
  const patient = PATIENTS.find(p => p.mrn === mrn)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'prescriptions' | 'labs'>('overview')
  const { setConsultOpen, setVitalsOpen } = useClinicRealtime()

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-2">
        <span className="material-symbols-outlined text-[48px] text-outline">person_off</span>
        <p className="font-semibold text-body-lg">Patient MRN #{mrn} not found in registry.</p>
        <Link href="/doctor/patients" className="text-primary underline text-body-sm">Back to Patient List</Link>
      </div>
    )
  }

  return (
    <div className="space-y-space-md">
      <StartConsultationModal />
      <RecordVitalsModal />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        <Link href="/doctor" className="hover:text-primary">Doctor Workspace</Link>
        <span>/</span>
        <Link href="/doctor/patients" className="hover:text-primary">Patients</Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{patient.name}</span>
      </div>

      {/* Patient Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm flex flex-col sm:flex-row items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-headline-md flex-shrink-0">
          {patient.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-headline-md font-bold text-on-surface">{patient.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-bold ${patient.triage === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {patient.triage}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-body-sm pt-1">
            <div><span className="text-outline">MRN:</span> <strong className="font-mono">{patient.mrn}</strong></div>
            <div><span className="text-outline">Age/Sex:</span> <strong>{patient.age}</strong></div>
            <div><span className="text-outline">DOB:</span> <strong>{patient.dob}</strong></div>
            <div><span className="text-outline">Blood:</span> <strong className="text-red-700">{patient.blood}</strong></div>
            <div><span className="text-outline">Phone:</span> <strong>{patient.phone}</strong></div>
            <div><span className="text-outline">Weight:</span> <strong>{patient.weight}</strong></div>
            <div><span className="text-outline">Height:</span> <strong>{patient.height}</strong></div>
            <div className="col-span-2 sm:col-span-1"><span className="text-outline">Allergy:</span> <strong className="text-red-600">{patient.allergy}</strong></div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setConsultOpen(true)} className="btn-primary text-label-sm py-1.5 px-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
            Start Consult
          </button>
          <button onClick={() => setVitalsOpen(true)} className="btn-secondary text-label-sm py-1.5 px-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
            Record Vitals
          </button>
        </div>
      </div>

      {/* Live Vitals Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Blood Pressure', value: patient.bp, unit: 'mmHg', icon: 'favorite', ok: true },
          { label: 'Heart Rate', value: patient.hr, unit: 'bpm', icon: 'cardiology', ok: parseInt(patient.hr) < 100 },
          { label: 'SpO2', value: patient.spo2, unit: '', icon: 'air', ok: parseInt(patient.spo2) >= 96 },
          { label: 'Temperature', value: patient.temp, unit: '', icon: 'device_thermostat', ok: parseFloat(patient.temp) < 99.5 },
        ].map(v => (
          <div key={v.label} className={`p-3.5 rounded-xl border shadow-sm ${v.ok ? 'bg-surface-container-lowest border-outline-variant/30' : 'bg-red-50/40 border-red-200'}`}>
            <span className="text-label-sm text-on-surface-variant font-medium">{v.label}</span>
            <div className="font-bold font-mono text-headline-sm text-on-surface mt-1">{v.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="flex border-b border-outline-variant/20">
          {(['overview', 'history', 'prescriptions', 'labs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-label-md font-semibold capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab === 'labs' ? 'Lab Results' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="p-4 bg-surface-container-low/50 rounded-xl">
                <h3 className="font-semibold text-on-surface text-body-md mb-2">Primary Diagnosis</h3>
                <p className="text-body-md font-medium text-primary">{patient.condition}</p>
              </div>
              <div className="p-4 bg-surface-container-low/50 rounded-xl">
                <h3 className="font-semibold text-on-surface text-body-md mb-2">Attending Physician Notes</h3>
                <p className="text-body-sm text-on-surface-variant">Patient presenting with {patient.condition.toLowerCase()}. Vitals within acceptable range. Continue current management plan with scheduled follow-up in 2 weeks.</p>
              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {patient.history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/40">
                  <span className="material-symbols-outlined text-outline text-[18px]">history</span>
                  <span className="text-body-sm text-on-surface font-medium">{h}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'prescriptions' && (
            <div className="space-y-2">
              {patient.prescriptions.map((rx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/40">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">prescriptions</span>
                    <span className="text-body-sm font-semibold text-on-surface">{rx}</span>
                  </div>
                  <span className="text-label-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Active</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'labs' && (
            <div className="text-body-sm text-on-surface-variant p-4 bg-surface-container-low/50 rounded-xl">
              <Link href="/doctor/lab-results" className="text-primary font-semibold underline">View full lab results panel →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Zod Schema for appointment form ─────────────────────────────────────────
const AppointmentSchema = z.object({
  patientQuery: z.string().min(2, 'Enter at least 2 characters'),
  doctor: z.string().min(1, 'Please select a doctor'),
  appointmentType: z.string().min(1, 'Please select a type'),
  date: z.string().min(1, 'Please pick a date').refine(d => new Date(d) >= new Date(new Date().toDateString()), { message: 'Date cannot be in the past' }),
  time: z.string().min(1, 'Please select a time slot'),
})
type AppointmentFormData = z.infer<typeof AppointmentSchema>

// ─── New Appointment Scheduling ──────────────────────────────────────────────
function NewAppointmentView() {
  const [done, setDone] = useState<AppointmentFormData | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({ resolver: zodResolver(AppointmentSchema) })

  const onSubmit = async (data: AppointmentFormData) => {
    // TODO: insert into Supabase appointments table
    await new Promise(r => setTimeout(r, 600)) // simulate network
    setDone(data)
  }

  return (
    <div className="space-y-space-md">
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
        <Link href="/doctor" className="hover:text-primary">Doctor Workspace</Link>
        <span>/</span>
        <Link href="/doctor/appointments" className="hover:text-primary">Appointments</Link>
        <span>/</span>
        <span className="font-semibold text-on-surface">Book New</span>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm max-w-2xl">
        <h1 className="font-heading text-headline-md font-bold text-on-surface mb-5">Schedule New Appointment</h1>

        {done ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-emerald-700 text-[36px]">check_circle</span>
            </div>
            <h2 className="font-semibold text-on-surface text-body-lg">Appointment Confirmed!</h2>
            <p className="text-body-sm text-on-surface-variant">{done.patientQuery} scheduled with {done.doctor} on {done.date} at {done.time}.</p>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/doctor/appointments" className="btn-secondary">Back to Schedule</Link>
              <button onClick={() => { reset(); setDone(null) }} className="btn-primary">Book Another</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Patient Name / MRN *</label>
              <input type="text" placeholder="e.g. Marcus Delacroix or MRN 00482910" {...register('patientQuery')} className={`w-full px-3 py-2 bg-surface-container-low rounded-xl border text-body-sm ${errors.patientQuery ? 'border-error' : 'border-outline-variant/30'}`} />
              {errors.patientQuery && <p className="text-label-sm text-error mt-1">{errors.patientQuery.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Attending Doctor *</label>
                <select {...register('doctor')} className={`w-full px-3 py-2 bg-surface-container-low rounded-xl border text-body-sm ${errors.doctor ? 'border-error' : 'border-outline-variant/30'}`}>
                  <option value="">Select Doctor</option>
                  <option>Dr. Sarah Jenkins, MD (Cardiology)</option>
                  <option>Dr. Alan Bradley, MD (General)</option>
                  <option>Dr. Emily Watson, MD (Pediatrics)</option>
                  <option>Dr. Rajesh Patel, MD (Orthopedics)</option>
                </select>
                {errors.doctor && <p className="text-label-sm text-error mt-1">{errors.doctor.message}</p>}
              </div>
              <div>
                <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Appointment Type *</label>
                <select {...register('appointmentType')} className={`w-full px-3 py-2 bg-surface-container-low rounded-xl border text-body-sm ${errors.appointmentType ? 'border-error' : 'border-outline-variant/30'}`}>
                  <option value="">Select Type</option>
                  <option>First Visit / New OPD</option>
                  <option>Follow-up Consultation</option>
                  <option>Specialist Referral</option>
                  <option>Emergency Walk-In</option>
                </select>
                {errors.appointmentType && <p className="text-label-sm text-error mt-1">{errors.appointmentType.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Preferred Date *</label>
                <input type="date" {...register('date')} className={`w-full px-3 py-2 bg-surface-container-low rounded-xl border text-body-sm ${errors.date ? 'border-error' : 'border-outline-variant/30'}`} />
                {errors.date && <p className="text-label-sm text-error mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Preferred Time Slot *</label>
                <select {...register('time')} className={`w-full px-3 py-2 bg-surface-container-low rounded-xl border text-body-sm ${errors.time ? 'border-error' : 'border-outline-variant/30'}`}>
                  <option value="">Select Slot</option>
                  <option>08:30 AM</option>
                  <option>09:00 AM</option>
                  <option>09:30 AM</option>
                  <option>10:00 AM</option>
                  <option>10:30 AM</option>
                  <option>11:00 AM</option>
                  <option>11:30 AM</option>
                  <option>02:00 PM</option>
                  <option>02:30 PM</option>
                  <option>03:00 PM</option>
                </select>
                {errors.time && <p className="text-label-sm text-error mt-1">{errors.time.message}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Link href="/doctor/appointments" className="btn-secondary">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                {isSubmitting && <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />}
                Confirm & Book Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Root Export: handles any depth of routing ────────────────────────────────
type Props = {
  segments: string[]
  userName: string
}

export default function DoctorDeepRoutes({ segments, userName }: Props) {
  const [firstSeg, secondSeg] = segments

  // /doctor/patients/[mrn] — individual patient chart
  if (firstSeg === 'patients' && secondSeg) {
    return <PatientDetailView mrn={secondSeg} />
  }

  // /doctor/appointments/new — new appointment scheduling
  if (firstSeg === 'appointments' && secondSeg === 'new') {
    return <NewAppointmentView />
  }

  // Everything else: fall back to a clean "coming soon" placeholder
  const routeLabel = segments.join(' › ')
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-[36px]">construction</span>
      </div>
      <h2 className="font-heading text-headline-md font-semibold text-on-surface">Feature Coming Soon</h2>
      <p className="text-body-md text-on-surface-variant max-w-sm">
        The <strong>{routeLabel}</strong> section is currently under development for this workspace.
      </p>
      <Link href="/doctor" className="btn-secondary inline-flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Doctor Dashboard
      </Link>
    </div>
  )
}
