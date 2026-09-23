'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Calendar,
  UserPlus,
  FileText,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity,
  Building2,
  Stethoscope,
  BedDouble,
  Pill,
  Receipt,
  ShieldCheck,
  ChevronRight,
  X,
  Filter,
  Users,
  Home,
  SlidersHorizontal,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface Appointment {
  id: string
  time: string
  patientName: string
  uhid: string
  age: number
  gender: 'M' | 'F' | 'Other'
  doctor: string
  department: string
  type: 'General OPD' | 'Follow-up' | 'Review' | 'Consultation'
  status: 'waiting' | 'in_consultation' | 'completed' | 'scheduled'
  tokenNumber: number
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:00 AM',
    patientName: 'Eleanor Vance',
    uhid: 'UHID-2026-8910',
    age: 42,
    gender: 'F',
    doctor: 'Dr. Sarah Mitchell',
    department: 'Internal Medicine',
    type: 'Follow-up',
    status: 'in_consultation',
    tokenNumber: 101,
  },
  {
    id: 'apt-2',
    time: '09:15 AM',
    patientName: 'David Chen',
    uhid: 'UHID-2026-8914',
    age: 58,
    gender: 'M',
    doctor: 'Dr. Sarah Mitchell',
    department: 'Internal Medicine',
    type: 'General OPD',
    status: 'waiting',
    tokenNumber: 102,
  },
  {
    id: 'apt-3',
    time: '09:30 AM',
    patientName: 'Aisha Al-Mansoor',
    uhid: 'UHID-2026-8921',
    age: 34,
    gender: 'F',
    doctor: 'Dr. Robert Torres',
    department: 'Cardiology',
    type: 'Review',
    status: 'waiting',
    tokenNumber: 103,
  },
  {
    id: 'apt-4',
    time: '08:30 AM',
    patientName: 'Marcus Bennett',
    uhid: 'UHID-2026-8899',
    age: 67,
    gender: 'M',
    doctor: 'Dr. Sarah Mitchell',
    department: 'Internal Medicine',
    type: 'Follow-up',
    status: 'completed',
    tokenNumber: 99,
  },
  {
    id: 'apt-5',
    time: '08:45 AM',
    patientName: 'Priya Sharma',
    uhid: 'UHID-2026-8903',
    age: 29,
    gender: 'F',
    doctor: 'Dr. Sarah Mitchell',
    department: 'Internal Medicine',
    type: 'Consultation',
    status: 'completed',
    tokenNumber: 100,
  },
  {
    id: 'apt-6',
    time: '10:00 AM',
    patientName: 'James Wilson',
    uhid: 'UHID-2026-8935',
    age: 51,
    gender: 'M',
    doctor: 'Dr. Sarah Mitchell',
    department: 'Internal Medicine',
    type: 'General OPD',
    status: 'scheduled',
    tokenNumber: 104,
  },
  {
    id: 'apt-7',
    time: '10:15 AM',
    patientName: 'Fatima Zahra',
    uhid: 'UHID-2026-8942',
    age: 46,
    gender: 'F',
    doctor: 'Dr. Elena Rostova',
    department: 'Neurology',
    type: 'Follow-up',
    status: 'scheduled',
    tokenNumber: 105,
  },
]

const HOSPITAL_WORKSPACES = [
  { id: 'doctor', name: 'Doctor OPD', route: '/doctor', icon: Stethoscope },
  { id: 'front-desk', name: 'Front Desk', route: '/front-desk', icon: Users },
  { id: 'nursing', name: 'Nursing Ward', route: '/nursing', icon: BedDouble },
  { id: 'pharmacy', name: 'Pharmacy', route: '/pharmacy', icon: Pill },
  { id: 'lab', name: 'Diagnostics Lab', route: '/lab', icon: FlaskConical },
  { id: 'billing', name: 'Billing Desk', route: '/billing', icon: Receipt },
  { id: 'admin', name: 'Administration', route: '/admin', icon: ShieldCheck },
]

