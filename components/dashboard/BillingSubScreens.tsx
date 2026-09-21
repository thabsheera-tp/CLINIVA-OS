'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import CollectPaymentModal from '@/components/modals/CollectPaymentModal'
import { SkeletonRow } from '@/components/ui/LoadingSkeleton'
import { useRecentInvoices, useOutstandingInvoices } from '@/hooks/useClinicData'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_INVOICES = [
  { inv: 'INV-2026-0914', patient: 'Marcus Delacroix', mrn: '00482910', date: 'Today', dept: 'Cardiology + Ward A', total: '$1,420.00', paid: '$1,420.00', due: '$0.00', status: 'Paid in Full', method: 'Insurance + Visa' },
  { inv: 'INV-2026-0913', patient: 'Priya Mehta', mrn: '00482911', date: 'Today', dept: 'OPD + Pharmacy', total: '$215.00', paid: '$0.00', due: '$215.00', status: 'Outstanding', method: 'Pending' },
  { inv: 'INV-2026-0912', patient: 'George Tanner', mrn: '00482912', date: 'Yesterday', dept: 'Orthopedics / Post-Op', total: '$3,850.00', paid: '$3,000.00', due: '$850.00', status: 'Partial', method: 'BlueCross Copay' },
  { inv: 'INV-2026-0911', patient: 'David Chen', mrn: '00482914', date: '2 days ago', dept: 'Endocrinology & Lab', total: '$180.00', paid: '$180.00', due: '$0.00', status: 'Paid in Full', method: 'Cash' },
]

const SAMPLE_PRICE_LIST = [
  { code: 'CHG-101', service: 'General OPD Consultation (First Visit)', category: 'Consultation', rate: '$50.00', tax: '0% (Exempt)' },
  { code: 'CHG-102', service: 'Specialist Cardiology Consultation', category: 'Consultation', rate: '$120.00', tax: '0% (Exempt)' },
  { code: 'CHG-201', service: 'Inpatient General Ward Bed (Per 24h)', category: 'Bed / Accommodations', rate: '$250.00', tax: '0% (Exempt)' },
  { code: 'CHG-202', service: 'ICU / Critical Care Bed (Per 24h)', category: 'Bed / Accommodations', rate: '$850.00', tax: '0% (Exempt)' },
  { code: 'CHG-301', service: 'Complete Blood Count (CBC) Automated', category: 'Laboratory Diagnostics', rate: '$35.00', tax: '0% (Exempt)' },
  { code: 'CHG-302', service: 'High-Sensitivity Troponin I Panel', category: 'Laboratory Diagnostics', rate: '$85.00', tax: '0% (Exempt)' },
  { code: 'CHG-401', service: '12-Lead Electrocardiogram (ECG)', category: 'Cardiology Procedures', rate: '$65.00', tax: '0% (Exempt)' },
]

