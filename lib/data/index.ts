/**
 * lib/data/index.ts
 * Central data-access layer for Cliniva OS.
 * All functions use the browser Supabase client and return typed data.
 * They gracefully fall back to empty arrays on error so the UI never crashes.
 */
'use client'

import { createClientSideClient } from '@/lib/supabase/client'

const supabase = createClientSideClient()

// ─── Types ────────────────────────────────────────────────────────────────────

export type PatientRow = {
  id: string
  mrn: string
  first_name: string
  last_name: string
  dob: string
  gender: string
  phone: string
  email: string | null
  tenant_id: string
}

export type AppointmentRow = {
  id: string
  patient_id: string
  doctor_id: string
  scheduled_at: string
  status: string
  queue_token: number
  chief_complaint: string | null
  tenant_id: string
}

export type VitalsRow = {
  id: string
  patient_id: string
  appointment_id: string
  bp_systolic: number | null
  bp_diastolic: number | null
  heart_rate: number | null
  spo2: number | null
  temperature: number | null
  recorded_at: string
}

export type PrescriptionRow = {
  id: string
  patient_id: string
  doctor_id: string
  drug_name: string
  dose: string
  frequency: string
  quantity: number
  refills: number
  status: string
  prescribed_at: string
}

export type LabOrderRow = {
  id: string
  patient_id: string
  test_name: string
  result_value: string | null
  result_unit: string | null
  reference_range: string | null
  status: string
  is_critical: boolean
  collected_at: string | null
  resulted_at: string | null
}

export type BedRow = {
  id: string
  ward_id: string
  bed_number: string
  status: string
  current_patient_id: string | null
}

export type InvoiceRow = {
  id: string
  patient_id: string
  amount_total: number
  amount_paid: number
  status: string
  created_at: string
}

export type DrugRow = {
  id: string
  name: string
  generic_name: string
  category: string
  quantity_in_stock: number
  reorder_level: number
  unit_price: number
  expiry_date: string | null
}

export type QueueTicketRow = {
  id: string
  patient_id: string | null
  patient_name: string
  token_number: number
  status: 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show'
  priority: 'routine' | 'urgent' | 'emergency'
  department: string
  doctor_id: string | null
  chief_complaint: string | null
  estimated_wait_minutes: number
  estimated_consultation_time: string | null
  consultation_started_at: string | null
  consultation_completed_at: string | null
  tenant_id?: string
  created_at: string
  updated_at: string
}

// ─── Generic safe fetch ───────────────────────────────────────────────────────

async function safeFetch<T>(
  query: Promise<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  try {
    const { data, error } = await query
    if (error) {
      console.warn('[Cliniva Data]', error)
      return []
    }
    return data ?? []
  } catch (err) {
    console.warn('[Cliniva Data] fetch failed:', err)
    return []
  }
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function fetchPatients(search = '', limit = 50): Promise<PatientRow[]> {
  let q = supabase
    .from('patients')
    .select('*')
    .limit(limit)
    .order('first_name', { ascending: true })

  if (search) {
    q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%`)
  }

  return safeFetch<PatientRow>(q as any)
}

export async function fetchPatientByMrn(mrn: string): Promise<PatientRow | null> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('mrn', mrn)
      .single()
    if (error) return null
    return data as PatientRow
  } catch {
    return null
  }
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function fetchTodayAppointments(): Promise<AppointmentRow[]> {
  const today = new Date().toISOString().split('T')[0]
  return safeFetch<AppointmentRow>(
    supabase
      .from('appointments')
      .select('*')
      .gte('scheduled_at', `${today}T00:00:00`)
      .lte('scheduled_at', `${today}T23:59:59`)
      .order('scheduled_at', { ascending: true }) as any
  )
}

export async function fetchPatientAppointments(patientId: string): Promise<AppointmentRow[]> {
  return safeFetch<AppointmentRow>(
    supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false }) as any
  )
}

// ─── Vitals ───────────────────────────────────────────────────────────────────

export async function fetchPatientVitals(patientId: string, limit = 10): Promise<VitalsRow[]> {
  return safeFetch<VitalsRow>(
    supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(limit) as any
  )
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

export async function fetchActivePrescriptions(patientId?: string): Promise<PrescriptionRow[]> {
  let q = supabase
    .from('prescriptions')
    .select('*')
    .eq('status', 'active')
    .order('prescribed_at', { ascending: false })
    .limit(50)

  if (patientId) q = q.eq('patient_id', patientId)

  return safeFetch<PrescriptionRow>(q as any)
}

// ─── Lab Orders ───────────────────────────────────────────────────────────────

export async function fetchPendingLabOrders(): Promise<LabOrderRow[]> {
  return safeFetch<LabOrderRow>(
    supabase
      .from('lab_orders')
      .select('*')
      .in('status', ['ordered', 'in_progress', 'resulted'])
      .order('collected_at', { ascending: false })
      .limit(50) as any
  )
}

export async function fetchCriticalLabResults(): Promise<LabOrderRow[]> {
  return safeFetch<LabOrderRow>(
    supabase
      .from('lab_orders')
      .select('*')
      .eq('is_critical', true)
      .order('resulted_at', { ascending: false })
      .limit(20) as any
  )
}

// ─── Beds ─────────────────────────────────────────────────────────────────────

export async function fetchBeds(): Promise<BedRow[]> {
  return safeFetch<BedRow>(
    supabase
      .from('beds')
      .select('*')
      .order('bed_number', { ascending: true }) as any
  )
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export async function fetchRecentInvoices(limit = 20): Promise<InvoiceRow[]> {
  return safeFetch<InvoiceRow>(
    supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit) as any
  )
}

export async function fetchOutstandingInvoices(): Promise<InvoiceRow[]> {
  return safeFetch<InvoiceRow>(
    supabase
      .from('invoices')
      .select('*')
      .in('status', ['pending', 'overdue'])
      .order('created_at', { ascending: false }) as any
  )
}

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export async function fetchDrugInventory(search = ''): Promise<DrugRow[]> {
  let q = supabase
    .from('drug_inventory')
    .select('*')
    .order('name', { ascending: true })
    .limit(100)

  if (search) {
    q = q.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`)
  }

  return safeFetch<DrugRow>(q as any)
}

