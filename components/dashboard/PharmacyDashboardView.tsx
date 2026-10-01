'use client'

import React from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import DispenseMedicationModal from '@/components/modals/DispenseMedicationModal'
import { useActivePrescriptions, useDrugInventory } from '@/hooks/useClinicData'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  userName: string
}

export default function PharmacyDashboardView({ userName }: Props) {
  const { setDispenseOpen, openDispenseModal, pharmacyRefreshKey } = useClinicRealtime()
  const rxList = useActivePrescriptions()
  const inventoryList = useDrugInventory()

  const rxListRefetch = rxList.refetch
  const inventoryListRefetch = inventoryList.refetch

  React.useEffect(() => {
    rxListRefetch()
    inventoryListRefetch()
  }, [pharmacyRefreshKey, rxListRefetch, inventoryListRefetch])

  return (
    <div className="flex flex-col space-y-4">
      <DispenseMedicationModal />

      {/* Clean Hospital Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Pharmacy & Dispensary</h1>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">
            Prescription Dispensing & Stock Inventory • {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDispenseOpen(true)}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            <ClinivaIcon name="medication" size={16} strokeWidth={1.5} />
            <span>Dispense Rx</span>
          </button>
          <Link
            href="/pharmacy/inventory"
            className="btn-secondary py-2 px-3 text-xs"
          >
            <ClinivaIcon name="inventory_2" size={16} strokeWidth={1.5} />
            <span>Inventory</span>
          </Link>
        </div>
      </section>

      {/* Compact KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Pending Prescriptions"
          value={12}
          icon="prescriptions"
          trend="3 Urgent"
          trendDir="down"
          live
        />
        <KPICard
          title="Dispensed Today"
          value={87}
          icon="medication"
          trend="+14% vs yesterday"
          trendDir="up"
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
          trend="Review needed"
          trendDir="neutral"
        />
      </section>

      {/* Main Grid: Dispensing Queue & Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Prescription Queue */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">Active Prescriptions</h3>
              <LiveIndicator size="sm" />
            </div>
            <span className="text-xs font-semibold bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] px-2.5 py-0.5 rounded-full">
              12 in Queue
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
                  <span className="text-xs font-mono text-[#123047] dark:text-white font-bold">{row.id}</span>
                  <StatusBadge
                    variant={row.priority === 'emergency' ? 'critical' : row.priority === 'urgent' ? 'warning' : 'routine'}
                    label={row.priority.toUpperCase()}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#123047] dark:text-white">{row.patient}</p>
                  <p className="text-xs text-[#0F8B8D] dark:text-[#28B5B7] font-medium">{row.drug}</p>
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{row.doc}</p>
                </div>
                <button
                  onClick={() => openDispenseModal(row.id)}
                  className="btn-primary w-full justify-center py-1.5 text-xs"
                >
                  <ClinivaIcon name="medication" size={16} strokeWidth={1.5} />
                  <span>Dispense</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Prescription Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/20 text-[#4A5D6B] dark:text-[#9FB1C0] text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-bold">Rx #</th>
                  <th className="px-4 py-2.5 font-bold">Patient</th>
                  <th className="px-4 py-2.5 font-bold">Prescribed By</th>
                  <th className="px-4 py-2.5 font-bold">Medication</th>
                  <th className="px-4 py-2.5 font-bold">Priority</th>
                  <th className="px-4 py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  { id: 'RX-0842', patient: 'Marcus Delacroix', doc: 'Dr. Sarah Jenkins', drug: 'Lisinopril 10mg #30', priority: 'emergency' },
                  { id: 'RX-0841', patient: 'George Tanner', doc: 'Dr. Sarah Jenkins', drug: 'Metformin 500mg #60', priority: 'urgent' },
                  { id: 'RX-0840', patient: 'Priya Mehta', doc: 'Dr. Raj Patel', drug: 'Amoxicillin 500mg #21', priority: 'urgent' },
                  { id: 'RX-0839', patient: 'Aisha Nkosi', doc: 'Dr. Lisa Wong', drug: 'Ketorolac 10mg #10', priority: 'routine' },
                  { id: 'RX-0838', patient: 'Carlos Mendez', doc: 'Dr. Omar Hassan', drug: 'Albuterol Inhaler #1', priority: 'routine' },
                ].map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-[#123047] dark:text-white">
                      {row.id}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-sm text-[#123047] dark:text-white">
                      {row.patient}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                      {row.doc}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] font-medium text-[#253848] dark:text-[#D9E5F0]">
                      {row.drug}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        variant={row.priority === 'emergency' ? 'critical' : row.priority === 'urgent' ? 'warning' : 'routine'}
                        label={row.priority.toUpperCase()}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openDispenseModal(row.id)}
                        className="btn-primary py-1 px-3 text-xs font-semibold"
                      >
                        Dispense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
              Low Stock Alerts
            </h3>
            <span className="text-xs bg-[#C58A24]/10 text-[#C58A24] dark:text-[#E0A842] font-bold px-2 py-0.5 rounded-full">
              4 Critical
            </span>
          </div>
          <div className="divide-y divide-outline-variant/10 p-2 flex-1">
            {[
              { drug: 'Atorvastatin 20mg', qty: 18, reorder: 50, batch: 'BAT-ATO-1124' },
              { drug: 'Amoxicillin 500mg', qty: 42, reorder: 100, batch: 'BAT-AMX-2026A' },
              { drug: 'Albuterol HFA', qty: 12, reorder: 30, batch: 'BAT-ALB-0082' },
              { drug: 'Epinephrine 1mg', qty: 4, reorder: 10, batch: 'BAT-EPI-0104' },
            ].map((stk) => (
              <div key={stk.drug} className="p-2.5 flex items-center justify-between hover:bg-surface-container-low/40 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-[#123047] dark:text-white">{stk.drug}</p>
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-mono font-medium">{stk.batch}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#C58A24] dark:text-[#E0A842] tabular-nums">{stk.qty} units</p>
                  <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Min: {stk.reorder}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/20">
            <Link
              href="/pharmacy/inventory"
              className="btn-secondary justify-center w-full py-1.5 text-xs"
            >
              <ClinivaIcon name="add_shopping_cart" size={16} strokeWidth={1.5} />
              <span>Reorder Stock</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
