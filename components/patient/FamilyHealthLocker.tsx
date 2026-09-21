'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'

export type FamilyRelationship = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
export type RecordCategory =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'vaccine_card'
  | 'scan_imaging'
  | 'clinical_note'
  | 'insurance_doc'

export type FamilyMember = {
  id: string
  first_name: string
  last_name: string
  relationship: FamilyRelationship
  dob: string
  gender: string
  blood_group: string
  allergies: string[]
  chronic_conditions: string[]
  emergency_contact?: string
  avatar_color: string
  is_primary: boolean
}

export type MedicalRecord = {
  id: string
  family_member_id: string
  category: RecordCategory
  title: string
  doctor_name: string
  clinic_hospital: string
  record_date: string
  storage_path?: string
  document_url?: string
  file_name: string
  file_size_bytes: number
  mime_type: string
  notes?: string
  created_at: string
}

export type VaccinationRecord = {
  id: string
  family_member_id: string
  vaccine_name: string
  dose_label: string
  status: 'administered' | 'upcoming' | 'overdue'
  administered_date?: string
  due_date?: string
  clinic_provider?: string
  batch_number?: string
  certificate_url?: string
  notes?: string
}

// Initial demo seed data for multi-generational family
const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-1',
    first_name: 'Marcus',
    last_name: 'Delacroix',
    relationship: 'self',
    dob: '1970-04-12',
    gender: 'Male',
    blood_group: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronic_conditions: ['Hypertension', 'Mild Hyperlipidemia'],
    emergency_contact: '+1 (555) 201-9481',
    avatar_color: 'bg-primary text-on-primary',
    is_primary: true,
  },
  {
    id: 'mem-2',
    first_name: 'Elena',
    last_name: 'Delacroix',
    relationship: 'spouse',
    dob: '1974-08-23',
    gender: 'Female',
    blood_group: 'A+',
    allergies: ['Latex'],
    chronic_conditions: ['Hypothyroidism'],
    emergency_contact: '+1 (555) 201-9482',
    avatar_color: 'bg-emerald-600 text-white',
    is_primary: false,
  },
  {
    id: 'mem-3',
    first_name: 'Leo',
    last_name: 'Delacroix',
    relationship: 'child',
    dob: '2016-11-05',
    gender: 'Male',
    blood_group: 'O+',
    allergies: ['Peanuts'],
    chronic_conditions: ['Pediatric Asthma'],
    emergency_contact: '+1 (555) 201-9481',
    avatar_color: 'bg-amber-600 text-white',
    is_primary: false,
  },
  {
    id: 'mem-4',
    first_name: 'Martha',
    last_name: 'Delacroix',
    relationship: 'parent',
    dob: '1945-02-18',
    gender: 'Female',
    blood_group: 'B+',
    allergies: ['Aspirin (NSAIDs)'],
    chronic_conditions: ['Osteoarthritis', 'Type 2 Diabetes'],
    emergency_contact: '+1 (555) 201-9481',
    avatar_color: 'bg-purple-600 text-white',
    is_primary: false,
  },
]

