'use client'

import React from 'react'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import CollectPaymentModal from '@/components/modals/CollectPaymentModal'

type Props = {
  userName: string
}

export default function BillingDashboardView({ userName }: Props) {
  const { setPaymentOpen } = useClinicRealtime()

  return (
    <div className="flex flex-col space-y-gutter-desktop">
      <CollectPaymentModal />

      <section
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-semibold">
            Billing & Cashier Terminal
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Cashier Station • {userName} •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setPaymentOpen(true)}
            className="btn-primary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Collect Payment</span>
          </button>
          <button
            onClick={() => setPaymentOpen(true)}
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Quick Receipt</span>
          </button>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Today's Collections"
          value="$3,840.50"
          icon="account_balance_wallet"
          trend="+8.3% vs yesterday"
          trendDir="up"
          subtitle="Card + Cash + Insurance"
        />
        <KPICard
          title="Pending Payments"
          value={7}
          icon="pending_actions"
          trend="$1,240 outstanding"
          trendDir="down"
          subtitle="7 invoices"
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
          trend="$820 pending"
          trendDir="neutral"
          subtitle="3 submitted"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
        {/* Pending Payments */}
        <div className="xl:col-span-2 clinical-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md border-b border-outline-variant/20 gap-2">
            <div className="flex items-center gap-space-sm">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Pending Invoices & Copay
              </h3>
              <StatusBadge variant="warning" label="7 Outstanding" />
            </div>
            <button
              onClick={() => setPaymentOpen(true)}
              className="btn-ghost text-label-sm py-1 px-space-md touch-tap self-start sm:self-auto"
            >
              + Create Invoice
            </button>
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
                  <span className="text-label-sm font-mono text-on-surface-variant">{row.inv}</span>
                  <StatusBadge
                    variant={
                      row.status === 'overdue'
                        ? 'critical'
                        : row.status === 'partial'
                        ? 'warning'
                        : 'neutral'
                    }
                    label={row.status}
                    pulse={row.status === 'overdue'}
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">{row.patient}</p>
                    <p className="text-body-sm text-on-surface-variant">{row.services}</p>
                    <p className="text-body-sm text-on-surface-variant">Due: {row.due}</p>
                  </div>
                  <span className="text-headline-sm font-bold text-on-surface tabular-nums">
                    {row.amount}
                  </span>
                </div>
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="btn-primary w-full justify-center py-2 text-label-md touch-tap"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>Collect Payment →</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Invoices Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/30">
                  {['Invoice #', 'Patient', 'Services', 'Amount', 'Due Date', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-space-md py-space-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-body-sm">
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
                    <td className="px-space-md py-space-sm text-label-sm text-on-surface-variant font-mono">
                      {row.inv}
                    </td>
                    <td className="px-space-md py-space-sm text-label-lg text-on-surface font-semibold">
                      {row.patient}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {row.services}
                    </td>
                    <td className="px-space-md py-space-sm text-label-lg text-on-surface font-semibold tabular-nums">
                      {row.amount}
                    </td>
                    <td className="px-space-md py-space-sm text-body-sm text-on-surface-variant">
                      {row.due}
                    </td>
                    <td className="px-space-md py-space-sm">
                      <StatusBadge
                        variant={
                          row.status === 'overdue'
                            ? 'critical'
                            : row.status === 'partial'
                            ? 'warning'
                            : 'neutral'
                        }
                        label={row.status}
                        pulse={row.status === 'overdue'}
                      />
                    </td>
                    <td className="px-space-md py-space-sm text-right">
                      <button
                        onClick={() => setPaymentOpen(true)}
                        className="btn-primary py-1 px-space-md text-label-sm touch-tap"
                      >
                        Collect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Payment Settlement Box */}
        <div className="clinical-card p-space-md flex flex-col gap-space-md justify-between">
          <div>
            <h3 className="font-heading text-headline-sm text-on-surface font-semibold mb-1">
              Terminal POS Settlement
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-space-md">
              Process direct point-of-sale card transactions, digital payments, and cash drawer reconciliations.
            </p>
            <div className="space-y-space-sm p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Cash in Drawer</span>
                <span className="font-bold text-on-surface">$1,450.00</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Card Settlements</span>
                <span className="font-bold text-on-surface">$2,390.50</span>
              </div>
              <div className="flex items-center justify-between text-body-sm pt-2 border-t border-outline-variant/20">
                <span className="font-semibold text-on-surface">Total Reconciled</span>
                <span className="font-heading text-headline-sm font-bold text-primary">$3,840.50</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPaymentOpen(true)}
            className="btn-primary justify-center w-full"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            Open POS Register
          </button>
        </div>
      </div>
    </div>
  )
}
