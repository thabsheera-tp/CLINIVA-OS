# Cliniva OS

Cloud-native, modular EMR/HMS platform for small-to-medium clinics.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (Cliniva Soft UI design system)
- **Backend/Auth:** Supabase (Postgres + Auth + Realtime + Storage)
- **Icons:** Material Symbols Outlined
- **Fonts:** Plus Jakarta Sans (headings) + Inter (body)

## Getting Started

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase project URL and anon key.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Apply database migrations** (requires Supabase CLI):
   ```bash
   supabase db push
   ```
   Or run each file in `supabase/migrations/` in order via the Supabase Dashboard SQL editor.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cliniva-os/
├── app/                          # Next.js App Router
│   ├── login/                    # Login & Role Portal
│   ├── doctor/                   # Doctor Portal Dashboard
│   ├── front-desk/               # Front Desk & Registration
│   ├── nursing/                  # Nursing & IP Ward
│   ├── pharmacy/                 # Pharmacy & Inventory
│   ├── lab/                      # Lab & Diagnostics
│   ├── billing/                  # Billing & Cashier
│   ├── admin/                    # Admin & Management
│   ├── canteen/                  # Canteen & Dietary
│   └── portal/                   # Patient Mobile Portal
├── components/
│   ├── layout/                   # Sidebar, TopBar, DashboardShell
│   └── ui/                       # KPICard, StatusBadge, LiveIndicator
├── lib/supabase/                 # Server + Browser Supabase clients
├── hooks/                        # useRealtimeSubscription
├── supabase/migrations/          # 15 SQL migrations (0001–0015)
├── stitch-exports/               # Original Stitch HTML reference designs
└── design-system/                # Design tokens & specs
```

## Role-Based Access

| Role | Route | Description |
|------|-------|-------------|
| `doctor` | `/doctor` | Clinical dashboard, queue, vitals, prescriptions |
| `front_desk` | `/front-desk` | Patient registration, tokens, appointments |
| `nurse` | `/nursing` | Bed board, vitals entry, MAR |
| `pharmacist` | `/pharmacy` | Rx queue, inventory, dispensing |
| `lab_tech` | `/lab` | Test orders, sample tracking, results |
| `cashier` | `/billing` | Invoicing, payments, insurance |
| `admin` | `/admin` | Module toggles, staff, audit logs |
| `canteen` | `/canteen` | Meal orders, kitchen, inventory |
| `patient` | `/portal` | Mobile portal, queue tracker, records |

## Database Migrations (Supabase)

Run in order via `supabase db push` or Dashboard SQL editor:

1. `0001_enums.sql` — Shared PostgreSQL enum types
2. `0002_tenants.sql` — Multi-tenant clinic registry + feature flags
3. `0003_auth_profiles.sql` — Staff/patient profiles + role sync trigger
4. `0004_patients.sql` — Patient master records (MRN, demographics, dietary)
5. `0005_appointments.sql` — OPD queue + token issuance
6. `0006_vitals.sql` — Vital signs with computed BMI
7. `0007_consultations.sql` — SOAP consultation notes + ICD-10
8. `0008_prescriptions.sql` — E-prescriptions + MAR + medication formulary
9. `0009_lab_orders.sql` — Lab orders + results + critical value flags
10. `0010_beds.sql` — Ward/bed management + admission tracking
11. `0011_pharmacy.sql` — Pharmacy inventory + purchase orders
12. `0012_billing.sql` — Invoices + payments + insurance claims
13. `0013_canteen.sql` — Meal orders + menu + kitchen inventory
14. `0014_audit_log.sql` — HIPAA write-only audit trail
15. `0015_realtime_grants.sql` — Supabase Realtime publication setup

## Compliance Notes

- All tables use Row Level Security (RLS) — no data leaks across tenants
- Audit log is write-only from application layer (trigger-only INSERTs)
- For full HIPAA compliance, use Supabase Team/Enterprise plan (required for BAA)
- `.env.local` must never be committed to version control