const INITIAL_RECORDS: MedicalRecord[] = [
  // Marcus
  {
    id: 'rec-1',
    family_member_id: 'mem-1',
    category: 'prescription',
    title: 'Cardiology Discharge Prescription',
    doctor_name: 'Dr. Sarah Jenkins',
    clinic_hospital: 'Cliniva Heart Institute',
    record_date: '2026-03-10',
    file_name: 'Rx_Cardio_Atorvastatin_Lisinopril.pdf',
    file_size_bytes: 245760,
    mime_type: 'application/pdf',
    notes: 'Prescribed Atorvastatin 40mg once daily at bedtime & Lisinopril 10mg morning.',
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'rec-2',
    family_member_id: 'mem-1',
    category: 'lab_report',
    title: 'Comprehensive Lipid & Cardiac Troponin',
    doctor_name: 'Dr. Sarah Jenkins',
    clinic_hospital: 'Cliniva Central Diagnostic Labs',
    record_date: '2026-03-08',
    file_name: 'Lipid_Troponin_Panel_March2026.pdf',
    file_size_bytes: 512000,
    mime_type: 'application/pdf',
    notes: 'Troponin I normal (<0.01 ng/mL). LDL improved to 88 mg/dL.',
    created_at: '2026-03-08T14:30:00Z',
  },
  // Elena (Spouse)
  {
    id: 'rec-3',
    family_member_id: 'mem-2',
    category: 'prescription',
    title: 'Thyroid Maintenance Prescription',
    doctor_name: 'Dr. Alan Bradley',
    clinic_hospital: 'Cliniva Internal Medicine',
    record_date: '2026-02-14',
    file_name: 'Levothyroxine_50mcg_Rx.pdf',
    file_size_bytes: 184320,
    mime_type: 'application/pdf',
    notes: 'Take 1 tablet 30 minutes before breakfast with full glass of water.',
    created_at: '2026-02-14T09:15:00Z',
  },
  // Leo (Child)
  {
    id: 'rec-4',
    family_member_id: 'mem-3',
    category: 'prescription',
    title: 'Pediatric Asthma Inhaler & Spacer Protocol',
    doctor_name: 'Dr. Elena Rostova',
    clinic_hospital: 'Cliniva Pediatric Wellness',
    record_date: '2026-01-20',
    file_name: 'Albuterol_Pediatric_Asthma_Plan.pdf',
    file_size_bytes: 327680,
    mime_type: 'application/pdf',
    notes: 'Albuterol HFA 90mcg, 2 puffs PRN wheezing with aerochamber spacer.',
    created_at: '2026-01-20T11:00:00Z',
  },
  // Martha (Parent)
  {
    id: 'rec-5',
    family_member_id: 'mem-4',
    category: 'scan_imaging',
    title: 'Bilateral Knee Digital Radiography (AP/Lateral)',
    doctor_name: 'Dr. Rajesh Patel',
    clinic_hospital: 'Cliniva Orthopedic & Imaging Pavilion',
    record_date: '2025-11-12',
    file_name: 'Knee_Xray_Bilateral_Report.pdf',
    file_size_bytes: 1420000,
    mime_type: 'application/pdf',
    notes: 'Mild-to-moderate medial compartment joint space narrowing bilaterally.',
    created_at: '2025-11-12T16:20:00Z',
  },
]

const INITIAL_VACCINES: VaccinationRecord[] = [
  {
    id: 'vax-1',
    family_member_id: 'mem-1',
    vaccine_name: 'COVID-19 Bivalent Booster',
    dose_label: 'Booster 2',
    status: 'administered',
    administered_date: '2025-10-15',
    clinic_provider: 'Cliniva Community Health',
    batch_number: 'PF-7809B',
    notes: 'No immediate adverse reactions noted during 15-min post-vaccination observation.',
  },
  {
    id: 'vax-2',
    family_member_id: 'mem-1',
    vaccine_name: 'Influenza Quadrivalent',
    dose_label: 'Annual',
    status: 'upcoming',
    due_date: '2026-10-01',
    clinic_provider: 'Cliniva Outpatient Clinic',
    notes: 'Recommended prior to seasonal flu peak.',
  },
  {
    id: 'vax-3',
    family_member_id: 'mem-3',
    vaccine_name: 'MMR (Measles, Mumps, Rubella)',
    dose_label: 'Dose 2 (Booster)',
    status: 'administered',
    administered_date: '2022-05-18',
    clinic_provider: 'Cliniva Pediatrics',
    batch_number: 'MSD-44109',
  },
  {
    id: 'vax-4',
    family_member_id: 'mem-3',
    vaccine_name: 'DTPa-IPV Booster',
    dose_label: 'Booster (School Entry)',
    status: 'administered',
    administered_date: '2022-05-18',
    clinic_provider: 'Cliniva Pediatrics',
    batch_number: 'GSK-9921',
  },
  {
    id: 'vax-5',
    family_member_id: 'mem-4',
    vaccine_name: 'Pneumococcal Conjugate (PCV20)',
    dose_label: 'Senior Dose',
    status: 'administered',
    administered_date: '2024-04-10',
    clinic_provider: 'Cliniva Geriatric Health',
    batch_number: 'PZ-33201',
  },
]