export default function BillingSubScreens({ slug, userName }: Props) {
  const { setPaymentOpen } = useClinicRealtime()
  const [searchTerm, setSearchTerm] = useState('')

  // ── Real data hooks ──
  const invoices = useRecentInvoices()
  const outstanding = useOutstandingInvoices()

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      <CollectPaymentModal />

      {/* ── 1. INVOICES ── */}
      {slug === 'invoices' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Patient Invoices & Statements"
            badge="7 Overdue / Due"
            badgeVariant="alert"
            description="Hospital billing ledger, inpatient discharge bills, and outpatient encounter invoices."
            actions={
              <button onClick={() => setPaymentOpen(true)} className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add_card</span>
                <span>Receive Payment</span>
              </button>
            }
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between gap-3">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Filter invoice, MRN, patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-body-sm text-on-surface border border-transparent focus:border-primary/30"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Invoice #</th>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Total Billed</th>
                    <th className="px-5 py-3">Balance Due</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_INVOICES.filter(i => i.patient.toLowerCase().includes(searchTerm.toLowerCase()) || i.inv.includes(searchTerm)).map((inv) => (
                    <tr key={inv.inv} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono text-primary font-bold">{inv.inv}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-on-surface">{inv.patient}</div>
                        <div className="text-label-sm text-outline font-mono">#{inv.mrn}</div>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{inv.dept}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-on-surface">{inv.total}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-red-600">{inv.due}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          inv.status === 'Paid in Full' ? 'bg-emerald-100 text-emerald-800' : inv.status === 'Outstanding' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-label-sm font-medium">
                          Receipt PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 2. POS TERMINAL ── */}
      {slug === 'pos' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Cash Counter & Walk-in POS Terminal"
            badge="Shift Terminal #02"
            description="Rapid point of sale billing for outpatient registrations, rapid pharmacy purchases, and lab tests."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
              <span className="text-label-lg font-semibold text-on-surface">Quick Service Items</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'General OPD Token', price: '$50.00' },
                  { name: 'Specialist Consult', price: '$120.00' },
                  { name: 'Routine CBC Test', price: '$35.00' },
                  { name: 'Lipid Profile', price: '$45.00' },
                  { name: 'Emergency Triage Fee', price: '$150.00' },
                  { name: 'Standard ECG', price: '$65.00' },
                ].map((item) => (
                  <button key={item.name} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-primary/10 hover:border-primary/40 text-left transition-all">
                    <div className="font-semibold text-on-surface text-body-sm">{item.name}</div>
                    <div className="font-mono font-bold text-primary mt-1">{item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-label-lg font-semibold text-on-surface">Current Cart</span>
                <div className="mt-3 space-y-2 text-body-sm border-b border-outline-variant/20 pb-3">
                  <div className="flex justify-between"><span>Specialist Consult (Cardiology)</span><span className="font-mono font-semibold">$120.00</span></div>
                  <div className="flex justify-between"><span>Troponin I Panel</span><span className="font-mono font-semibold">$85.00</span></div>
                </div>
                <div className="pt-3 space-y-1.5">
                  <div className="flex justify-between text-body-sm text-on-surface-variant"><span>Subtotal:</span><span className="font-mono">$205.00</span></div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant"><span>Tax (0%):</span><span className="font-mono">$0.00</span></div>
                  <div className="flex justify-between text-headline-sm font-bold text-on-surface pt-1 border-t border-outline-variant/20">
                    <span>Total Due:</span>
                    <span className="text-primary font-mono">$205.00</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setPaymentOpen(true)} className="btn-primary w-full justify-center py-3">
                <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                <span>Collect $205.00</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 3. INSURANCE CLAIMS ── */}
      {slug === 'insurance' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Insurance TPA Pre-Auth & Claims"
            badge="18 Active Claims"
            description="Third-party administrator (TPA) claim tracking, pre-authorization codes, and cashless settlements."
          />

          <div className="grid grid-cols-1 gap-3">
            {[
              { claim: 'CLM-7701', patient: 'Marcus Delacroix', insurer: 'BlueCross BlueShield', auth: 'PRE-88492', amount: '$1,420.00', status: 'Pre-Approved', time: 'Today' },
              { claim: 'CLM-7689', patient: 'George Tanner', insurer: 'Aetna Senior Gold', auth: 'PRE-11029', amount: '$3,850.00', status: 'Claim Settled', time: 'Yesterday' },
              { claim: 'CLM-7640', patient: 'David Chen', insurer: 'Cigna Global Health', auth: 'PRE-99231', amount: '$420.00', status: 'Documentation Requested', time: '2 days ago' },
            ].map((clm) => (
              <div key={clm.claim} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{clm.claim}</span>
                    <span className="font-semibold text-on-surface">{clm.patient}</span>
                    <span className="text-label-sm text-outline">• {clm.insurer}</span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant mt-1">Pre-Auth Code: <strong className="font-mono">{clm.auth}</strong></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-body-md text-on-surface">{clm.amount}</span>
                  <span className="px-2.5 py-1 rounded-full text-label-sm font-semibold bg-emerald-100 text-emerald-800">
                    {clm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 4. DAILY LEDGER ── */}
      {slug === 'ledger' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Daily Counter Ledger & Shift Audit"
            badge="Shift 1: $6,840.00"
            description="Daily cash register reconciliation, payment gateway settlements, and cashier handover balances."
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant">Cash in Drawer</span>
              <div className="text-headline-md font-bold text-on-surface font-mono mt-1">$1,840.00</div>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant">Credit / Debit Card</span>
              <div className="text-headline-md font-bold text-primary font-mono mt-1">$3,150.00</div>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant">Insurance Settled</span>
              <div className="text-headline-md font-bold text-on-surface font-mono mt-1">$1,850.00</div>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <span className="text-label-sm text-on-surface-variant">Total Shift Revenue</span>
              <div className="text-headline-md font-bold text-emerald-700 font-mono mt-1">$6,840.00</div>
            </div>
          </div>
        </>
      )}

      {/* ── 5. PRICE LIST ── */}
      {slug === 'pricing' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Hospital Charge Master & Tariff Schedule"
            badge="Master Rates"
            description="Published standard service tariffs, bed stay rates, procedure costs, and laboratory tests."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Service / Procedure</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Rate</th>
                    <th className="px-5 py-3">Tax Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_PRICE_LIST.map((item) => (
                    <tr key={item.code} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono text-outline font-medium">{item.code}</td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{item.service}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{item.category}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{item.rate}</td>
                      <td className="px-5 py-3.5 text-label-sm text-outline">{item.tax}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Billing"
            parentHref="/billing"
            title="Revenue & POS Configuration"
            description="Configure default tax percentage, thermal receipt printer headers, and payment gateway credentials."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Clinic Tax Registration # (GSTIN / TIN)</label>
              <input type="text" defaultValue="GSTIN-07AAAAA0000A1Z5" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Receipt Footer Note</label>
              <input type="text" defaultValue="Thank you for choosing St. Jude Medical Center. Retain this slip for tax claims." className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <button className="btn-primary">Save Billing Preferences</button>
          </div>
        </>
      )}
    </div>
  )
}
