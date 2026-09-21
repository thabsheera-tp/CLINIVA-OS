'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import DispenseMedicationModal from '@/components/modals/DispenseMedicationModal'
import { SkeletonRow } from '@/components/ui/LoadingSkeleton'
import { useDrugInventory, useActivePrescriptions } from '@/hooks/useClinicData'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_DISPENSE_QUEUE = [
  { id: 'RX-4091', patient: 'Marcus Delacroix', doc: 'Dr. Sarah Jenkins', meds: 'Atorvastatin 40mg + Lisinopril 10mg', status: 'Pending Verification', time: '10m ago' },
  { id: 'RX-4089', patient: 'George Tanner', doc: 'Dr. Alan Bradley', meds: 'Metformin HCl 1000mg + Glimepiride 2mg', status: 'Ready for Pickup', time: '25m ago' },
  { id: 'RX-4085', patient: 'Aisha Nkosi', doc: 'Dr. Sarah Jenkins', meds: 'Metoprolol Tartrate 25mg', status: 'In Review', time: '40m ago' },
  { id: 'RX-4080', patient: 'David Chen', doc: 'Dr. Alan Bradley', meds: 'Rosuvastatin 20mg + Aspirin 81mg', status: 'Ready for Pickup', time: '1h ago' },
]

const SAMPLE_INVENTORY = [
  { code: 'MED-001', name: 'Atorvastatin Calcium', strength: '40mg', form: 'Tablet', stock: 450, min: 100, bin: 'Shelf B-04', status: 'In Stock' },
  { code: 'MED-002', name: 'Lisinopril', strength: '10mg', form: 'Tablet', stock: 320, min: 80, bin: 'Shelf A-12', status: 'In Stock' },
  { code: 'MED-003', name: 'Amoxicillin / Clavulanate', strength: '875/125mg', form: 'Tablet', stock: 45, min: 60, bin: 'Shelf C-01', status: 'Low Stock' },
  { code: 'MED-004', name: 'Metformin HCl', strength: '1000mg', form: 'Tablet', stock: 680, min: 150, bin: 'Shelf A-03', status: 'In Stock' },
  { code: 'MED-005', name: 'Ceftriaxone Sodium', strength: '1g', form: 'Vial (IV)', stock: 24, min: 50, bin: 'Cold Storage 1', status: 'Low Stock' },
  { code: 'MED-006', name: 'Enoxaparin Sodium', strength: '40mg/0.4mL', form: 'Prefilled Syringe', stock: 15, min: 30, bin: 'Cold Storage 2', status: 'Critical Low' },
]

const SAMPLE_EXPIRY = [
  { lot: 'LOT-9821', drug: 'Amoxicillin Oral Suspension 250mg/5mL', qty: '14 bottles', exp: '18 days', status: 'Expiring Soon', action: 'Quarantine' },
  { lot: 'LOT-8712', drug: 'Nitroglycerin Sublingual 0.4mg', qty: '8 vials', exp: '26 days', status: 'Expiring Soon', action: 'Discount' },
  { lot: 'LOT-6501', drug: 'Tetanus Toxoid Vaccine', qty: '5 doses', exp: 'Expired (5d)', status: 'Expired', action: 'Destroyed' },
  { lot: 'LOT-9102', drug: 'Ondansetron 4mg/2mL Ampoules', qty: '20 amps', exp: '45 days', status: 'Watchlist', action: 'Normal' },
]

