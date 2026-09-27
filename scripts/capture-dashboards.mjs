#!/usr/bin/env node
/**
 * Cliniva OS — High-Resolution Clinical Dashboard Screenshot Engine
 * 
 * Captures pixel-perfect, ultra-high-resolution (3840x2160 @ 2x DPR) screenshots
 * of all clinical workspaces and compiles them into an interactive demo showcase.
 *
 * Usage:
 *   node scripts/capture-dashboards.mjs
 *   node scripts/capture-dashboards.mjs --all
 *   node scripts/capture-dashboards.mjs --stitch-only
 *   node scripts/capture-dashboards.mjs --dpr=2 --port=3000
 */

import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import puppeteer from 'puppeteer-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Command-line arguments parsing
const args = process.argv.slice(2)
const getArgValue = (prefix, fallback) => {
  const found = args.find((a) => a.startsWith(prefix))
  return found ? found.split('=')[1] : fallback
}

const PORT = parseInt(getArgValue('--port=', '3000'), 10)
const DPR = parseFloat(getArgValue('--dpr=', '2'))
const WIDTH = parseInt(getArgValue('--width=', '1920'), 10)
const HEIGHT = parseInt(getArgValue('--height=', '1080'), 10)
const CAPTURE_STITCH_ONLY = args.includes('--stitch-only')
const CAPTURE_ALL = args.includes('--all')
const CAPTURE_LIVE_ONLY = !CAPTURE_STITCH_ONLY && !CAPTURE_ALL

const OUTPUT_DIRS = [
  path.join(ROOT_DIR, 'showcase', 'screenshots'),
  path.join(ROOT_DIR, 'public', 'showcase', 'screenshots'),
]

// Ensure output directories exist
for (const dir of OUTPUT_DIRS) {
  fs.mkdirSync(dir, { recursive: true })
}

