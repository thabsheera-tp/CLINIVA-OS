'use client'

import React, { useState } from 'react'
import ModalBackdrop from './ModalBackdrop'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

export default function CollectPaymentModal() {
  const { isPaymentOpen, setPaymentOpen } = useClinicRealtime()

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'insurance' | 'upi'>('card')
  const [tendered, setTendered] = useState('173.25')
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)

  const items = [
    { desc: 'Cardiology Specialist Consultation', code: 'CPT-99214', amount: 120.00 },
    { desc: '12-Lead Electrocardiogram (ECG)',   code: 'CPT-93000', amount: 45.00 },
    { desc: 'Lisinopril 10mg (30-day supply)',     code: 'NDC-68180', amount: 8.25 },
  ]
  const total = items.reduce((acc, i) => acc + i.amount, 0)

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaid(true)
      setTimeout(() => {
        setPaid(false)
        setPaymentOpen(false)
      }, 1500)
    }, 1000)
  }

  return (
    <ModalBackdrop
      isOpen={isPaymentOpen}
      onClose={() => setPaymentOpen(false)}
      title="Process Invoice & Collect Payment"
      subtitle="Invoice #INV-2026-0842 • Marcus Delacroix"
      icon="receipt_long"
    >
      {paid ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary animate-bounce">
            <span className="material-symbols-outlined text-[36px]">paid</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface font-bold">
            Payment Settled — ${total.toFixed(2)}
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Digital receipt issued and dispatched to Patient Portal. Invoice marked PAID.
          </p>
          <span className="px-3 py-1 bg-secondary-fixed/50 text-on-secondary-fixed text-label-sm rounded-full font-semibold uppercase tracking-wider">
            Ledger Balanced Live
          </span>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-space-md">
          {/* Bill Line Items Table */}
          <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase">
                <tr>
                  <th className="px-space-md py-2">Item Description</th>
                  <th className="px-space-md py-2">Code</th>
                  <th className="px-space-md py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                {items.map((it) => (
                  <tr key={it.desc}>
                    <td className="px-space-md py-2 font-medium text-on-surface">{it.desc}</td>
                    <td className="px-space-md py-2 text-on-surface-variant font-mono">{it.code}</td>
                    <td className="px-space-md py-2 text-right font-semibold tabular-nums text-on-surface">
                      ${it.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-container-low/50 font-semibold">
                  <td colSpan={2} className="px-space-md py-2.5 text-on-surface">Total Due</td>
                  <td className="px-space-md py-2.5 text-right text-headline-sm font-heading font-bold text-primary tabular-nums">
                    ${total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-label-md text-on-surface font-semibold block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {[
                { id: 'card', label: 'Credit Card', icon: 'credit_card' },
                { id: 'cash', label: 'Cash Counter', icon: 'payments' },
                { id: 'insurance', label: 'Insurance Copay', icon: 'health_and_safety' },
                { id: 'upi', label: 'Digital / QR', icon: 'qr_code_scanner' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center p-space-sm rounded-xl border-2 transition-all ${
                    paymentMethod === m.id
                      ? 'bg-secondary-fixed/40 border-primary font-bold shadow-sm'
                      : 'bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] mb-1 text-primary">{m.icon}</span>
                  <span className="text-label-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Tendered */}
          <div>
            <label className="text-label-md text-on-surface font-semibold block mb-1">
              Amount Tendered ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              className="input-field text-headline-sm font-semibold tabular-nums"
            />
          </div>

          <div className="pt-space-md border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaymentOpen(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="btn-primary"
            >
              {processing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Processing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Collect ${total.toFixed(2)} & Issue Receipt
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}
