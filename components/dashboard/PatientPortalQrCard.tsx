'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  variant?: 'compact' | 'full'
}

export default function PatientPortalQrCard({ variant = 'compact' }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [portalUrl, setPortalUrl] = useState<string>('/portal')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const fullUrl = `${origin}/portal`
    setPortalUrl(fullUrl)

    QRCode.toDataURL(fullUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#123047',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate portal QR', err))
  }, [])

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

  const handlePrintPoster = () => {
    if (typeof window !== 'undefined') {
      window.open('/portal/qr?print=1', '_blank')
    }
  }

  if (variant === 'full') {
    return (
      <div className="space-y-5">
        <div className="bg-white dark:bg-[#122433] rounded-2xl border border-[#E2E8EC] dark:border-white/[0.08] p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: QR Code Preview */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-[#F8FAFC] dark:bg-white/[0.03] rounded-2xl border border-[#E2E8EC] dark:border-white/5 text-center">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Hospital Patient Portal QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <span className="animate-spin text-xl">&#9696;</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs font-bold text-[#123047] dark:text-white">
                Hospital-Wide Entry Barcode
              </p>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 truncate max-w-full px-2">
                {portalUrl}
              </p>
            </div>

            {/* Right: Management Controls & Details */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#123047] dark:text-white">
                      Hospital QR Poster & Digital Access
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7]">
                      Hospital Wide
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Manage the public QR posters displayed at reception desks, OPD waiting areas, and registration counters.
                  </p>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <Link
                  href="/portal/qr"
                  target="_blank"
                  className="p-3 rounded-xl border border-[#CBD5E1] dark:border-white/10 bg-white dark:bg-[#162636] hover:border-[#0F8B8D] text-left transition-all group flex flex-col justify-between"
                >
                  <ClinivaIcon name="visibility" size={18} className="text-[#0F8B8D] group-hover:scale-110 transition-transform mb-2" />
                  <div>
                    <span className="text-xs font-bold text-[#123047] dark:text-white block">
                      View Poster
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Full official poster
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handlePrintPoster}
                  className="p-3 rounded-xl border border-[#0F8B8D]/30 bg-[#0F8B8D]/10 hover:bg-[#0F8B8D]/20 text-left transition-all group flex flex-col justify-between text-[#0F8B8D] dark:text-[#28B5B7]"
                >
                  <ClinivaIcon name="print" size={18} className="group-hover:scale-110 transition-transform mb-2" />
                  <div>
                    <span className="text-xs font-bold block">
                      Print QR Poster
                    </span>
                    <span className="text-[10px] opacity-80">
                      Thermal / A4 poster
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-3 rounded-xl border border-[#CBD5E1] dark:border-white/10 bg-white dark:bg-[#162636] hover:border-[#0F8B8D] text-left transition-all group flex flex-col justify-between"
                >
                  <ClinivaIcon name="download" size={18} className="text-[#0F8B8D] group-hover:scale-110 transition-transform mb-2" />
                  <div>
                    <span className="text-xs font-bold text-[#123047] dark:text-white block">
                      Download QR
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      High-res PNG (400px)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl border border-[#CBD5E1] dark:border-white/10 bg-white dark:bg-[#162636] hover:border-[#0F8B8D] text-left transition-all group flex flex-col justify-between"
                >
                  <ClinivaIcon name="content_copy" size={18} className="text-[#0F8B8D] group-hover:scale-110 transition-transform mb-2" />
                  <div>
                    <span className="text-xs font-bold text-[#123047] dark:text-white block">
                      {copied ? 'Copied Link!' : 'Copy Portal Link'}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Direct web URL
                    </span>
                  </div>
                </button>
              </div>

              {/* Informational Guidance */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.02] border border-[#E2E8EC] dark:border-white/5 space-y-2">
                <div className="flex items-start gap-2">
                  <ClinivaIcon name="verified_user" size={16} className="text-[#0F8B8D] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
                    <strong>Privacy by Design:</strong> This QR code encodes only the official Patient Portal URL. It contains no patient PHI, MRNs, diagnosis, or personal identifiers. Patients scan the QR to open the portal and authenticate securely with their registered phone number and 6-digit OTP.
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-[#E2E8EC]/60 dark:border-white/5">
                  <ClinivaIcon name="place" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <strong>Recommended Locations:</strong> Front Desk counter, triage waiting benches, outpatient consultation entrances, and discharge billing counters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compact variant for FrontDeskDashboardView
  return (
    <div className="bg-white dark:bg-[#122433] rounded-xl border border-[#E2E8EC] dark:border-white/[0.08] p-4 shadow-card flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EC] dark:border-white/[0.08] mb-3">
        <div className="flex items-center gap-2">
          <ClinivaIcon name="qr_code_2" size={18} className="text-[#0F8B8D]" />
          <h3 className="text-xs font-bold text-[#123047] dark:text-white uppercase tracking-wider">
            Patient Portal QR
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8F6F5] dark:bg-[#0F8B8D]/20 text-[#0F8B8D] dark:text-[#28B5B7]">
          Front Desk Access
        </span>
      </div>

      <div className="flex items-center gap-3.5 mb-3">
        <div className="p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Patient Portal QR"
              className="w-16 h-16 object-contain rounded"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center text-slate-400">
              <span className="animate-spin text-sm">&#9696;</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#123047] dark:text-white truncate">
            Hospital Check-In QR
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight mt-0.5 line-clamp-2">
            Points to patient portal for instant mobile registration & records access.
          </p>
          <p className="text-[10px] font-mono text-[#0F8B8D] dark:text-[#28B5B7] truncate mt-1">
            {portalUrl}
          </p>
        </div>
      </div>

      {/* 4 Front Desk Controls */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8EC]/80 dark:border-white/[0.05]">
        <Link
          href="/portal/qr"
          target="_blank"
          className="py-1.5 px-2.5 rounded-lg border border-[#CBD5E1] dark:border-white/10 bg-[#F8FAFC] dark:bg-white/[0.03] hover:border-[#0F8B8D] text-[11px] font-semibold text-[#123047] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
          title="Open Hospital QR Poster"
        >
          <ClinivaIcon name="visibility" size={14} className="text-[#0F8B8D]" />
          <span>View Poster</span>
        </Link>

        <button
          type="button"
          onClick={handlePrintPoster}
          className="py-1.5 px-2.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0D7A7C] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          title="Print official poster for hospital reception"
        >
          <ClinivaIcon name="print" size={14} />
          <span>Print Poster</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="py-1.5 px-2.5 rounded-lg border border-[#CBD5E1] dark:border-white/10 bg-[#F8FAFC] dark:bg-white/[0.03] hover:border-[#0F8B8D] text-[11px] font-semibold text-[#123047] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
          title="Download PNG for signage"
        >
          <ClinivaIcon name="download" size={14} className="text-[#0F8B8D]" />
          <span>Download QR</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="py-1.5 px-2.5 rounded-lg border border-[#CBD5E1] dark:border-white/10 bg-[#F8FAFC] dark:bg-white/[0.03] hover:border-[#0F8B8D] text-[11px] font-semibold text-[#123047] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
          title="Copy Patient Portal URL to clipboard"
        >
          <ClinivaIcon name="content_copy" size={14} className="text-[#0F8B8D]" />
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  )
}
