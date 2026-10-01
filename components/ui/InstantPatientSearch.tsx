'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchPatients, type PatientRow } from '@/lib/data'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

// Fallback demo patients if DB has not yet been seeded
const DEMO_PATIENTS: PatientRow[] = [
  { id: 'p-1', mrn: '00482910', first_name: 'Marcus', last_name: 'Delacroix', dob: '1971-04-12', gender: 'male', phone: '+1 (555) 234-5678', email: 'm.delacroix@example.com', tenant_id: 't-1' },
  { id: 'p-2', mrn: '00482911', first_name: 'Priya', last_name: 'Mehta', dob: '1984-08-23', gender: 'female', phone: '+1 (555) 876-5432', email: 'priya.mehta@example.com', tenant_id: 't-1' },
  { id: 'p-3', mrn: '00482912', first_name: 'George', last_name: 'Tanner', dob: '1958-11-05', gender: 'male', phone: '+1 (555) 345-6789', email: null, tenant_id: 't-1' },
  { id: 'p-4', mrn: '00482913', first_name: 'Aisha', last_name: 'Nkosi', dob: '1996-03-17', gender: 'female', phone: '+1 (555) 456-7890', email: 'a.nkosi@example.com', tenant_id: 't-1' },
  { id: 'p-5', mrn: '00482914', first_name: 'David', last_name: 'Chen', dob: '1973-09-30', gender: 'male', phone: '+1 (555) 567-8901', email: 'd.chen@example.com', tenant_id: 't-1' },
  { id: 'p-6', mrn: '00482915', first_name: 'Maria', last_name: 'Sanchez', dob: '1987-12-14', gender: 'female', phone: '+1 (555) 678-9012', email: 'm.sanchez@example.com', tenant_id: 't-1' },
]

interface InstantPatientSearchProps {
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onSelectPatient?: (patient: PatientRow) => void
}

export default function InstantPatientSearch({
  placeholder = 'Search patients by name, phone, or MRN...',
  className = '',
  autoFocus = false,
  onSelectPatient,
}: InstantPatientSearchProps) {
  const router = useRouter()
  const { setBookingOpen, setVitalsOpen, setRegisterOpen } = useClinicRealtime()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatientRow[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Global ⌘K / Ctrl+K hotkey to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search effect (250ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const dbResults = await fetchPatients(query.trim())
        if (dbResults && dbResults.length > 0) {
          setResults(dbResults)
        } else {
          // Fallback search over demo patients
          const q = query.toLowerCase()
          const matched = DEMO_PATIENTS.filter(
            (p) =>
              p.first_name.toLowerCase().includes(q) ||
              p.last_name.toLowerCase().includes(q) ||
              p.mrn.includes(q) ||
              p.phone.includes(q)
          )
          setResults(matched)
        }
      } catch {
        const q = query.toLowerCase()
        const matched = DEMO_PATIENTS.filter(
          (p) =>
            p.first_name.toLowerCase().includes(q) ||
            p.last_name.toLowerCase().includes(q) ||
            p.mrn.includes(q) ||
            p.phone.includes(q)
        )
        setResults(matched)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = (patient: PatientRow) => {
    setIsOpen(false)
    if (onSelectPatient) {
      onSelectPatient(patient)
    } else {
      router.push(`/doctor/patients/${patient.mrn}`)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <ClinivaIcon name="search" size={18} strokeWidth={1.5} className="absolute left-3.5 text-[#60727F] dark:text-[#92A6B5]" />
        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-16 py-2 bg-[#F7F9FA] dark:bg-[#122433] border border-[#E2E8EC] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#172B3A] dark:text-[#E8F0F5] focus:outline-none focus:border-[#0F8B8D] focus:ring-1 focus:ring-[#0F8B8D]/20 placeholder:text-[#60727F] dark:placeholder:text-[#92A6B5] transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 p-1 text-[#60727F] hover:text-[#172B3A] dark:text-[#92A6B5] dark:hover:text-white"
          >
            <ClinivaIcon name="close" size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <kbd className="absolute right-3 text-[11px] bg-[#F0F4F7] dark:bg-white/10 text-[#60727F] dark:text-[#92A6B5] px-1.5 py-0.5 rounded border border-[#E2E8EC] dark:border-white/[0.08] font-mono pointer-events-none">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Floating Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-12 max-h-96 overflow-y-auto bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] shadow-card z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-2 p-2">
              <div className="h-4 w-28 bg-[#E2E8EC] dark:bg-white/10 rounded animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[#F7F9FA] dark:bg-white/[0.03] animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[#E2E8EC] dark:bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-[#E2E8EC] dark:bg-white/10 rounded" />
                    <div className="h-2.5 w-48 bg-[#EEF2F5] dark:bg-white/[0.06] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-label-sm text-[#60727F] dark:text-[#92A6B5] uppercase font-semibold flex items-center justify-between">
                <span>Matching Patients ({results.length})</span>
                <span className="text-[11px] font-normal lowercase">Press Enter or click to view chart</span>
              </div>

              {results.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F9FA] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 border border-[#0F8B8D]/30 flex items-center justify-center text-[#0F8B8D] dark:text-[#28B5B7] font-bold text-xs flex-shrink-0">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#172B3A] dark:text-[#E8F0F5] text-xs sm:text-sm truncate">
                          {patient.first_name} {patient.last_name}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#0F8B8D] dark:text-[#28B5B7] px-1.5 py-0.2 rounded bg-[#F7F9FA] dark:bg-white/[0.05] border border-[#E2E8EC] dark:border-white/[0.08]">
                          #{patient.mrn}
                        </span>
                      </div>
                      <p className="text-xs text-[#60727F] dark:text-[#92A6B5] truncate">
                        {patient.gender} • {patient.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(false)
                        setBookingOpen(true)
                      }}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-[#162636] hover:bg-[#F0F4F7] dark:hover:bg-white/[0.08] rounded-md font-medium text-[#172B3A] dark:text-[#E8F0F5] border border-[#E2E8EC] dark:border-white/[0.08] transition-colors"
                      title="Book Appointment"
                    >
                      Book
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(false)
                        setVitalsOpen(true)
                      }}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-[#162636] hover:bg-[#F0F4F7] dark:hover:bg-white/[0.08] rounded-md font-medium text-[#172B3A] dark:text-[#E8F0F5] border border-[#E2E8EC] dark:border-white/[0.08] transition-colors"
                      title="Record Vitals"
                    >
                      Vitals
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State with Quick Register action */}
          {!loading && results.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <ClinivaIcon name="person_search" size={32} strokeWidth={1.5} className="mx-auto text-[#A0B0BC]" />
              <p className="text-xs sm:text-sm text-[#60727F] dark:text-[#92A6B5]">
                No patient found matching &quot;<span className="font-semibold text-[#172B3A] dark:text-white">{query}</span>&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setRegisterOpen(true)
                }}
                className="btn-primary text-xs py-1.5 px-4 mx-auto inline-flex items-center gap-1.5"
              >
                <ClinivaIcon name="person_add" size={16} strokeWidth={1.5} />
                <span>Register New Patient</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
