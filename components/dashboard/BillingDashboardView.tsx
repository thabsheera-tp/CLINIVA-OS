'use client'

import React from 'react'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import CollectPaymentModal from '@/components/modals/CollectPaymentModal'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  userName: string
}

export default function BillingDashboardView({ userName }: Props) {
  const { setPaymentOpen } = useClinicRealtime()

  return (
    <div className="flex flex-col space-y-4">
      <CollectPaymentModal />

      {/* Clean Hospital Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Billing & Cashier</h1>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">
            Patient Invoices & Payment Settlement • {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaymentOpen(true)}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            <ClinivaIcon name="receipt_long" size={16} strokeWidth={1.5} />
            <span>Collect Payment</span>
          </button>
        </div>
      </section>

      {/* Compact KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Today's Collections"
          value="$3,840.50"
          icon="account_balance_wallet"
          trend="+8.3% vs yesterday"
          trendDir="up"
        />
        <KPICard
          title="Pending Invoices"
          value={7}
          icon="pending_actions"
          trend="$1,240 outstanding"
          trendDir="down"
        />
        <KPICard
          title="Invoices Generated"
          value={32}
          icon="receipt_long"
          trend="+5 from yesterday"
          trendDir="up"
        />
        <KPICard
          title="Insurance Claims"
          value={4}
          icon="health_and_safety"
          trend="3 submitted"
          trendDir="neutral"
        />
      </section>

      {/* Main Grid: Pending Invoices & Settlement */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pending Invoices */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">Pending Invoices</h3>
            <span className="text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
              7 Outstanding
            </span>
          </div>

          {/* Mobile Invoices Cards (< sm screens) */}
          <div className="block sm:hidden divide-y divide-outline-variant/10 p-2">
            {[
              { inv: 'INV-2281', patient: 'Marcus Delacroix', services: 'Consultation + Labs', amount: '$173.25', due: 'Today', status: 'overdue' },
              { inv: 'INV-2282', patient: 'Priya Mehta', services: 'OPD + Pharmacy', amount: '$65.00', due: 'Today', status: 'pending' },
              { inv: 'INV-2283', patient: 'George Tanner', services: 'IP Bed + Surgery', amount: '$1,420.00', due: 'Tomorrow', status: 'pending' },
              { inv: 'INV-2284', patient: 'Aisha Nkosi', services: 'Emergency + IP', amount: '$640.00', due: '+3 days', status: 'partial' },
              { inv: 'INV-2285', patient: 'David Chen', services: 'Diabetes Package', amount: '$180.00', due: '+5 days', status: 'pending' },
            ].map((row) => (
              <div key={row.inv} className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#123047] dark:text-white font-bold">{row.inv}</span>
                  <StatusBadge
                    variant={
                      row.status === 'overdue'
                        ? 'critical'
                        : row.status === 'partial'
                        ? 'warning'
                        : 'neutral'
                    }
                    label={row.status.toUpperCase()}
                    pulse={row.status === 'overdue'}
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#123047] dark:text-white">{row.patient}</p>
                    <p className="text-xs text-[#253848] dark:text-[#D9E5F0] font-medium">{row.services}</p>
                    <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Due: {row.due}</p>
                  </div>
                  <span className="text-base font-bold font-mono text-[#123047] dark:text-white tabular-nums">
                    {row.amount}
                  </span>
                </div>
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="btn-primary w-full justify-center py-1.5 text-xs font-semibold"
                >
                  <ClinivaIcon name="receipt_long" size={16} strokeWidth={1.5} />
                  <span>Collect Payment</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Invoices Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/20 text-[#4A5D6B] dark:text-[#9FB1C0] text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-bold">Invoice #</th>
                  <th className="px-4 py-2.5 font-bold">Patient</th>
                  <th className="px-4 py-2.5 font-bold">Services</th>
                  <th className="px-4 py-2.5 font-bold">Due Date</th>
                  <th className="px-4 py-2.5 font-bold">Amount</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  { inv: 'INV-2281', patient: 'Marcus Delacroix', services: 'Consultation + Labs', amount: '$173.25', due: 'Today', status: 'overdue' },
                  { inv: 'INV-2282', patient: 'Priya Mehta', services: 'OPD + Pharmacy', amount: '$65.00', due: 'Today', status: 'pending' },
                  { inv: 'INV-2283', patient: 'George Tanner', services: 'IP Bed + Surgery', amount: '$1,420.00', due: 'Tomorrow', status: 'pending' },
                  { inv: 'INV-2284', patient: 'Aisha Nkosi', services: 'Emergency + IP', amount: '$640.00', due: '+3 days', status: 'partial' },
                  { inv: 'INV-2285', patient: 'David Chen', services: 'Diabetes Package', amount: '$180.00', due: '+5 days', status: 'pending' },
                ].map((row) => (
                  <tr
                    key={row.inv}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-[#123047] dark:text-white">
                      {row.inv}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-sm text-[#123047] dark:text-white">
                      {row.patient}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] font-medium text-[#253848] dark:text-[#D9E5F0]">
                      {row.services}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                      {row.due}
                    </td>
                    <td className="px-4 py-2.5 font-bold font-mono text-sm text-[#123047] dark:text-white tabular-nums">
                      {row.amount}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        variant={
                          row.status === 'overdue'
                            ? 'critical'
                            : row.status === 'partial'
                            ? 'warning'
                            : 'neutral'
                        }
                        label={row.status.toUpperCase()}
                        pulse={row.status === 'overdue'}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setPaymentOpen(true)}
                        className="btn-primary py-1 px-3 text-xs font-semibold"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Cash Drawer POS Settlement */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/40">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
                Cash Drawer & Settlement
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2 p-3 bg-surface-container-low/50 rounded-lg border border-outline-variant/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Cash in Drawer</span>
                  <span className="font-bold font-mono text-xs text-[#123047] dark:text-white">$1,450.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">Card Settlements</span>
                  <span className="font-bold font-mono text-xs text-[#123047] dark:text-white">$2,390.50</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 font-bold">
                  <span className="text-xs font-bold text-[#123047] dark:text-white">Total Reconciled</span>
                  <span className="text-[#0F8B8D] dark:text-[#28B5B7] text-sm font-mono font-bold">$3,840.50</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/20">
            <button
              onClick={() => setPaymentOpen(true)}
              className="btn-secondary justify-center w-full py-2 text-xs font-semibold"
            >
              <ClinivaIcon name="point_of_sale" size={16} strokeWidth={1.5} />
              <span>Open POS Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