export default function ClinicalMainDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in_consultation' | 'completed' | 'scheduled'>('all')

  // Modals state
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'appointments' | 'patients' | 'departments'>('home')

  // New Appointment Form
  const [newPatientName, setNewPatientName] = useState('')
  const [newDoctor, setNewDoctor] = useState('Dr. Sarah Mitchell')
  const [newTime, setNewTime] = useState('10:30 AM')
  const [newType, setNewType] = useState<'General OPD' | 'Follow-up' | 'Review' | 'Consultation'>('General OPD')

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.uhid.toLowerCase().includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [appointments, searchQuery, statusFilter])

  // Operational metrics
  const totalCount = appointments.length
  const waitingCount = appointments.filter((a) => a.status === 'waiting').length
  const inConsultCount = appointments.filter((a) => a.status === 'in_consultation').length
  const completedCount = appointments.filter((a) => a.status === 'completed').length

  const handleLaunchWorkspace = (route: string, roleId: string) => {
    document.cookie = `cliniva_demo_role=${roleId}; path=/; max-age=86400`
    window.location.href = route
  }

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatientName.trim()) return

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      time: newTime,
      patientName: newPatientName.trim(),
      uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      age: 38,
      gender: 'M',
      doctor: newDoctor,
      department: 'Internal Medicine',
      type: newType,
      status: 'waiting',
      tokenNumber: appointments.length + 100,
    }

    setAppointments([newApt, ...appointments])
    setNewPatientName('')
    setShowNewAppointmentModal(false)
  }

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'in_consultation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            In Consultation
          </span>
        )
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Waiting
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Completed
          </span>
        )
      case 'scheduled':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Scheduled
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans pb-20 md:pb-8 selection:bg-teal-100 selection:text-teal-900">
      
      {/* ─── Top Global Header ─── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Facility Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-base tracking-tight leading-none">
                Cliniva OS
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hidden sm:inline-block">
                St. Jude Medical Center
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-none mt-1 hidden sm:block">
              Outpatient & Ward Clinical Station
            </p>
          </div>
        </div>

        {/* Global Search Bar (Patients / IDs) */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name, UHID, or doctor..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            onClick={() => handleLaunchWorkspace('/doctor', 'doctor')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors min-h-[44px]"
          >
            <Stethoscope className="w-4 h-4" strokeWidth={1.75} />
            <span>Open Clinical OPD</span>
          </button>
        </div>
      </header>

      {/* ─── Department Navigation Strip ─── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          <span className="text-xs font-medium text-slate-400 mr-2 uppercase tracking-wider">
            Workspaces:
          </span>
          {HOSPITAL_WORKSPACES.map((ws) => {
            const Icon = ws.icon
            return (
              <button
                key={ws.id}
                onClick={() => handleLaunchWorkspace(ws.route, ws.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>{ws.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Greeting & Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="text-teal-700 font-semibold">Active Session</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Good morning, Dr. Sarah Mitchell
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              General Medicine OPD — Room 204 • St. Jude Medical Center
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
              <span className="text-xs text-slate-500 font-medium block">Total</span>
              <span className="text-lg font-bold text-slate-900 leading-tight">{totalCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
              <span className="text-xs text-amber-700 font-medium block">Waiting</span>
              <span className="text-lg font-bold text-amber-800 leading-tight">{waitingCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
              <span className="text-xs text-sky-700 font-medium block">In Consult</span>
              <span className="text-lg font-bold text-sky-800 leading-tight">{inConsultCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
              <span className="text-xs text-emerald-700 font-medium block">Completed</span>
              <span className="text-lg font-bold text-emerald-800 leading-tight">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* ─── Quick Actions Row (Flat, Pill-shaped Buttons) ─── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold border border-teal-700 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={1.75} />
              <span>New Appointment</span>
            </button>

            <button
              onClick={() => setShowAddPatientModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
              <span>Add Patient</span>
            </button>

            <button
              onClick={() => handleLaunchWorkspace('/doctor', 'doctor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <FileText className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
              <span>Issue e-Prescription</span>
            </button>

            <button
              onClick={() => handleLaunchWorkspace('/lab', 'lab_tech')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <FlaskConical className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
              <span>Order Lab Test</span>
            </button>

            <button
              onClick={() => handleLaunchWorkspace('/nursing', 'nurse')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <BedDouble className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
              <span>Admit to Ward</span>
            </button>
          </div>
        </div>

        {/* ─── Today's Appointments Section ─── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Today&apos;s Appointments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time outpatient queue, vitals tracking, and encounter status
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('waiting')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'waiting'
                    ? 'bg-white text-amber-800 font-semibold border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waiting ({waitingCount})
              </button>
              <button
                onClick={() => setStatusFilter('in_consultation')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'in_consultation'
                    ? 'bg-white text-sky-800 font-semibold border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Consult ({inConsultCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-white text-emerald-800 font-semibold border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">Token</th>
                  <th className="py-3 px-4 w-28">Time</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Physician & Dept</th>
                  <th className="py-3 px-4">Encounter Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No appointments found matching your filter or query.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => handleLaunchWorkspace('/doctor', 'doctor')}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                        #{apt.tokenNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-xs text-slate-600 whitespace-nowrap">
                        {apt.time}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {apt.patientName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-slate-500 font-medium">
                            {apt.uhid}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {apt.age}y / {apt.gender}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs">
                          {apt.doctor}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {apt.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {apt.type}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLaunchWorkspace('/doctor', 'doctor')
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 border border-slate-200 transition-colors min-h-[36px]"
                        >
                          <span>Open Chart</span>
                          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (Clean, Readable, Touch-Friendly) */}
          <div className="md:hidden divide-y divide-slate-200">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No appointments found.
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                  onClick={() => handleLaunchWorkspace('/doctor', 'doctor')}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{apt.tokenNumber}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {apt.patientName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-slate-500 font-medium">
                          {apt.uhid}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                          {apt.age}y / {apt.gender}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" strokeWidth={1.75} />
                        {apt.time}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
                    <div>
                      <span className="font-medium text-slate-700">{apt.doctor}</span>
                      <span className="mx-1">•</span>
                      <span>{apt.type}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLaunchWorkspace('/doctor', 'doctor')
                      }}
                      className="text-teal-700 font-semibold inline-flex items-center gap-0.5 min-h-[44px] min-w-[44px] justify-end"
                    >
                      <span>Chart</span>
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </main>

      {/* ─── Mobile Fixed Bottom Navigation Bar (44px min touch target) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-16 md:hidden px-2 shadow-xs">
        <button
          onClick={() => setActiveMobileTab('home')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-xs font-medium ${
            activeMobileTab === 'home' ? 'text-teal-700 font-semibold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveMobileTab('appointments')
            setShowNewAppointmentModal(true)
          }}
          className="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-xs font-medium text-slate-500"
        >
          <Calendar className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
          <span>New Appt</span>
        </button>

        <button
          onClick={() => handleLaunchWorkspace('/doctor', 'doctor')}
          className="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-xs font-medium text-slate-500"
        >
          <Stethoscope className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
          <span>Doctor OPD</span>
        </button>

        <button
          onClick={() => handleLaunchWorkspace('/front-desk', 'front_desk')}
          className="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-xs font-medium text-slate-500"
        >
          <Users className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
          <span>Front Desk</span>
        </button>
      </nav>

      {/* ─── Modal: New Appointment ─── */}
      {showNewAppointmentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setShowNewAppointmentModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Schedule New Appointment
                  </h3>
                  <p className="text-xs text-slate-500">Outpatient clinical booking</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jonathan Miller"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slot Time
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-700"
                  >
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-700"
                  >
                    <option value="General OPD">General OPD</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Review">Review</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Physician
                </label>
                <select
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-700"
                >
                  <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell (Internal Medicine)</option>
                  <option value="Dr. Robert Torres">Dr. Robert Torres (Cardiology)</option>
                  <option value="Dr. Elena Rostova">Dr. Elena Rostova (Neurology)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold min-h-[44px]"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Patient (UHID Generation) ─── */}
      {showAddPatientModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setShowAddPatientModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Register New Patient (UHID)
                  </h3>
                  <p className="text-xs text-slate-500">Central Electronic Health Record</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Generated Hospital UHID
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  UHID-2026-{Math.floor(1000 + Math.random() * 9000)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Legal name as on ID"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth / Age
                  </label>
                  <input
                    type="number"
                    placeholder="Age (e.g. 45)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-700">
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPatientModal(false)
                    handleLaunchWorkspace('/front-desk', 'front_desk')
                  }}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold min-h-[44px]"
                >
                  Save & Open Intake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