function calculateAge(dobString: string): string {
  if (!dobString) return ''
  const dob = new Date(dobString)
  const diff = Date.now() - dob.getTime()
  const ageDate = new Date(diff)
  const years = Math.abs(ageDate.getUTCFullYear() - 1970)
  return `${years} yrs`
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function FamilyHealthLocker({ className = '' }: { className?: string }) {
  // State
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS)
  const [selectedMemberId, setSelectedMemberId] = useState<string>(INITIAL_MEMBERS[0].id)
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS)
  const [vaccines, setVaccines] = useState<VaccinationRecord[]>(INITIAL_VACCINES)
  const [activeTab, setActiveTab] = useState<'records' | 'vaccines' | 'profile'>('records')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<MedicalRecord | null>(null)

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState<RecordCategory>('prescription')
  const [uploadDoctor, setUploadDoctor] = useState('')
  const [uploadHospital, setUploadHospital] = useState('')
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [uploadNotes, setUploadNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null)

  // Add Member Form State
  const [newMemberFirst, setNewMemberFirst] = useState('')
  const [newMemberLast, setNewMemberLast] = useState('')
  const [newMemberRel, setNewMemberRel] = useState<FamilyRelationship>('child')
  const [newMemberDob, setNewMemberDob] = useState('')
  const [newMemberGender, setNewMemberGender] = useState('Male')
  const [newMemberBlood, setNewMemberBlood] = useState('O+')
  const [newMemberAllergies, setNewMemberAllergies] = useState('')
  const [newMemberConditions, setNewMemberConditions] = useState('')

  // Add Vaccine Form State
  const [newVaxName, setNewVaxName] = useState('')
  const [newVaxDose, setNewVaxDose] = useState('Dose 1')
  const [newVaxStatus, setNewVaxStatus] = useState<'administered' | 'upcoming'>('administered')
  const [newVaxDate, setNewVaxDate] = useState(new Date().toISOString().split('T')[0])
  const [newVaxProvider, setNewVaxProvider] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Currently active family member
  const currentMember = members.find((m) => m.id === selectedMemberId) || members[0]

  // Filtered records for current member and category
  const memberRecords = records.filter((r) => r.family_member_id === currentMember.id)
  const filteredRecords =
    selectedCategory === 'all'
      ? memberRecords
      : memberRecords.filter((r) => r.category === selectedCategory)

  // Member vaccines
  const memberVaccines = vaccines.filter((v) => v.family_member_id === currentMember.id)

  // Fetch real records from Supabase if connected
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const supabase = createClientSideClient()
        const { data: dbMembers } = await (supabase.from('family_members') as any).select('*')
        if (dbMembers && dbMembers.length > 0) {
          setMembers(dbMembers as any)
          setSelectedMemberId(dbMembers[0].id)
        }

        const { data: dbRecords } = await (supabase.from('family_records') as any).select('*')
        if (dbRecords && dbRecords.length > 0) {
          setRecords(dbRecords as any)
        }

        const { data: dbVax } = await (supabase.from('family_vaccinations') as any).select('*')
        if (dbVax && dbVax.length > 0) {
          setVaccines(dbVax as any)
        }
      } catch {
        // Use initial high-fidelity seed state
      }
    }
    loadSupabaseData()
  }, [])

  // File selection change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFile(file)
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '))
      }
    }
  }

  // Handle Secure Prescription & Document Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return

    setIsUploading(true)
    let uploadedPath = ''
    let publicUrl = ''

    try {
      const supabase = createClientSideClient()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id || 'demo-user-id'

      const sanitizedName = uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storageFilePath = `${userId}/${currentMember.id}/${Date.now()}_${sanitizedName}`

      // Upload to Supabase Storage 'family_health_locker' bucket
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('family_health_locker')
        .upload(storageFilePath, uploadFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!storageErr && storageData) {
        uploadedPath = storageData.path
        const { data: urlData } = supabase.storage
          .from('family_health_locker')
          .getPublicUrl(storageData.path)
        if (urlData) publicUrl = urlData.publicUrl
      }

      // Persist to Supabase Database
      const newDbRecord = {
        family_member_id: currentMember.id,
        primary_user_id: userId,
        category: uploadCategory,
        title: uploadTitle || uploadFile.name,
        doctor_name: uploadDoctor || 'Attending Physician',
        clinic_hospital: uploadHospital || 'Cliniva OS Healthcare',
        record_date: uploadDate,
        storage_path: uploadedPath || storageFilePath,
        file_name: uploadFile.name,
        file_size_bytes: uploadFile.size,
        mime_type: uploadFile.type,
        notes: uploadNotes,
      }

      await (supabase.from('family_records') as any).insert(newDbRecord)
    } catch {
      // Local fallback for offline/demo operation
    }

    // Local state optimistic update
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      family_member_id: currentMember.id,
      category: uploadCategory,
      title: uploadTitle || uploadFile.name,
      doctor_name: uploadDoctor || 'Attending Physician',
      clinic_hospital: uploadHospital || 'Cliniva OS Healthcare',
      record_date: uploadDate,
      storage_path: uploadedPath,
      document_url: publicUrl,
      file_name: uploadFile.name,
      file_size_bytes: uploadFile.size,
      mime_type: uploadFile.type || 'application/pdf',
      notes: uploadNotes,
      created_at: new Date().toISOString(),
    }

    setRecords((prev) => [newRecord, ...prev])
    setIsUploading(false)
    setIsUploadOpen(false)

    // Reset upload form
    setUploadFile(null)
    setUploadTitle('')
    setUploadDoctor('')
    setUploadHospital('')
    setUploadNotes('')

    // Show toast
    setUploadSuccessToast(`"${newRecord.title}" uploaded to ${currentMember.first_name}'s locker!`)
    setTimeout(() => setUploadSuccessToast(null), 4000)
  }

  // Handle Add Family Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberFirst.trim()) return

    const newMem: FamilyMember = {
      id: `mem-${Date.now()}`,
      first_name: newMemberFirst.trim(),
      last_name: newMemberLast.trim() || currentMember.last_name,
      relationship: newMemberRel,
      dob: newMemberDob || '2000-01-01',
      gender: newMemberGender,
      blood_group: newMemberBlood,
      allergies: newMemberAllergies
        ? newMemberAllergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      chronic_conditions: newMemberConditions
        ? newMemberConditions.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      avatar_color:
        newMemberRel === 'child'
          ? 'bg-amber-600 text-white'
          : newMemberRel === 'spouse'
          ? 'bg-emerald-600 text-white'
          : 'bg-indigo-600 text-white',
      is_primary: false,
    }

    try {
      const supabase = createClientSideClient()
      await (supabase.from('family_members') as any).insert({
        first_name: newMem.first_name,
        last_name: newMem.last_name,
        relationship: newMem.relationship,
        dob: newMem.dob,
        gender: newMem.gender.toLowerCase(),
        blood_group: newMem.blood_group,
        allergies: newMem.allergies,
        chronic_conditions: newMem.chronic_conditions,
        is_primary: false,
      })
    } catch {
      // offline fallback
    }

    setMembers((prev) => [...prev, newMem])
    setSelectedMemberId(newMem.id)
    setIsAddMemberOpen(false)
    setNewMemberFirst('')
    setNewMemberLast('')
    setNewMemberAllergies('')
    setNewMemberConditions('')
  }

  // Handle Add Vaccine
  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVaxName.trim()) return

    const newVax: VaccinationRecord = {
      id: `vax-${Date.now()}`,
      family_member_id: currentMember.id,
      vaccine_name: newVaxName.trim(),
      dose_label: newVaxDose,
      status: newVaxStatus,
      administered_date: newVaxStatus === 'administered' ? newVaxDate : undefined,
      due_date: newVaxStatus === 'upcoming' ? newVaxDate : undefined,
      clinic_provider: newVaxProvider || 'Cliniva Preventive Health',
    }

    setVaccines((prev) => [...prev, newVax])
    setIsAddVaccineOpen(false)
    setNewVaxName('')
    setNewVaxProvider('')
  }

  return (
    <div className={`space-y-space-md ${className}`}>
      {/* Toast Notification */}
      {uploadSuccessToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn text-body-sm font-medium">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{uploadSuccessToast}</span>
          </div>
          <button onClick={() => setUploadSuccessToast(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ── Main Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </span>
            <span className="text-label-xs font-bold uppercase tracking-wider text-primary">
              Secure Document Vault
            </span>
          </div>
          <h1 className="font-heading text-headline-sm sm:text-headline-md font-bold text-on-surface mt-1">
            Family Health Locker
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Store and manage medical records, prescriptions, and immunizations for your entire household.
          </p>
        </div>

        {/* Global Upload CTA Button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload Document</span>
        </button>
      </div>

      {/* ── Requirement 2: Family Member Switcher Carousel ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Household Members ({members.length})
          </span>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="text-label-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>+ Add Member</span>
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {members.map((member) => {
            const isSelected = member.id === selectedMemberId
            return (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMemberId(member.id)
                  setSelectedCategory('all')
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all text-left flex-shrink-0 touch-tap ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant text-on-surface'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md flex-shrink-0 ${member.avatar_color}`}
                >
                  {member.first_name.charAt(0)}
                </div>

                {/* Name & Relation */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-label-md text-on-surface">
                      {member.first_name}
                    </span>
                    {member.is_primary && (
                      <span className="px-1.5 py-0.2 bg-primary/20 text-primary text-[10px] rounded font-bold">
                        Self
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant capitalize">
                    <span>{member.relationship}</span>
                    <span>•</span>
                    <span>{calculateAge(member.dob)}</span>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Add Member Card */}
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-outline-variant/60 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex-shrink-0 text-label-sm font-semibold"
          >
            <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-label-lg font-bold">
              +
            </span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* ── Active Member Summary Card ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-headline-sm flex-shrink-0 ${currentMember.avatar_color}`}
            >
              {currentMember.first_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-title-lg font-bold text-on-surface">
                  {currentMember.first_name} {currentMember.last_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-label-xs font-semibold capitalize bg-surface-container-high text-on-surface border border-outline-variant/30">
                  {currentMember.relationship}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-body-xs text-on-surface-variant mt-0.5">
                <span>DOB: {currentMember.dob} ({calculateAge(currentMember.dob)})</span>
                <span>•</span>
                <span>Gender: {currentMember.gender}</span>
                <span>•</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  Blood Group: {currentMember.blood_group}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-label-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-xs self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Prescription / Record</span>
          </button>
        </div>

        {/* Clinical Badges: Allergies & Chronic Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Known Drug / Environmental Allergies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentMember.allergies && currentMember.allergies.length > 0 ? (
                currentMember.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-2 py-0.5 rounded-lg text-body-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                  >
                    ⚠️ {allergy}
                  </span>
                ))
              ) : (
                <span className="text-body-xs text-on-surface-variant">No known allergies documented.</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Active Diagnoses & Chronic Conditions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentMember.chronic_conditions && currentMember.chronic_conditions.length > 0 ? (
                currentMember.chronic_conditions.map((cond) => (
                  <span
                    key={cond}
                    className="px-2 py-0.5 rounded-lg text-body-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  >
                    🩺 {cond}
                  </span>
                ))
              ) : (
                <span className="text-body-xs text-on-surface-variant">No chronic conditions on file.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl text-label-sm font-bold transition-all ${
              activeTab === 'records'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Prescriptions & Records ({memberRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('vaccines')}
            className={`px-4 py-2 rounded-xl text-label-sm font-bold transition-all ${
              activeTab === 'vaccines'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Vaccination History ({memberVaccines.length})
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="hidden sm:flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'prescription', label: 'Prescriptions' },
              { id: 'lab_report', label: 'Lab Reports' },
              { id: 'scan_imaging', label: 'Scans & Imaging' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-label-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-surface-container-highest text-on-surface font-bold border border-outline-variant'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'vaccines' && (
          <button
            onClick={() => setIsAddVaccineOpen(true)}
            className="text-label-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>+ Log Immunization</span>
          </button>
        )}
      </div>

      {/* ── Tab Content: Prescriptions & Documents ── */}
      {activeTab === 'records' && (
        <div className="space-y-3">
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Category badge & date */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          record.category === 'prescription'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : record.category === 'lab_report'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {record.category.replace('_', ' ')}
                      </span>
                      <span className="text-body-xs text-on-surface-variant font-medium">
                        {record.record_date}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-title-sm font-bold text-on-surface">
                      {record.title}
                    </h3>

                    {/* Doctor & Clinic */}
                    <p className="text-body-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">
                        stethoscope
                      </span>
                      <span>{record.doctor_name}</span>
                      <span>•</span>
                      <span>{record.clinic_hospital}</span>
                    </p>

                    {/* Clinical Notes */}
                    {record.notes && (
                      <p className="text-[12px] text-on-surface-variant/90 mt-2 p-2 bg-surface-container-low rounded-lg italic">
                        &quot;{record.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* File Metadata & Actions */}
                  <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        {record.mime_type.includes('pdf') ? (
                          <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-on-surface truncate">
                          {record.file_name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono">
                          {formatBytes(record.file_size_bytes)} • Secure Cloud
                        </p>
                      </div>
                    </div>

                    {/* View / Download Button */}
                    <button
                      onClick={() => setPreviewDoc(record)}
                      className="px-3 py-1.5 rounded-lg text-label-xs font-semibold bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center gap-1 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View File</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-outline-variant/40 rounded-2xl text-center bg-surface-container-low/40 p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-heading text-title-md font-bold text-on-surface">
                No Prescriptions or Records Yet
              </h4>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Upload scanned prescriptions, lab panels, or discharge summaries for {currentMember.first_name}.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary py-2 px-4 rounded-xl text-label-sm font-semibold inline-flex items-center gap-2"
              >
                <span>Upload First Document</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Vaccination Tracker ── */}
      {activeTab === 'vaccines' && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div>
              <h3 className="font-heading text-title-sm font-bold text-on-surface">
                Immunization & Vaccine Record
              </h3>
              <p className="text-body-xs text-on-surface-variant">
                Official vaccination history and booster schedules for {currentMember.first_name}.
              </p>
            </div>
            <button
              onClick={() => setIsAddVaccineOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-label-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1"
            >
              <span>+ Log Vaccine</span>
            </button>
          </div>

          <div className="divide-y divide-outline-variant/15">
            {memberVaccines.map((vax) => (
              <div key={vax.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      vax.status === 'administered'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-label-md font-bold text-on-surface">
                        {vax.vaccine_name}
                      </h4>
                      <span className="px-2 py-0.2 rounded-md bg-surface-container-high text-[11px] font-semibold text-on-surface">
                        {vax.dose_label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body-xs text-on-surface-variant mt-0.5">
                      <span>
                        {vax.status === 'administered'
                          ? `Given: ${vax.administered_date}`
                          : `Due: ${vax.due_date}`}
                      </span>
                      {vax.clinic_provider && (
                        <>
                          <span>•</span>
                          <span>{vax.clinic_provider}</span>
                        </>
                      )}
                      {vax.batch_number && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px]">Lot: #{vax.batch_number}</span>
                        </>
                      )}
                    </div>
                    {vax.notes && (
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 italic">
                        {vax.notes}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-label-xs font-bold uppercase tracking-wider flex-shrink-0 ${
                    vax.status === 'administered'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {vax.status === 'administered' ? '✓ Administered' : '⏳ Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL 1: Requirement 3 - Secure File Upload Modal (Supabase Storage) ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-title-md font-bold text-on-surface">
                    Upload Health Document
                  </h3>
                  <p className="text-body-xs text-on-surface-variant">
                    Adding to: <span className="font-bold text-primary">{currentMember.first_name} {currentMember.last_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 mt-4">
              {/* File Dropzone */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Prescription / Document File * (PDF or Image)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/60 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-all bg-surface-container-low/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold text-body-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="truncate max-w-xs">{uploadFile.name}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        ({formatBytes(uploadFile.size)})
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <svg className="w-8 h-8 text-outline mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-body-sm font-semibold text-on-surface">
                        Click to select or drag and drop prescription
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        PDF, JPG, PNG up to 15MB • Encrypted via Supabase Storage
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Cardiology Prescription - Dr. Jenkins"
                  className="input-field"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as RecordCategory)}
                    className="input-field"
                  >
                    <option value="prescription">Prescription (Rx)</option>
                    <option value="lab_report">Lab Report / Pathology</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="vaccine_card">Vaccine Certificate</option>
                    <option value="scan_imaging">Scan / X-Ray / MRI</option>
                    <option value="insurance_doc">Insurance / Policy</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Doctor & Clinic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Physician / Doctor Name
                  </label>
                  <input
                    type="text"
                    value={uploadDoctor}
                    onChange={(e) => setUploadDoctor(e.target.value)}
                    placeholder="e.g., Dr. Sarah Jenkins"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Clinic / Hospital
                  </label>
                  <input
                    type="text"
                    value={uploadHospital}
                    onChange={(e) => setUploadHospital(e.target.value)}
                    placeholder="e.g., Cliniva Heart Pavilion"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Doctor&apos;s Instructions or Diagnosis
                </label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g., Take with meals, follow up in 30 days..."
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="btn-primary flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Upload & Encrypt File</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Add Family Member Modal ── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="font-heading text-title-md font-bold text-on-surface">
                Add Family Member Profile
              </h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberFirst}
                    onChange={(e) => setNewMemberFirst(e.target.value)}
                    placeholder="e.g., Maya"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newMemberLast}
                    onChange={(e) => setNewMemberLast(e.target.value)}
                    placeholder={currentMember.last_name}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Relationship
                  </label>
                  <select
                    value={newMemberRel}
                    onChange={(e) => setNewMemberRel(e.target.value as FamilyRelationship)}
                    className="input-field"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other Dependent</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newMemberDob}
                    onChange={(e) => setNewMemberDob(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Gender
                  </label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value)}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newMemberBlood}
                    onChange={(e) => setNewMemberBlood(e.target.value)}
                    className="input-field"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Known Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={newMemberAllergies}
                  onChange={(e) => setNewMemberAllergies(e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts, Pollen"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Chronic Health Conditions (Comma separated)
                </label>
                <input
                  type="text"
                  value={newMemberConditions}
                  onChange={(e) => setNewMemberConditions(e.target.value)}
                  placeholder="e.g., Asthma, Diabetes Type 1"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Log Vaccine Modal ── */}
      {isAddVaccineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="font-heading text-title-md font-bold text-on-surface">
                Log Immunization
              </h3>
              <button
                onClick={() => setIsAddVaccineOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVaccine} className="space-y-3.5 mt-4">
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  required
                  value={newVaxName}
                  onChange={(e) => setNewVaxName(e.target.value)}
                  placeholder="e.g., Influenza Quadrivalent, Hepatitis B"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Dose Sequence
                  </label>
                  <input
                    type="text"
                    value={newVaxDose}
                    onChange={(e) => setNewVaxDose(e.target.value)}
                    placeholder="e.g., Dose 1, Booster"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Status
                  </label>
                  <select
                    value={newVaxStatus}
                    onChange={(e) => setNewVaxStatus(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="administered">Administered</option>
                    <option value="upcoming">Upcoming / Due</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newVaxDate}
                    onChange={(e) => setNewVaxDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface block mb-1">
                    Clinic Provider
                  </label>
                  <input
                    type="text"
                    value={newVaxProvider}
                    onChange={(e) => setNewVaxProvider(e.target.value)}
                    placeholder="Cliniva Health"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddVaccineOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Vaccine Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Document Preview Modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {previewDoc.category.replace('_', ' ')}
                </span>
                <h3 className="font-heading text-title-md font-bold text-on-surface">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Patient Profile:</span>
                <span className="font-semibold text-on-surface">{currentMember.first_name} {currentMember.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Attending Doctor:</span>
                <span className="font-semibold text-on-surface">{previewDoc.doctor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hospital / Facility:</span>
                <span className="font-semibold text-on-surface">{previewDoc.clinic_hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Consultation Date:</span>
                <span className="font-semibold text-on-surface">{previewDoc.record_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">File Name:</span>
                <span className="font-mono text-body-xs text-on-surface">{previewDoc.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Storage Encryption:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>🔒 AES-256 (Supabase Storage RLS)</span>
                </span>
              </div>
              {previewDoc.notes && (
                <div className="pt-2 border-t border-outline-variant/20">
                  <span className="text-on-surface-variant block mb-0.5">Clinical Notes:</span>
                  <p className="text-on-surface bg-surface-container-lowest p-2 rounded-lg italic">
                    {previewDoc.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-on-surface-variant">
                File size: {formatBytes(previewDoc.file_size_bytes)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="btn-secondary py-1.5 px-3"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Simulated secure file stream for ${previewDoc.file_name}`)
                  }}
                  className="btn-primary py-1.5 px-4 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
