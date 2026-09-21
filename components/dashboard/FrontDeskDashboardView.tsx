'use client'

import React, { useState } from 'react'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import QuickActionBar from '@/components/dashboard/QuickActionBar'
import LiveQueueTimePredictor from '@/components/dashboard/LiveQueueTimePredictor'

type Props = {
  userName: string
}

export default function FrontDeskDashboardView({ userName }: Props) {
  const { queue, setRegisterOpen, callNextPatient } = useClinicRealtime()
  const [searchTerm, setSearchTerm] = useState('')

  const waitingCount = queue.filter((p) => p.status === 'waiting').length
  const filteredPatients = queue.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.token).includes(searchTerm)
  )

  return (
    <div className="flex flex-col space-y-gutter-desktop">
      <RegisterPatientModal />

      {/* Quick Action Shortcuts */}
      <QuickActionBar className="w-full" />

      {/* Header */}
      <section
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-lg rounded-2xl"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-semibold">
            Front Desk & Registration
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Logged in as {userName} •{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            • OPD Live Active
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setRegisterOpen(true)}
            className="btn-primary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>{' '}
            <span>Register New Patient</span>
          </button>
          <button
            onClick={() => setRegisterOpen(true)}
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>{' '}
            <span>Issue Token</span>
          </button>
          <button
            onClick={() => callNextPatient()}
            className="btn-secondary justify-center touch-tap flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>{' '}
            <span>Call Next In Line</span>
          </button>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KPICard
          title="Checked In Today"
          value={47 + queue.length - 6}
          icon="how_to_reg"
          trend="+12% vs yesterday"
          trendDir="up"
          subtitle="23 OP • 24 IP"
        />
        <KPICard
          title="Waiting in OPD"
          value={waitingCount}
          icon="airline_seat_recline_extra"
          trend="18m avg wait"
          trendDir="neutral"
          subtitle={`${waitingCount} pending`}
          live
        />
        <KPICard
          title="Latest Token Issued"
          value={`#${queue[queue.length - 1]?.token ?? 12}`}
          icon="confirmation_number"
          trend="Monotonic counter"
          trendDir="neutral"
          subtitle="Real-time"
        />
        <KPICard
          title="Appointments Today"
          value={32}
          icon="calendar_today"
          trend="4 no-shows"
          trendDir="down"
          subtitle="28 attended"
        />
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
        {/* Live Waiting List & Time Predictor */}
        <LiveQueueTimePredictor department="All" className="xl:col-span-2" />

        {/* Doctor Availability */}
        <div className="flex flex-col gap-space-md">
          <div className="clinical-card flex flex-col">
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
              <h3 className="font-heading text-headline-sm text-on-surface font-semibold">
                Doctor Availability
              </h3>
              <LiveIndicator size="sm" />
            </div>
            <div className="divide-y divide-outline-variant/10">
              {[
                { name: 'Dr. Sarah Jenkins', dept: 'Cardiology', queue: waitingCount, status: 'available' },
                { name: 'Dr. Raj Patel', dept: 'Neurology', queue: 3, status: 'busy' },
                { name: 'Dr. Lisa Wong', dept: 'Orthopedics', queue: 0, status: 'away' },
                { name: 'Dr. Omar Hassan', dept: 'Pediatrics', queue: 4, status: 'available' },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between px-space-md py-space-sm hover:bg-surface-container-low/50 transition-colors"
                >
                  <div>
                    <p className="text-label-md text-on-surface font-medium">{doc.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{doc.dept}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge
                      variant={
                        doc.status === 'available'
                          ? 'routine'
                          : doc.status === 'busy'
                          ? 'warning'
                          : 'neutral'
                      }
                      label={doc.status}
                    />
                    <span className="text-label-sm text-on-surface-variant">
                      {doc.queue} in queue
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
