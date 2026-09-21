'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchPatients, type PatientRow } from '@/lib/data'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

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
        <span className="material-symbols-outlined absolute left-3.5 text-outline text-[18px]">
          search
        </span>
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
          className="w-full pl-10 pr-16 py-2 bg-surface-container-low border border-outline-variant/40 rounded-full text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/70 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 p-1 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        ) : (
          <kbd className="absolute right-3 text-label-sm bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/40 font-mono text-[11px] pointer-events-none">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Floating Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-12 max-h-96 overflow-y-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-modal z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-2 p-2">
              <div className="h-4 w-28 bg-surface-container-high rounded animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-surface-container-high rounded" />
                    <div className="h-2.5 w-48 bg-surface-container rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-label-sm text-on-surface-variant uppercase font-semibold flex items-center justify-between">
                <span>Matching Patients ({results.length})</span>
                <span className="text-[11px] font-normal lowercase">Press Enter or click to view chart</span>
              </div>

              {results.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md flex-shrink-0">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface text-body-md truncate">
                          {patient.first_name} {patient.last_name}
                        </span>
                        <span className="font-mono text-label-sm font-semibold text-primary px-1.5 py-0.2 rounded bg-surface-container">
                          #{patient.mrn}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant truncate">
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
                      className="px-2 py-1 text-label-sm bg-surface-container hover:bg-surface-container-high rounded-lg font-medium text-on-surface"
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
                      className="px-2 py-1 text-label-sm bg-surface-container hover:bg-surface-container-high rounded-lg font-medium text-on-surface"
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
              <span className="material-symbols-outlined text-outline text-[32px]">person_search</span>
              <p className="text-body-sm text-on-surface-variant">
                No patient found matching &quot;<span className="font-semibold text-on-surface">{query}</span>&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setRegisterOpen(true)
                }}
                className="btn-primary text-label-sm py-1.5 px-4 mx-auto inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Register New Patient</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
