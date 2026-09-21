import Link from 'next/link'

export default function NotFound() {
  const WORKSPACES = [
    { label: 'Doctor Workspace', path: '/doctor', icon: 'stethoscope', desc: 'OPD consults & prescriptions' },
    { label: 'Front Desk & OPD', path: '/front-desk', icon: 'badge', desc: 'Patient registration & queue tokens' },
    { label: 'Nursing & IP Ward', path: '/nursing', icon: 'local_hospital', desc: 'Bed board & vitals telemetry' },
    { label: 'Pharmacy & Stock', path: '/pharmacy', icon: 'pill', desc: 'Dispensing & drug inventory' },
    { label: 'Lab & Diagnostics', path: '/lab', icon: 'science', desc: 'Specimens & test results' },
    { label: 'Billing & Cashier', path: '/billing', icon: 'receipt_long', desc: 'Invoices & POS payments' },
    { label: 'Admin & Operations', path: '/admin', icon: 'admin_panel_settings', desc: 'Staff, modules & audit' },
    { label: 'Canteen & Meals', path: '/canteen', icon: 'restaurant', desc: 'Patient dietary & meal orders' },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-on-surface">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-secondary-fixed/50 text-primary shadow-sm">
          <span className="material-symbols-outlined text-[44px]">healing</span>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant text-label-sm font-semibold uppercase tracking-wider">
            HTTP 404 — Screen Not Found
          </span>
          <h1 className="font-heading text-headline-xl font-bold mt-3 text-on-surface tracking-tight">
            Page Not Found
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-md mx-auto mt-2">
            The screen or sub-module you requested does not exist or has been moved in Cliniva OS.
          </p>
        </div>

        <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-left shadow-sm">
          <h2 className="text-label-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
            Jump to an Active Department Workspace:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKSPACES.map((w) => (
              <Link
                key={w.path}
                href={w.path}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{w.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {w.label}
                  </div>
                  <div className="text-body-sm text-on-surface-variant truncate">
                    {w.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/doctor"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Return to Main Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