export default function PharmacySubScreens({ slug, userName }: Props) {
  const { setDispenseOpen } = useClinicRealtime()
  const [searchTerm, setSearchTerm] = useState('')

  // ── Real data hooks ──
  const inventory = useDrugInventory(slug === 'inventory' ? searchTerm : '')
  const dispenseQueue = useActivePrescriptions()

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      <DispenseMedicationModal />

      {/* ── 1. DISPENSE QUEUE ── */}
      {slug === 'dispense' && (
        <>
          <SubScreenHeader
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Prescription Dispense Queue"
            badge="12 Orders Pending"
            badgeVariant="live"
            description="Verified e-prescriptions awaiting pharmacist safety checks, drug-drug interaction screening, and patient handover."
            actions={
              <button onClick={() => setDispenseOpen(true)} className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">prescriptions</span>
                <span>Open Dispense Dialog</span>
              </button>
            }
          />

          <div className="grid grid-cols-1 gap-3">
            {dispenseQueue.loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            {!dispenseQueue.loading && dispenseQueue.data.length === 0 && (
              SAMPLE_DISPENSE_QUEUE.map((order) => (
                <div key={order.id} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-label-sm font-bold text-primary">{order.id}</span>
                      <span className="font-semibold text-on-surface text-body-md">{order.patient}</span>
                      <span className="text-label-sm text-outline">• {order.time}</span>
                    </div>
                    <div className="text-body-sm font-medium text-on-surface mt-1">{order.meds}</div>
                    <div className="text-label-sm text-on-surface-variant mt-0.5">Prescribed by {order.doc}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                      order.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                    <button onClick={() => setDispenseOpen(true)} className="btn-primary text-label-sm py-1.5 px-4">
                      Dispense
                    </button>
                  </div>
                </div>
              ))
            )}
            {!dispenseQueue.loading && dispenseQueue.data.length > 0 && (
              dispenseQueue.data.map((order) => (
                <div key={order.id} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-label-sm font-bold text-primary">{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="font-semibold text-on-surface text-body-md">Patient #{order.patient_id.slice(0, 8)}</span>
                      <span className="text-label-sm text-outline">• {order.prescribed_at ? new Date(order.prescribed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                    </div>
                    <div className="text-body-sm font-medium text-on-surface mt-1">{order.drug_name} {order.dose} — {order.frequency} (Qty: {order.quantity})</div>
                    <div className="text-label-sm text-on-surface-variant mt-0.5">Doctor #{order.doctor_id.slice(0, 8)} • Refills: {order.refills}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                      order.status === 'Ready for Pickup' || order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                    <button onClick={() => setDispenseOpen(true)} className="btn-primary text-label-sm py-1.5 px-4">
                      Dispense
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── 2. DRUG INVENTORY ── */}
      {slug === 'inventory' && (
        <>
          <SubScreenHeader
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Formulary & Pharmaceutical Inventory"
            badge="840 SKUs"
            description="Hospital central dispensary stock catalog, storage bin mapping, and reorder levels."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm space-y-4 p-4">
            <div className="relative max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search drug name, code, form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-body-sm text-on-surface border border-transparent focus:border-primary/30"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Drug Name</th>
                    <th className="px-4 py-3">Form / Strength</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Bin Location</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_INVENTORY.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.includes(searchTerm)).map((i) => (
                    <tr key={i.code} className="hover:bg-surface-container-low/30">
                      <td className="px-4 py-3 font-mono text-outline font-medium">{i.code}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface">{i.name}</td>
                      <td className="px-4 py-3">{i.strength} • {i.form}</td>
                      <td className="px-4 py-3 font-mono font-bold text-on-surface">{i.stock}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{i.bin}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          i.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 3. PURCHASE ORDERS ── */}
      {slug === 'orders' && (
        <>
          <SubScreenHeader
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Procurement & Purchase Orders"
            badge="3 Active POs"
            description="Requisitions sent to certified pharmaceutical distributors and stock receipt logs."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
            {[
              { po: 'PO-2026-081', vendor: 'Amerisource Health Logistics', items: '40 items (Cardiovascular & Antibiotics)', total: '$4,280.00', status: 'In Transit', expected: 'Tomorrow 10:00' },
              { po: 'PO-2026-079', vendor: 'McKesson Medical Supply', items: '12 items (Surgical Disposables & IV fluids)', total: '$1,850.50', status: 'Delivered', expected: 'Received Today' },
              { po: 'PO-2026-077', vendor: 'Cardinal Health Pharmaceuticals', items: '25 items (Controlled Substances / Schedule II)', total: '$6,120.00', status: 'Audit Pending', expected: 'In Verification' },
            ].map((po) => (
              <div key={po.po} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{po.po}</span>
                    <span className="font-semibold text-on-surface">{po.vendor}</span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant mt-1">{po.items}</div>
                  <div className="text-label-sm text-outline mt-0.5">Delivery: {po.expected}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-body-md text-on-surface">{po.total}</span>
                  <span className="px-2.5 py-1 rounded-full text-label-sm font-semibold bg-blue-100 text-blue-800">
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 4. EXPIRY TRACKER ── */}
      {slug === 'expiry' && (
        <>
          <SubScreenHeader
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Batch Expiry & Quarantine Tracker"
            badge="14 Items Watchlist"
            badgeVariant="alert"
            description="Automatic batch surveillance for formulations reaching 30, 60, and 90-day expiry thresholds."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Lot Number</th>
                    <th className="px-5 py-3">Formulation</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3">Days Remaining</th>
                    <th className="px-5 py-3">Classification</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SAMPLE_EXPIRY.map((exp) => (
                    <tr key={exp.lot} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono text-outline font-medium">{exp.lot}</td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{exp.drug}</td>
                      <td className="px-5 py-3.5">{exp.qty}</td>
                      <td className="px-5 py-3.5 font-bold text-red-700">{exp.exp}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          exp.status === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-label-sm font-medium">
                          {exp.action}
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

      {/* ── 5. SUPPLIERS ── */}
      {slug === 'suppliers' && (
        <>
          <SubScreenHeader
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Approved Pharmaceutical Vendors"
            badge="8 Contracted Vendors"
            description="Authorized commercial medicine suppliers, distributor representatives, and credit terms."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Amerisource Health Corp', contact: 'Sarah Lin (+1 555 491-0021)', terms: 'Net 30 Days', lead: '24 Hours', rating: '4.9 ★' },
              { name: 'McKesson Medical Distribution', contact: 'David Rossi (+1 555 330-9182)', terms: 'Net 45 Days', lead: '48 Hours', rating: '4.8 ★' },
              { name: 'Cardinal Health Systems', contact: 'Rachel Adams (+1 555 902-1144)', terms: 'Net 30 Days', lead: 'Same Day Emergency', rating: '5.0 ★' },
              { name: 'Medline Industries', contact: 'Thomas Wright (+1 555 611-3091)', terms: 'Net 60 Days', lead: '72 Hours', rating: '4.7 ★' },
            ].map((v) => (
              <div key={v.name} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-on-surface text-body-md">{v.name}</h3>
                  <span className="text-label-sm font-bold text-primary">{v.rating}</span>
                </div>
                <div className="text-body-sm text-on-surface-variant space-y-0.5">
                  <div>Contact: {v.contact}</div>
                  <div>Terms: {v.terms}</div>
                  <div>Delivery Lead: <strong className="text-on-surface">{v.lead}</strong></div>
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
            parentLabel="Pharmacy"
            parentHref="/pharmacy"
            title="Dispensary Preferences & Rules"
            description="Configure barcode scanning enforcement, automatic low-stock alerts, and controlled substance double-witness protocols."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
              <span className="text-body-sm text-on-surface font-medium">Require 2D DataMatrix barcode scan prior to dispensing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
              <span className="text-body-sm text-on-surface font-medium">Flag generic substitute recommendations automatically</span>
            </label>
            <button className="btn-primary">Save Pharmacy Configuration</button>
          </div>
        </>
      )}
    </div>
  )
}
