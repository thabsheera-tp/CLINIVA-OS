import PatientPortalApp from '@/components/portal/PatientPortalApp'

export const metadata = {
  title: 'Patient Portal — Cliniva OS',
  description: 'Digital patient health records, appointments, prescriptions & lab reports',
}

export default function PatientPortal() {
  return <PatientPortalApp initialTab="dashboard" />
}