// Browser executable resolver (checks Windows Edge, Chrome, macOS, Linux)
function findBrowserExecutable() {
  const envPath = process.env.EDGE_PATH || process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH
  if (envPath && fs.existsSync(envPath)) return envPath

  const candidates = [
    // Windows Edge
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // Windows Chrome
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Microsoft\\Edge SxS\\Application\\msedge.exe`,
    // macOS
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Linux
    '/usr/bin/microsoft-edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error(
    'No Chromium-based browser (Microsoft Edge or Google Chrome) was found on this system.\n' +
    'Please set the EDGE_PATH or CHROME_PATH environment variable.'
  )
}

// Clinical Dashboards Catalog with detailed metadata
const CLINICAL_DASHBOARDS = [
  {
    id: 'doctor-cockpit',
    title: 'Clinical Cockpit & OPD',
    role: 'Attending Physician / Cardiologist',
    category: 'Clinical & Inpatient',
    route: '/doctor',
    demoRole: 'doctor',
    stitchFile: 'doctor-portal.html',
    badge: 'Real-Time EHR',
    badgeColor: 'emerald',
    description:
      'High-velocity consultation interface featuring real-time patient queue, live vitals telemetry (BP, HR, SpO2), quick SOAP notes, and 1-click consultation initiation.',
    keyMetrics: [
      { label: "Today's Schedule", value: '18 Consults' },
      { label: 'Live in Queue', value: '5 Patients' },
      { label: 'Pending STAT', value: '3 Critical' },
      { label: 'Avg Wait Time', value: '14 mins' },
    ],
  },
  {
    id: 'doctor-queue',
    title: 'OPD Live Queue & Patient Flow',
    role: 'OPD Physician & Triage Lead',
    category: 'Clinical & Inpatient',
    route: '/doctor/queue',
    demoRole: 'doctor',
    stitchFile: 'doctor-portal.html',
    badge: 'Smart Triage',
    badgeColor: 'sky',
    description:
      'Intelligent patient pacing and queue sequencing with live acuity tags, emergency STAT overrides, and direct patient call bell management.',
    keyMetrics: [
      { label: 'Queue Capacity', value: '25 Slots' },
      { label: 'Triage Accuracy', value: '99.4%' },
      { label: 'Active Call', value: 'Token #7' },
      { label: 'Discharge Pace', value: '4.2/hr' },
    ],
  },
  {
    id: 'nursing-ward',
    title: 'Inpatient Ward & Bed Board',
    role: 'Charge Nurse (RN)',
    category: 'Clinical & Inpatient',
    route: '/nursing',
    demoRole: 'nurse',
    stitchFile: 'nursing-ward.html',
    badge: 'Live Telemetry',
    badgeColor: 'teal',
    description:
      'Comprehensive inpatient oversight displaying visual bed allocations, real-time vital telemetry streams, Medication Administration Records (MAR), and nurse shift handovers.',
    keyMetrics: [
      { label: 'Ward Occupancy', value: '88% (22/25)' },
      { label: 'Pending Meds', value: '4 Overdue' },
      { label: 'Fall Risk Alerts', value: '2 High Risk' },
      { label: 'Shift Roster', value: '6 RNs Active' },
    ],
  },
  {
    id: 'pharmacy-dispense',
    title: 'Pharmacy & Dispensing Hub',
    role: 'Chief Pharmacist',
    category: 'Diagnostic & Ancillary',
    route: '/pharmacy',
    demoRole: 'pharmacist',
    stitchFile: 'pharmacy.html',
    badge: 'FEFO Tracking',
    badgeColor: 'indigo',
    description:
      'Digital e-prescription dispensing line with FEFO (First-Expired, First-Out) batch verification, narcotic vault dual-signoff, and drug-drug interaction warning engines.',
    keyMetrics: [
      { label: 'Rx Queue', value: '12 Active' },
      { label: 'Dispense Speed', value: '3.1 min avg' },
      { label: 'Formulary Items', value: '1,420 SKU' },
      { label: 'Stock Stockouts', value: '0 Critical' },
    ],
  },
  {
    id: 'lab-diagnostics',
    title: 'Diagnostics & STAT Laboratory',
    role: 'Medical Laboratory Technologist',
    category: 'Diagnostic & Ancillary',
    route: '/lab',
    demoRole: 'lab_tech',
    stitchFile: 'lab-diagnostics.html',
    badge: 'STAT Priority',
    badgeColor: 'amber',
    description:
      'Automated laboratory workbench featuring barcode specimen accessioning, bi-directional analyzer telemetry, critical value panic alerts, and pathologist e-signatures.',
    keyMetrics: [
      { label: 'STAT Turnaround', value: '18 mins' },
      { label: 'Samples Run Today', value: '184 Tests' },
      { label: 'Panic Flag', value: 'Troponin-T STAT' },
      { label: 'Analyzer Uptime', value: '99.9%' },
    ],
  },
  {
    id: 'front-desk-opd',
    title: 'Front Desk & Patient Intake',
    role: 'Patient Care Coordinator',
    category: 'Front Office & Revenue',
    route: '/front-desk',
    demoRole: 'front_desk',
    stitchFile: 'front-desk.html',
    badge: 'Fast Intake',
    badgeColor: 'blue',
    description:
      'Express biometric and insurance patient intake terminal with token generation, physician schedule roster, clinic wait-time predictors, and wheelchair assistance dispatch.',
    keyMetrics: [
      { label: 'Registrations', value: '94 Today' },
      { label: 'Intake Velocity', value: '90s / Patient' },
      { label: 'Ins. Pre-Auth', value: '98% Instant' },
      { label: 'Token Active', value: '#118 Issued' },
    ],
  },
  {
    id: 'billing-cashier',
    title: 'Billing & Revenue Cycle',
    role: 'Cashier & Revenue Cycle Officer',
    category: 'Front Office & Revenue',
    route: '/billing',
    demoRole: 'cashier',
    stitchFile: 'billing-cashier.html',
    badge: 'Split Settlement',
    badgeColor: 'emerald',
    description:
      'High-security cashier terminal supporting split copay/insurance settlements, cashless QR payments, IPD interim bill reconciliation, and automatic financial audit logging.',
    keyMetrics: [
      { label: 'Daily Collections', value: '$42,850' },
      { label: 'Pending Claims', value: '14 Files' },
      { label: 'Collection Rate', value: '97.2%' },
      { label: 'Reconciliation', value: 'Zero Delta' },
    ],
  },
  {
    id: 'admin-operations',
    title: 'Hospital Governance & Admin',
    role: 'Medical Director / System Admin',
    category: 'Administration',
    route: '/admin',
    demoRole: 'admin',
    stitchFile: 'admin-management.html',
    badge: 'HIPAA Audited',
    badgeColor: 'purple',
    description:
      'Executive governance cockpit delivering multi-department census metrics, staff privilege provisioning, HL7/FHIR pipeline health, and immutable regulatory audit logs.',
    keyMetrics: [
      { label: 'Total Occupancy', value: '84.6%' },
      { label: 'Active Staff', value: '128 On-Duty' },
      { label: 'FHIR Throughput', value: '450 msg/sec' },
      { label: 'Security Grade', value: 'SOC-2 Ready' },
    ],
  },
  {
    id: 'canteen-dietary',
    title: 'Dietary & Nutrition Services',
    role: 'Clinical Dietitian & Canteen Manager',
    category: 'Administration',
    route: '/canteen',
    demoRole: 'canteen',
    stitchFile: 'canteen-dietary.html',
    badge: 'Therapeutic Menus',
    badgeColor: 'orange',
    description:
      'Specialized meal staging workstation synchronizing patient medical diets (diabetic, renal, NPO) with kitchen preparation, tray barcode dispatch, and staff cashless dining.',
    keyMetrics: [
      { label: 'Meal Trays Today', value: '340 Prepped' },
      { label: 'NPO Alerts', value: '8 Beds Active' },
      { label: 'Allergen Filter', value: '100% Guard' },
      { label: 'Kitchen Velocity', value: '12m Assembly' },
    ],
  },
  {
    id: 'patient-portal',
    title: 'Patient Health Portal & Locker',
    role: 'Patient Self-Service',
    category: 'Patient Self-Service',
    route: '/portal',
    demoRole: 'patient',
    stitchFile: 'patient-portal.html',
    badge: 'Encrypted Vault',
    badgeColor: 'cyan',
    description:
      'Modern, accessible mobile-responsive patient companion allowing verified discharge summary downloads, real-time lab report viewing, and medication schedule alerts.',
    keyMetrics: [
      { label: 'Active Users', value: '3,410' },
      { label: 'Report Downloads', value: '620 This Wk' },
      { label: 'Adherence Score', value: '94%' },
      { label: 'Access Portal', value: 'Zero Trust' },
    ],
  },
  {
    id: 'role-switcher-gateway',
    title: 'Clinical Switcher & Auth Gate',
    role: 'Universal Multi-Role Access',
    category: 'Patient Self-Service',
    route: '/login',
    demoRole: 'doctor',
    stitchFile: 'login-role-portal.html',
    badge: 'Instant Simulation',
    badgeColor: 'rose',
    description:
      'Enterprise role-switching terminal designed for executive demonstrations, enabling seamless 1-click transitions across all 9 hospital staff roles without re-authenticating.',
    keyMetrics: [
      { label: 'Hospital Roles', value: '9 Configured' },
      { label: 'Switch Speed', value: '< 200ms' },
      { label: 'MFA Emulation', value: 'Biometric/PIN' },
      { label: 'Session Isolation', value: 'Multi-Tenant' },
    ],
  },
  {
    id: 'platform-overview',
    title: 'Cliniva OS Platform Overview',
    role: 'Hospital Leadership & Enterprise',
    category: 'Administration',
    route: '/',
    demoRole: 'doctor',
    stitchFile: 'index.html',
    badge: 'Enterprise Architecture',
    badgeColor: 'emerald',
    description:
      'Comprehensive high-level view of the Cliniva OS cloud-native hospital operating system, outlining modular EMR, HL7/FHIR bridges, and departmental interoperability.',
    keyMetrics: [
      { label: 'Integrated Modules', value: '9 Clinical' },
      { label: 'Sub-Screens', value: '45+ Workspaces' },
      { label: 'Interoperability', value: 'FHIR R4' },
      { label: 'Architecture', value: 'Next.js 14 App' },
    ],
  },
]

// Check if dev server is alive
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Generate the interactive Showcase Viewer HTML
function generateShowcaseHtml(manifest) {
  const manifestJson = JSON.stringify(manifest, null, 2)
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100 antialiased">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cliniva OS — Clinical Dashboards Showcase & Architecture Demo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#ecfdf5',
              100: '#d1fae5',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
              800: '#065f46',
              900: '#064e3b',
            }
          }
        }
      }
    }
  </script>
  <style>
    /* Custom scrollbar and glass effects */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #020617; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
    .glass-panel {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge-glow {
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.25);
    }
    .screen-card:hover .screen-preview-img {
      transform: scale(1.025);
    }
  </style>
</head>
<body class="min-h-full flex flex-col bg-slate-950 font-sans selection:bg-emerald-500 selection:text-white">

  <!-- Top Global Bar -->
  <header class="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
          <span class="material-symbols-outlined text-[24px]">local_hospital</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold tracking-tight text-white">Cliniva OS</h1>
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Demo Showcase
            </span>
          </div>
          <p class="text-xs text-slate-400">High-Resolution Clinical Dashboards & System Architecture</p>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="flex items-center gap-6 text-xs text-slate-300">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span><strong class="text-white">${manifest.totalScreens}</strong> Clinical Dashboards</span>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-400 text-[16px]">hd</span>
          <span><strong class="text-white">${manifest.resolution}</strong> UHD 2x DPR</span>
        </div>
        <div class="hidden md:flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-400 text-[16px]">layers</span>
          <span>Next.js 14 App Router</span>
        </div>
        <a href="http://localhost:${PORT}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-sm">
          <span>Launch Live App</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Hero Banner -->
  <section class="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 py-12 px-6">
    <div class="max-w-7xl mx-auto text-center space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
        <span class="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
        <span>Pixel-Perfect High-Fidelity Capture Engine • St. Jude Medical Center Deployment</span>
      </div>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
        Complete Clinical Suite Showcase
      </h2>
      <p class="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
        Explore high-resolution captures of all Cliniva OS clinical workflows, from emergency cardiology consultation to inpatient ward bed management, laboratory panic telemetry, and split billing reconciliation.
      </p>

      <!-- Category Filter Tabs -->
      <div class="pt-6 flex flex-wrap justify-center gap-2" id="categoryFilter">
        <button data-cat="all" class="filter-btn active px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 shadow-md transition">
          All Dashboards (${manifest.totalScreens})
        </button>
        <button data-cat="Clinical & Inpatient" class="filter-btn px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white transition">
          🩺 Clinical & Inpatient
        </button>
        <button data-cat="Diagnostic & Ancillary" class="filter-btn px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white transition">
          💊 Diagnostic & Ancillary
        </button>
        <button data-cat="Front Office & Revenue" class="filter-btn px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white transition">
          💳 Front Office & Revenue
        </button>
        <button data-cat="Administration" class="filter-btn px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white transition">
          ⚙️ Administration & Canteen
        </button>
        <button data-cat="Patient Self-Service" class="filter-btn px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white transition">
          📱 Patient Self-Service
        </button>
      </div>
    </div>
  </section>

  <!-- Showcase Gallery Grid -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="screensGrid">
      <!-- Injected via JavaScript -->
    </div>
  </main>

  <!-- Modal / Fullscreen Lightbox -->
  <div id="lightboxModal" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl hidden flex-col">
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
      <div class="flex items-center gap-3">
        <span id="modalCategoryBadge" class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"></span>
        <h3 id="modalTitle" class="text-lg font-bold text-white"></h3>
        <span id="modalRole" class="text-xs text-slate-400 border-l border-slate-700 pl-3"></span>
      </div>
      <div class="flex items-center gap-3">
        <button id="toggleFullPageBtn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition">
          <span class="material-symbols-outlined text-[16px]">swap_vert</span>
          <span id="viewModeLabel">View Full Scrollable Page</span>
        </button>
        <a id="modalOpenLiveBtn" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition">
          <span>Open Live Screen</span>
          <span class="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
        <a id="modalDownloadBtn" download class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="Download High-Res Screenshot">
          <span class="material-symbols-outlined text-[18px]">download</span>
        </a>
        <button id="closeModalBtn" class="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-slate-700 transition" title="Close (Esc)">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>

    <!-- Modal Image Canvas -->
    <div class="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-slate-950/80 relative" id="modalCanvas">
      <div class="max-w-6xl w-full mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-950/20 bg-slate-900">
        <!-- Mock Browser Chrome Bar -->
        <div class="h-10 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span id="mockUrlBar" class="ml-4 font-mono text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800">
              http://localhost:${PORT}/doctor
            </span>
          </div>
          <div class="flex items-center gap-2 text-slate-500 text-xs">
            <span class="material-symbols-outlined text-[16px]">lock</span>
            <span>Cliniva OS SSL Verified</span>
          </div>
        </div>
        <img id="modalImg" src="" alt="Clinical Dashboard Preview" class="w-full h-auto block select-none" />
      </div>
    </div>

    <!-- Modal Footer Controls -->
    <div class="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
      <div class="flex items-center gap-4">
        <span>Use <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">←</kbd> and <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">→</kbd> to cycle screens</span>
        <span>Press <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">ESC</kbd> to exit</span>
      </div>
      <div class="flex items-center gap-2">
        <button id="prevScreenBtn" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">arrow_back</span> Prev
        </button>
        <span id="screenCounter" class="text-slate-400 px-2 font-mono">1 / ${manifest.totalScreens}</span>
        <button id="nextScreenBtn" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1">
          Next <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
        <span>Cliniva OS Demo Showcase • Generated: ${new Date(manifest.generatedAt).toLocaleString()}</span>
      </div>
      <div>
        <span>Resolution: ${manifest.resolution} @ ${manifest.deviceScaleFactor}x Retina DPR • St. Jude Medical Center</span>
      </div>
    </div>
  </footer>

  <script>
    const MANIFEST = ${manifestJson};
    let currentScreens = [...MANIFEST.dashboards];
    let currentIndex = 0;
    let showingFullPage = false;

    const screensGrid = document.getElementById('screensGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const lightboxModal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalRole = document.getElementById('modalRole');
    const modalCategoryBadge = document.getElementById('modalCategoryBadge');
    const mockUrlBar = document.getElementById('mockUrlBar');
    const modalOpenLiveBtn = document.getElementById('modalOpenLiveBtn');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    const toggleFullPageBtn = document.getElementById('toggleFullPageBtn');
    const viewModeLabel = document.getElementById('viewModeLabel');
    const screenCounter = document.getElementById('screenCounter');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const prevScreenBtn = document.getElementById('prevScreenBtn');
    const nextScreenBtn = document.getElementById('nextScreenBtn');

    // Render Grid
    function renderGrid(screens) {
      screensGrid.innerHTML = screens.map((screen, idx) => {
        return \`
          <div class="screen-card group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer" onclick="openLightbox(\${idx})">
            <!-- Thumbnail Hero Shot with Browser Framing -->
            <div class="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden border-b border-slate-800/80">
              <img 
                src="\${screen.heroImage}" 
                alt="\${screen.title}"
                class="screen-preview-img w-full h-full object-cover object-top transition-transform duration-500"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow-md">
                  <span class="material-symbols-outlined text-[16px]">zoom_in</span>
                  <span>Inspect 4K Fullscreen</span>
                </span>
              </div>
              <div class="absolute top-3 left-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  \${screen.badge || 'Live Module'}
                </span>
              </div>
            </div>

            <!-- Content Details -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>\${screen.category}</span>
                  <span class="font-mono text-emerald-400/90">\${screen.route}</span>
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  \${screen.title}
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  \${screen.description}
                </p>
              </div>

              <!-- Key Metrics Grid -->
              <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                \${screen.keyMetrics.slice(0, 2).map(m => \`
                  <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <div class="text-[10px] uppercase font-semibold text-slate-400">\${m.label}</div>
                    <div class="text-xs font-bold text-emerald-400">\${m.value}</div>
                  </div>
                \`).join('')}
              </div>

              <!-- Footer with Action Links -->
              <div class="pt-2 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium truncate max-w-[180px]">
                  👤 \${screen.role}
                </span>
                <span class="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Preview <span>→</span>
                </span>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Category Filtering
    categoryFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      categoryFilter.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-emerald-500', 'text-slate-950', 'active', 'shadow-md');
        b.classList.add('bg-slate-900', 'text-slate-300');
      });

      btn.classList.add('bg-emerald-500', 'text-slate-950', 'active', 'shadow-md');
      btn.classList.remove('bg-slate-900', 'text-slate-300');

      const cat = btn.getAttribute('data-cat');
      if (cat === 'all') {
        currentScreens = [...MANIFEST.dashboards];
      } else {
        currentScreens = MANIFEST.dashboards.filter(s => s.category === cat);
      }
      renderGrid(currentScreens);
    });

    // Lightbox Modal Functions
    window.openLightbox = function(index) {
      currentIndex = index;
      showingFullPage = false;
      updateModal();
      lightboxModal.classList.remove('hidden');
      lightboxModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      lightboxModal.classList.add('hidden');
      lightboxModal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }

    function updateModal() {
      const screen = currentScreens[currentIndex];
      if (!screen) return;

      modalTitle.textContent = screen.title;
      modalRole.textContent = screen.role;
      modalCategoryBadge.textContent = screen.category;
      mockUrlBar.textContent = 'http://localhost:${PORT}' + screen.route;
      modalOpenLiveBtn.href = 'http://localhost:${PORT}' + screen.route;

      const imgSrc = showingFullPage ? screen.fullImage : screen.heroImage;
      modalImg.src = imgSrc;
      modalDownloadBtn.href = imgSrc;
      modalDownloadBtn.setAttribute('download', (showingFullPage ? screen.id + '_full.png' : screen.id + '_hero.png'));

      viewModeLabel.textContent = showingFullPage ? 'Switch to 16:9 Hero View' : 'View Full Scrollable Page';
      screenCounter.textContent = (currentIndex + 1) + ' / ' + currentScreens.length;
    }

    function prevScreen() {
      currentIndex = (currentIndex - 1 + currentScreens.length) % currentScreens.length;
      updateModal();
    }

    function nextScreen() {
      currentIndex = (currentIndex + 1) % currentScreens.length;
      updateModal();
    }

    // Modal listeners
    closeModalBtn.addEventListener('click', closeModal);
    prevScreenBtn.addEventListener('click', prevScreen);
    nextScreenBtn.addEventListener('click', nextScreen);

    toggleFullPageBtn.addEventListener('click', () => {
      showingFullPage = !showingFullPage;
      updateModal();
    });

    window.addEventListener('keydown', (e) => {
      if (lightboxModal.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevScreen();
      if (e.key === 'ArrowRight') nextScreen();
    });

    // Initial render
    renderGrid(currentScreens);
  </script>
</body>
</html>`
}

// Main execution function
async function main() {
  console.log('\n======================================================')
  console.log('🩺 CLINIVA OS — CLINICAL DASHBOARDS SCREENSHOT ENGINE')
  console.log('======================================================\n')

  const browserPath = findBrowserExecutable()
  console.log(`✓ Detected Browser: ${browserPath}`)

  const baseUrl = `http://localhost:${PORT}`
  const isServerRunning = await checkServer(baseUrl)
  console.log(`✓ Local Dev Server: ${baseUrl} (${isServerRunning ? 'ONLINE' : 'OFFLINE'})`)

  if (!isServerRunning && !CAPTURE_STITCH_ONLY) {
    console.warn(`\n[!] Warning: Next.js dev server is not responding at ${baseUrl}.`)
    console.warn(`    Please ensure 'npm run dev' is running, or run with --stitch-only to capture static design exports.\n`)
  }

  console.log(`✓ Target Resolution: ${WIDTH}x${HEIGHT} @ ${DPR}x DPR (Effective: ${WIDTH * DPR}x${HEIGHT * DPR} UHD)`)
  console.log(`✓ Dashboards to process: ${CLINICAL_DASHBOARDS.length}\n`)

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--disable-gpu',
    ],
  })

  const capturedScreens = []
  const startTime = Date.now()

  try {
    const page = await browser.newPage()
    await page.setViewport({
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: DPR,
    })

    for (let i = 0; i < CLINICAL_DASHBOARDS.length; i++) {
      const item = CLINICAL_DASHBOARDS[i]
      const stepNum = `[${i + 1}/${CLINICAL_DASHBOARDS.length}]`
      console.log(`${stepNum} Capturing: ${item.title} (${item.route})`)

      let targetUrl = `${baseUrl}${item.route}`

      // Check if we should capture static stitch export instead
      if (CAPTURE_STITCH_ONLY || (!isServerRunning && item.stitchFile)) {
        const localStitchPath = path.join(ROOT_DIR, 'stitch-exports', item.stitchFile)
        if (fs.existsSync(localStitchPath)) {
          targetUrl = `file://${localStitchPath.replace(/\\\\/g, '/')}`
        }
      }

      try {
        // Set demo cookie to guarantee instant access without auth redirects
        if (targetUrl.startsWith('http')) {
          await page.setCookie({
            name: 'cliniva_demo_role',
            value: item.demoRole,
            domain: 'localhost',
            path: '/',
          })
        }

        // Navigate with network idle wait
        await page.goto(targetUrl, {
          waitUntil: 'networkidle2',
          timeout: 45000,
        })

        // Wait for web fonts & icons (Material Symbols, Inter, Plus Jakarta Sans)
        await page.evaluate(async () => {
          if (document.fonts) {
            await document.fonts.ready
          }
          // Hide scrollbars cleanly for high-res output
          const style = document.createElement('style')
          style.innerHTML = '::-webkit-scrollbar { display: none !important; }'
          document.head.appendChild(style)
        })

        // Let micro-animations, radar pulses, and charts settle
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const heroFileName = `${item.id}_hero.png`
        const fullFileName = `${item.id}_full.png`

        // 1. Capture 16:9 Widescreen Hero Viewport
        for (const outDir of OUTPUT_DIRS) {
          const heroFilePath = path.join(outDir, heroFileName)
          await page.screenshot({
            path: heroFilePath,
            fullPage: false,
          })
        }

        // 2. Capture Full Scrollable Page
        for (const outDir of OUTPUT_DIRS) {
          const fullFilePath = path.join(outDir, fullFileName)
          await page.screenshot({
            path: fullFilePath,
            fullPage: true,
          })
        }

        const heroRelPath = `screenshots/${heroFileName}`
        const fullRelPath = `screenshots/${fullFileName}`

        capturedScreens.push({
          ...item,
          heroImage: heroRelPath,
          fullImage: fullRelPath,
          capturedAt: new Date().toISOString(),
        })

        console.log(`   ✓ Saved: ${heroFileName} & ${fullFileName}`)
      } catch (err) {
        console.error(`   ✗ Error capturing ${item.title}:`, err.message)
      }
    }

    // Build Manifest
    const manifest = {
      title: 'Cliniva OS Clinical Dashboards Showcase',
      generatedAt: new Date().toISOString(),
      resolution: `${WIDTH * DPR}x${HEIGHT * DPR}`,
      deviceScaleFactor: DPR,
      totalScreens: capturedScreens.length,
      dashboards: capturedScreens,
    }

    // Save manifest in showcase dirs
    const showcaseHtml = generateShowcaseHtml(manifest)

    const showcaseDirs = [
      path.join(ROOT_DIR, 'showcase'),
      path.join(ROOT_DIR, 'public', 'showcase'),
    ]

    for (const sDir of showcaseDirs) {
      fs.mkdirSync(sDir, { recursive: true })
      fs.writeFileSync(path.join(sDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
      fs.writeFileSync(path.join(sDir, 'index.html'), showcaseHtml, 'utf8')
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('\n======================================================')
    console.log(`🎉 SUCCESS: Captured ${capturedScreens.length} dashboards in ${elapsed}s!`)
    console.log('======================================================')
    console.log(`📁 Showcase HTML ready at:`)
    console.log(`   • ${path.join(ROOT_DIR, 'showcase', 'index.html')}`)
    console.log(`   • ${path.join(ROOT_DIR, 'public', 'showcase', 'index.html')}`)
    if (isServerRunning) {
      console.log(`🌐 Live Browser Showcase URL:`)
      console.log(`   • http://localhost:${PORT}/showcase/index.html`)
    }
    console.log('======================================================\n')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('\nFatal error running capture script:', err)
  process.exit(1)
})
