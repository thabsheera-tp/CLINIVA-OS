'use client'

import React, { useState } from 'react'
import KPICard from '@/components/ui/KPICard'
import StatusBadge from '@/components/ui/StatusBadge'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'
import RegisterPatientModal from '@/components/modals/RegisterPatientModal'
import PatientPortalQrCard from '@/components/dashboard/PatientPortalQrCard'

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
    <div className="flex flex-col w-full space-y-5">
      <RegisterPatientModal />

      {/* ── 1. Compact Header ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#122433] px-5 py-4 rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-base sm:text-lg font-bold text-[#123047] dark:text-white tracking-tight">
              Reception & Patient Intake
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7] border border-[#0F8B8D]/30">
              Front Desk Station
            </span>
          </div>
          <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
            OPD Registration & Token Queue • {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => callNextPatient()}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <ClinivaIcon name="notifications_active" size={16} strokeWidth={1.5} className="text-[#0F8B8D]" />
            <span>Call Next</span>
          </button>
          <button
            onClick={() => setRegisterOpen(true)}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
          >
            <ClinivaIcon name="person_add" size={16} strokeWidth={1.5} />
            <span>Register Patient</span>
          </button>
        </div>
      </section>

      {/* ── 2. Compact KPI Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Waiting in OPD"
          value={waitingCount}
          icon="airline_seat_recline_extra"
          subtitle={`${waitingCount} pending`}
          live
        />
        <KPICard
          title="Checked In"
          value={47 + queue.length - 6}
          icon="how_to_reg"
          subtitle="23 OP • 24 IP"
        />
        <KPICard
          title="Latest Token"
          value={`#${queue[queue.length - 1]?.token ?? 12}`}
          icon="confirmation_number"
          subtitle="Real-time counter"
        />
        <KPICard
          title="Appointments"
          value={32}
          icon="calendar_today"
          subtitle="28 attended • 4 due"
        />
      </section>

      {/* ── 3. Queue & Doctor Status ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Patient Queue Table */}
        <div className="xl:col-span-2 bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
                Live Token Queue ({filteredPatients.length})
              </h3>
              <LiveIndicator size="sm" />
            </div>

            <div className="relative w-full sm:w-56">
              <ClinivaIcon name="search" size={16} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4A5D6B] dark:text-[#9FB1C0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, token, complaint..."
                className="w-full pl-8 pr-3 py-1 bg-[#F7F9FA] dark:bg-[#162636] border border-[#E2E8EC] dark:border-white/[0.08] rounded-lg text-xs text-[#123047] dark:text-[#E8F0F5] placeholder:text-[#4A5D6B] dark:placeholder:text-[#9FB1C0] focus:outline-none focus:border-[#0F8B8D]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#E2E8EC] dark:border-white/[0.08] text-[#4A5D6B] dark:text-[#9FB1C0] uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Token</th>
                  <th className="py-2.5 px-3 font-bold">Patient</th>
                  <th className="py-2.5 px-3 font-bold">Complaint</th>
                  <th className="py-2.5 px-3 font-bold">Wait</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EC] dark:divide-white/[0.05]">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">
                      No patients match search.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F7F9FA] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#123047] dark:text-white">
                        #{p.token}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-sm text-[#123047] dark:text-white">{p.name}</span>
                        <span className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium ml-1.5">({p.age})</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium max-w-[200px] truncate">
                        {p.complaint}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{p.wait}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge
                          variant={p.status === 'in_examination' ? 'routine' : 'neutral'}
                          label={p.status ?? 'waiting'}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => callNextPatient()}
                          className="text-[#0F8B8D] dark:text-[#28B5B7] font-semibold text-xs hover:underline"
                        >
                          Call
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Doctor OPD Availability + Patient Portal QR */}
        <div className="space-y-4 flex flex-col">
          {/* Doctor OPD Availability */}
          <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] mb-3">
              <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
                Doctor OPD Status
              </h3>
              <span className="text-xs font-semibold text-[#0F8B8D] dark:text-[#28B5B7]">Live</span>
            </div>

            <div className="divide-y divide-[#E2E8EC]/80 dark:divide-white/[0.05]">
              {[
                { name: 'Dr. Sarah Jenkins', dept: 'Cardiology (Suite 304)', queue: waitingCount, status: 'available' },
                { name: 'Dr. Raj Patel', dept: 'Neurology (Suite 201)', queue: 3, status: 'busy' },
                { name: 'Dr. Lisa Wong', dept: 'Orthopedics (Suite 108)', queue: 0, status: 'away' },
                { name: 'Dr. Omar Hassan', dept: 'Pediatrics (Suite 112)', queue: 4, status: 'available' },
              ].map((doc) => (
                <div key={doc.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-sm text-[#123047] dark:text-white">{doc.name}</p>
                    <p className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{doc.dept}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <StatusBadge
                      variant={doc.status === 'available' ? 'routine' : doc.status === 'busy' ? 'warning' : 'neutral'}
                      label={doc.status}
                    />
                    <span className="text-xs font-medium text-[#4A5D6B] dark:text-[#9FB1C0]">{doc.queue} waiting</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Patient Portal QR Management ── */}
          <PatientPortalQrCard variant="compact" />
        </div>
      </div>
    </div>
  )
}
