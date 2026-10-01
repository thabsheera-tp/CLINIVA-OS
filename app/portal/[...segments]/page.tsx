import PatientPortalApp, { type PortalTab } from '@/components/portal/PatientPortalApp'

export const metadata = { title: 'Patient Portal — Cliniva OS' }

export default function PortalSubPage({ params }: { params: { segments: string[] } }) {
  const slug = params.segments?.[0] || 'dashboard'

  let tab: PortalTab = 'dashboard'
  if (slug === 'appointments' || slug === 'queue') {
    tab = 'appointments'
  } else if (slug === 'consultations') {
    tab = 'consultations'
  } else if (slug === 'prescriptions' || slug === 'medications' || slug === 'reminders') {
    tab = 'prescriptions'
  } else if (slug === 'labs' || slug === 'lab-reports' || slug === 'records') {
    tab = 'labs'
  } else if (slug === 'billing' || slug === 'payments' || slug === 'invoices') {
    tab = 'billing'
  } else if (slug === 'profile') {
    tab = 'profile'
  }

  return <PatientPortalApp initialTab={tab} />
}
