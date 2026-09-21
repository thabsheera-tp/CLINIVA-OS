'use client'

import React from 'react'
import InstantBookingModal from './InstantBookingModal'
import CreatePrescriptionModal from './CreatePrescriptionModal'
import RegisterPatientModal from './RegisterPatientModal'
import RecordVitalsModal from './RecordVitalsModal'
import StartConsultationModal from './StartConsultationModal'
import DispenseMedicationModal from './DispenseMedicationModal'
import CollectPaymentModal from './CollectPaymentModal'

/**
 * GlobalModalRoot mounts all application clinical dialogs at the root level.
 * This ensures modals can be opened from anywhere in the app (TopBar search,
 * quick action buttons, keyboard shortcuts, or table action menus).
 */
export default function GlobalModalRoot() {
  return (
    <>
      <InstantBookingModal />
      <CreatePrescriptionModal />
      <RegisterPatientModal />
      <RecordVitalsModal />
      <StartConsultationModal />
      <DispenseMedicationModal />
      <CollectPaymentModal />
    </>
  )
}
