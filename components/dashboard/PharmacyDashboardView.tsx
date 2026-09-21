'use client'

import React from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import DispenseMedicationModal from '@/components/modals/DispenseMedicationModal'

type Props = {
  userName: string
}

export default function PharmacyDashboardView({ userName }: Props) {
  const { setDispenseOpen } = useClinicRealtime()

  return (
    <div className="flex flex-col space-y-gutter-desktop">
      <DispenseMedicationModal />

      <section
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-semibold">
            Pharmacy & Dispensary Dashboard
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Central Pharmacy • Pharmacist: {userName} •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setDispenseOpen(true)}
            className="btn-primary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">medication</span>
            <span>Dispense Rx</span>
          </button>
          <Link
            href="/pharmacy/inventory"
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Stock</span>
          </Link>
          <Link
            href="/pharmacy/orders"
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            <span>Purchase Order</span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Rx Pending"
          value={12}
          icon="prescriptions"
          trend="Urgent: 3"
          trendDir="down"
          live
        />
        <KPICard
          title="Dispensed Today"
          value={87}
          icon="medication"
          trend="+14% vs yesterday"
          trendDir="up"
          subtitle="87 scripts"
        />
        <KPICard
          title="Low Stock Items"
          value={8}
          icon="inventory_2"
          trend="Reorder needed"
          trendDir="down"
        />
        <KPICard
          title="Expiring (30d)"
          value={14}
          icon="event_busy"
          trend="14 items"
          trendDir="down"
          subtitle="Review needed"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
        {/* Prescription Queue */}
        <div className="xl:col-span-2 clinical-card">
          <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Prescription Queue
              </h3>
              <LiveIndicator size="sm" />
            </div>
            <span className="text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
              12 Pending
            </span>
          </div>

          {/* Mobile Prescription Cards (< sm screens) */}
          <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
            {[
              { id: 'RX-0842', patient: 'Marcus Delacroix', doc: 'Dr. Sarah Jenkins', drug: 'Lisinopril 10mg #30', priority: 'emergency' },
              { id: 'RX-0841', patient: 'George Tanner', doc: 'Dr. Sarah Jenkins', drug: 'Metformin 500mg #60', priority: 'urgent' },
              { id: 'RX-0840', patient: 'Priya Mehta', doc: 'Dr. Raj Patel', drug: 'Amoxicillin 500mg #21', priority: 'urgent' },
              { id: 'RX-0839', patient: 'Aisha Nkosi', doc: 'Dr. Lisa Wong', drug: 'Ketorolac 10mg #10', priority: 'routine' },
              { id: 'RX-0838', patient: 'Carlos Mendez', doc: 'Dr. Omar Hassan', drug: 'Albuterol Inhaler #1', priority: 'routine' },
            ].map((row) => (
              <div key={row.id} className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-mono text-on-surface-variant">{row.id}</span>
                  <StatusBadge
                    variant={row.priority === 'emergency' ? 'critical' : row.priority === 'urgent' ? 'warning' : 'routine'}
                    label={row.priority}
                  />
                </div>
                <div>
                  <p className="text-label-lg font-semibold text-on-surface">{row.patient}</p>
                  <p className="text-body-sm text-primary font-medium">{row.drug}</p>
                  <p className="text-body-sm text-on-surface-variant">Prescribed by {row.doc}</p>
                </div>
                <button
                  onClick={() => setDispenseOpen(true)}
                  className="btn-primary w-full justify-center py-2 text-label-md touch-tap"
                >
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                  <span>Dispense Medication →</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Prescription Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/30">
                  {['Rx #', 'Patient', 'Doctor', 'Drug', 'Priority', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-space-md py-space-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm">
                {[
                  { id: 'RX-0842', patient: 'Marcus Delacroix', doc: 'Dr. Sarah Jenkins', drug: 'Lisinopril 10mg #30', priority: 'emergency' },
                  { id: 'RX-0841', patient: 'George Tanner', doc: 'Dr. Sarah Jenkins', drug: 'Metformin 500mg #60', priority: 'urgent' },
                  { id: 'RX-0840', patient: 'Priya Mehta', doc: 'Dr. Raj Patel', drug: 'Amoxicillin 500mg #21', priority: 'urgent' },
                  { id: 'RX-0839', patient: 'Aisha Nkosi', doc: 'Dr. Lisa Wong', drug: 'Ketorolac 10mg #10', priority: 'routine' },
                  { id: 'RX-0838', patient: 'Carlos Mendez', doc: 'Dr. Omar Hassan', drug: 'Albuterol Inhaler #1', priority: 'routine' },
                ].map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                  >
                    <td className="px-space-md py-space-sm text-label-sm text-on-surface-variant font-mono">
                      {row.id}
                    </td>
                    <td className="px-space-md py-space-sm text-label-lg text-on-surface font-semibold">
                      {row.patient}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {row.doc}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface font-medium">
                      {row.drug}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <StatusBadge
                        variant={row.priority === 'emergency' ? 'critical' : row.priority === 'urgent' ? 'warning' : 'routine'}
                        label={row.priority}
                      />
                    </td>
                    <td className="px-space-md py-space-sm text-right">
                      <button
                        onClick={() => setDispenseOpen(true)}
                        className="btn-primary py-1 px-space-md text-label-sm touch-tap"
                      >
                        Dispense →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="clinical-card p-space-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
              Stock Alerts
            </h3>
            <span className="text-label-sm bg-tertiary/10 text-tertiary font-bold px-2 py-0.5 rounded-full">
              4 Critical
            </span>
          </div>
          <div className="divide-y divide-outline-variant/10 text-body-sm">
            {[
              { drug: 'Atorvastatin 20mg', qty: 18, reorder: 50, batch: 'BAT-ATO-1124' },
              { drug: 'Amoxicillin 500mg', qty: 42, reorder: 100, batch: 'BAT-AMX-2026A' },
              { drug: 'Albuterol HFA', qty: 12, reorder: 30, batch: 'BAT-ALB-0082' },
              { drug: 'Epinephrine 1mg', qty: 4, reorder: 10, batch: 'BAT-EPI-0104' },
            ].map((stk) => (
              <div key={stk.drug} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{stk.drug}</p>
                  <p className="text-label-sm text-on-surface-variant font-mono">{stk.batch}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-tertiary tabular-nums">{stk.qty} units</p>
                  <p className="text-label-sm text-on-surface-variant">Min: {stk.reorder}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/pharmacy/orders"
            className="btn-secondary justify-center w-full mt-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            Generate Bulk Reorder
          </Link>
        </div>
      </div>
    </div>
  )
}
