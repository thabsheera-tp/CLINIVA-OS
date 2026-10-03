'use client'

import React, { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

export default function HospitalQrPortalPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [portalUrl, setPortalUrl] = useState<string>('/portal')
  const [copied, setCopied] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate portal entry URL using current browser origin
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const fullUrl = `${origin}/portal`
    setPortalUrl(fullUrl)

    // Generate high-resolution QR code pointing purely to the portal URL
    QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#123047',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url)
        if (typeof window !== 'undefined' && window.location.search.includes('print=1')) {
          setTimeout(() => window.print(), 350)
        }
      })
      .catch((err) => console.error('Failed to generate QR code', err))
  }, [])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && portalUrl) {
      navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'cliniva-patient-portal-qr.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C1620] py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            box-shadow: none !important;
            border: 2px solid #123047 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2.5rem !important;
          }
        }
      `}</style>

      {/* Top Navigation & Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F8B8D] dark:text-[#28B5B7] hover:underline"
        >
          <ClinivaIcon name="arrow_back" size={18} />
          Go to Patient Portal Direct
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#122433] border border-[#CBD5E1] dark:border-white/10 text-[#334155] dark:text-[#E2E8F0] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ClinivaIcon name="content_copy" size={15} />
            {copied ? 'Copied Link!' : 'Copy Portal URL'}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#122433] border border-[#CBD5E1] dark:border-white/10 text-[#334155] dark:text-[#E2E8F0] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ClinivaIcon name="download" size={15} />
            Download QR
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F8B8D] text-white shadow-sm hover:bg-[#0D7A7C] transition-colors"
          >
            <ClinivaIcon name="print" size={16} />
            Print Official Poster
          </button>
        </div>
      </div>

      {/* Main Poster Container */}
      <div
        ref={posterRef}
        className="print-full max-w-2xl mx-auto bg-white dark:bg-[#122433] rounded-3xl border border-[#E2E8EC] dark:border-white/10 shadow-xl overflow-hidden p-8 sm:p-12 text-center transition-all"
      >
        {/* Hospital Brand Header */}
        <div className="flex flex-col items-center gap-3 border-b border-[#E2E8EC] dark:border-white/10 pb-6 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0F8B8D] flex items-center justify-center text-white shadow-md">
            <ClinivaIcon name="medical_services" size={30} strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F8B8D] dark:text-[#28B5B7]">
              CLINIVA HOSPITAL SYSTEM &bull; DIGITAL PATIENT SERVICES
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#123047] dark:text-white mt-1">
              Patient Portal Access
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto mt-1">
              Scan with your smartphone camera to access your appointments, prescriptions, lab reports, and live OPD queue.
            </p>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="relative inline-block mx-auto p-5 sm:p-7 rounded-3xl bg-white border-2 border-[#123047]/10 dark:border-white/20 shadow-lg">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Cliniva Patient Portal Entry QR Code"
              className="w-64 h-64 sm:w-72 sm:h-72 mx-auto object-contain rounded-xl"
            />
          ) : (
            <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-slate-400">
              <span className="animate-spin text-2xl">&#9696;</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#123047]">
            <ClinivaIcon name="smartphone" size={16} className="text-[#0F8B8D]" />
            <span>Point camera &bull; Tap to open</span>
          </div>
        </div>

        {/* 4-Step Access Flow */}
        <div className="mt-8 pt-8 border-t border-[#E2E8EC] dark:border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-4">
            How to Access Your Health Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.03] border border-[#E2E8EC] dark:border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] text-xs font-bold flex items-center justify-center mb-1.5">
                1
              </div>
              <p className="text-xs font-bold text-[#123047] dark:text-white">Scan QR</p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
                Scan with any smartphone camera.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.03] border border-[#E2E8EC] dark:border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] text-xs font-bold flex items-center justify-center mb-1.5">
                2
              </div>
              <p className="text-xs font-bold text-[#123047] dark:text-white">Enter Mobile</p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
                Type your registered phone number.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.03] border border-[#E2E8EC] dark:border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] text-xs font-bold flex items-center justify-center mb-1.5">
                3
              </div>
              <p className="text-xs font-bold text-[#123047] dark:text-white">Verify OTP</p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
                Receive 6-digit SMS verification code.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.03] border border-[#E2E8EC] dark:border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#0F8B8D]/15 text-[#0F8B8D] dark:text-[#28B5B7] text-xs font-bold flex items-center justify-center mb-1.5">
                4
              </div>
              <p className="text-xs font-bold text-[#123047] dark:text-white">View Records</p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
                Access your real clinical records instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Display Locations Badge */}
        <div className="mt-8 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3">
          <ClinivaIcon name="place" size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200">
              Hospital Placement Locations:
            </span>
            <span className="text-amber-800 dark:text-amber-300 ml-1">
              Reception Desk &bull; Registration Counter &bull; Waiting Lounge &bull; OPD Clinics &bull; Discharge &bull; Information Kiosk
            </span>
          </div>
        </div>

        {/* Security / Privacy Guarantee */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#0F8B8D]/10 border border-[#0F8B8D]/20 text-left flex items-start gap-3">
          <ClinivaIcon name="verified_user" size={18} className="text-[#0F8B8D] dark:text-[#28B5B7] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#123047] dark:text-white">Privacy Protected:</span>
            <span className="text-[#64748B] dark:text-[#94A3B8] ml-1">
              This QR code encodes strictly the portal address. Zero medical information, MRNs, or personal data are stored in this barcode.
            </span>
          </div>
        </div>

        {/* Footer Direct Link for Printed Paper */}
        <div className="mt-6 pt-4 border-t border-[#E2E8EC] dark:border-white/10 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Direct web address: <strong className="text-[#123047] dark:text-white font-mono">{portalUrl}</strong>
        </div>
      </div>
    </div>
  )
}
