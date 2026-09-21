'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'

type Props = {
  slug: string
  userName: string
}

const DOCTOR_ROSTER = [
  { name: 'Dr. Sarah Jenkins, MD', specialty: 'Cardiovascular Medicine', room: 'Suite 304 - Exam B', status: 'In Consultation', activePatients: 6, dutyHours: '08:00 - 16:00' },
  { name: 'Dr. Alan Bradley, MD', specialty: 'Internal Medicine / OPD', room: 'Suite 201 - Exam A', status: 'Available', activePatients: 2, dutyHours: '09:00 - 17:00' },
  { name: 'Dr. Emily Watson, MD', specialty: 'Pediatrics & Adolescent', room: 'Suite 108', status: 'In Consultation', activePatients: 4, dutyHours: '08:00 - 14:00' },
  { name: 'Dr. Rajesh Patel, MD', specialty: 'Orthopedics & Sports Med', room: 'Suite 310', status: 'On Break', activePatients: 0, dutyHours: '10:00 - 18:00' },
]

export default function FrontDeskSubScreens({ slug, userName }: Props) {
  const { queue, setRegisterOpen, callNextPatient, addQueuePatient } = useClinicRealtime()
  const [searchTerm, setSearchTerm] = useState('')
  const [ticketPrinted, setTicketPrinted] = useState<number | null>(null)

  // Direct fast-register form state
  const [regName, setRegName] = useState('')
  const [regAge, setRegAge] = useState('')
  const [regComplaint, setRegComplaint] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regAge.trim()) return
    addQueuePatient({
      name: regName,
      age: regAge,
      complaint: regComplaint || 'Routine examination',
      status: 'waiting',
      priority: 'routine',
    })
    setRegSuccess(true)
    setRegName('')
    setRegAge('')
    setRegComplaint('')
    setTimeout(() => setRegSuccess(false), 4000)
  }

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      <RegisterPatientModal />

      {/* ── 1. PATIENT SEARCH ── */}
      {slug === 'search' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="Master Patient Index Search"
            badge="National ID / MRN"
            description="Lookup registered hospital records across Outpatient, Emergency, and Inpatient admissions."
            actions={
              <button onClick={() => setRegisterOpen(true)} className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>New Registration</span>
              </button>
            }
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
            <div className="relative max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by full name, phone number, national ID, or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { mrn: '00482910', name: 'Marcus Delacroix', dob: '1970-04-12 (54y)', phone: '+1 (555) 201-9481', address: '124 Elm Street, Metro Health Dist', lastVisit: 'Today', visits: 14 },
                { mrn: '00482911', name: 'Priya Mehta', dob: '1983-09-24 (41y)', phone: '+1 (555) 349-1120', address: '88 Riverbed Way, North Hills', lastVisit: 'Today', visits: 6 },
                { mrn: '00482912', name: 'George Tanner', dob: '1957-11-03 (67y)', phone: '+1 (555) 884-9021', address: '402 Pinecrest Ave, West End', lastVisit: '3 days ago', visits: 22 },
                { mrn: '00482913', name: 'Aisha Nkosi', dob: '1995-02-18 (29y)', phone: '+1 (555) 441-2983', address: '710 Boulevard South', lastVisit: '1 week ago', visits: 3 },
              ].filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm) || p.mrn.includes(searchTerm)).map((p) => (
                <div key={p.mrn} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface text-body-md">{p.name}</span>
                    <span className="text-label-sm font-mono text-outline">#{p.mrn}</span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant space-y-0.5 mt-2">
                    <div>DOB: {p.dob}</div>
                    <div>Phone: {p.phone}</div>
                    <div>Address: {p.address}</div>
                    <div className="text-primary font-medium mt-1">Total Visits: {p.visits} • Last: {p.lastVisit}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                    <button onClick={() => setRegisterOpen(true)} className="btn-secondary text-label-sm py-1 px-3">
                      Check-In
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-surface-container text-label-sm hover:bg-surface-container-high">
                      Print ID Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── 2. NEW REGISTRATION ── */}
      {slug === 'register' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="Direct Patient Intake & Registration"
            description="Enroll new outpatient, capture basic demographics, assign triage category and immediately allocate an OPD queue token."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm max-w-3xl">
            {regSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Patient registered and queued successfully! Live token issued.</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Age / Gender *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45M or 32F"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe headache, fever, cough for 2 days"
                  value={regComplaint}
                  onChange={(e) => setRegComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Department</label>
                  <select className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm">
                    <option>Cardiology (Dr. Sarah Jenkins)</option>
                    <option>General Medicine (Dr. Alan Bradley)</option>
                    <option>Pediatrics (Dr. Emily Watson)</option>
                    <option>Orthopedics (Dr. Rajesh Patel)</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Triage Priority</label>
                  <select className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm">
                    <option>Routine OPD</option>
                    <option>Urgent (Priority Check)</option>
                    <option>Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRegisterOpen(true)} className="btn-secondary">
                  Open Advanced Intake Modal
                </button>
                <button type="submit" className="btn-primary">
                  Issue Token & Add to Queue
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── 3. TOKEN ISSUANCE ── */}
      {slug === 'tokens' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="OPD Token Generation & Live Queue Board"
            badge="Live OPD"
            badgeVariant="live"
            description="Real-time token sequence generator and acoustic bell calling station."
            actions={
              <button onClick={() => callNextPatient()} className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                <span>Announce Next Token</span>
              </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            <div className="lg:col-span-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Latest Active Token</span>
              <div className="text-7xl font-heading font-black text-primary">
                #{queue[queue.length - 1]?.token ?? 12}
              </div>
              <p className="text-body-sm text-on-surface-variant">Printed at OPD Terminal A</p>
              <button onClick={() => setTicketPrinted(queue[queue.length - 1]?.token ?? 12)} className="btn-secondary w-full justify-center">
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print Duplicate Slip</span>
              </button>
              {ticketPrinted && (
                <div className="text-label-sm text-emerald-700 font-medium">Slip #{ticketPrinted} sent to thermal printer!</div>
              )}
            </div>

            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
              <span className="text-label-lg font-semibold text-on-surface">Queue Waiting List</span>
              <div className="divide-y divide-outline-variant/20">
                {queue.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-bold text-primary">
                        #{p.token}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{p.name} ({p.age})</div>
                        <div className="text-body-sm text-on-surface-variant">{p.complaint}</div>
                      </div>
                    </div>
                    <span className="text-label-sm font-semibold px-2.5 py-1 rounded-full bg-secondary-fixed text-on-primary-fixed-variant">
                      {p.wait}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 4. APPOINTMENTS ── */}
      {slug === 'appointments' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="OPD Appointment Booking Desk"
            badge="32 Today"
            description="Manage doctor schedules, pre-booked slots, walk-ins, and consultation fee billing."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-semibold text-on-surface text-body-md">Doctor Slot Allocation Calendar</div>
              <div className="text-label-sm text-on-surface-variant">Morning Shift (08:00 - 13:00)</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {['08:30 AM (Booked)', '09:00 AM (Booked)', '09:30 AM (Free)', '10:00 AM (Booked)', '10:30 AM (Free)', '11:00 AM (Free)', '11:30 AM (Booked)', '12:00 PM (Free)'].map((slot, i) => (
                <div key={i} className={`p-3 rounded-xl border text-center font-medium text-body-sm cursor-pointer transition-colors ${slot.includes('Booked') ? 'bg-surface-container-low/60 border-outline-variant/30 text-on-surface-variant' : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'}`}>
                  {slot}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── 5. DOCTOR AVAILABILITY ── */}
      {slug === 'availability' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="Physician Duty Roster & Clinic Availability"
            badge="Active OPD"
            description="Real-time status of doctors in OPD exam rooms, consultation suites, and rounds."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCTOR_ROSTER.map((doc) => (
              <div key={doc.name} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-on-surface text-body-md">{doc.name}</h3>
                    <p className="text-body-sm text-primary font-medium">{doc.specialty}</p>
                    <p className="text-label-sm text-on-surface-variant mt-1">{doc.room}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${doc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : doc.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                    {doc.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Shift: {doc.dutyHours}</span>
                  <span className="font-semibold text-on-surface">{doc.activePatients} queued</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 6. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Front Desk"
            parentHref="/front-desk"
            title="Front Desk Configuration"
            description="Configure token slip formats, maximum daily queue thresholds, and reception desk peripherals."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Max Daily Tokens Limit</label>
              <input type="number" defaultValue={120} className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Default Consultation Fee</label>
              <input type="text" defaultValue="$50.00" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <button className="btn-primary">Save Settings</button>
          </div>
        </>
      )}
    </div>
  )
}