export async function fetchLowStockDrugs(): Promise<DrugRow[]> {
  return safeFetch<DrugRow>(
    supabase
      .from('drug_inventory')
      .select('*')
      .lte('quantity_in_stock', supabase.rpc('get_reorder_level' as any) as any) as any
  )
}

// ─── Patient Queue & Waiting List ───────────────────────────────────────────

export async function fetchLiveQueue(department?: string): Promise<QueueTicketRow[]> {
  try {
    let q = (supabase.from('patient_queue') as any)
      .select('*')
      .in('status', ['waiting', 'in-consultation'])
      .order('token_number', { ascending: true })

    if (department && department !== 'All') {
      q = q.eq('department', department)
    }

    const { data, error } = await q
    if (error) {
      console.warn('[Cliniva LiveQueue] Supabase query notice:', error.message)
      return []
    }
    return (data as QueueTicketRow[]) ?? []
  } catch (err) {
    console.warn('[Cliniva LiveQueue] fetch failed:', err)
    return []
  }
}

export async function addQueueTicket(payload: {
  patient_name: string
  priority?: 'routine' | 'urgent' | 'emergency'
  department?: string
  chief_complaint?: string
  patient_id?: string | null
}): Promise<QueueTicketRow | null> {
  try {
    // Determine next token number
    const { data: latest } = await (supabase.from('patient_queue') as any)
      .select('token_number')
      .order('token_number', { ascending: false })
      .limit(1)

    const nextToken = latest && latest.length > 0 ? (latest[0].token_number || 100) + 1 : 101

    const newTicket = {
      patient_name: payload.patient_name,
      patient_id: payload.patient_id || null,
      token_number: nextToken,
      status: 'waiting',
      priority: payload.priority || 'routine',
      department: payload.department || 'General Medicine',
      chief_complaint: payload.chief_complaint || 'Walk-in Consultation',
      estimated_wait_minutes: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await (supabase.from('patient_queue') as any)
      .insert(newTicket)
      .select()
      .single()

    if (error) {
      console.error('[Cliniva LiveQueue] Insert error:', error)
      return null
    }
    return data as QueueTicketRow
  } catch (err) {
    console.error('[Cliniva LiveQueue] Add ticket failed:', err)
    return null
  }
}

export async function updateQueueTicketStatus(
  id: string,
  status: QueueTicketRow['status']
): Promise<boolean> {
  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    }
    if (status === 'in-consultation') {
      updates.consultation_started_at = new Date().toISOString()
    } else if (status === 'completed') {
      updates.consultation_completed_at = new Date().toISOString()
    }

    const { error } = await (supabase.from('patient_queue') as any)
      .update(updates)
      .eq('id', id)

    return !error
  } catch (err) {
    console.error('[Cliniva LiveQueue] Update status failed:', err)
    return false
  }
}
