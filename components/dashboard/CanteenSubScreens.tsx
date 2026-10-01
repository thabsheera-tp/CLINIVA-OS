'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

type Props = {
  slug: string
  userName: string
}

const SAMPLE_MEALS = [
  { orderId: 'MEAL-301', bed: 'Bed A-01', patient: 'Marcus Delacroix', meal: 'Lunch (Low Sodium Plate)', spec: 'Steamed salmon, brown rice, asparagus (No added salt)', status: 'Cooking', diet: 'Low Sodium' },
  { orderId: 'MEAL-302', bed: 'Bed A-02', patient: 'Priya Mehta', meal: 'Lunch (Vegetarian Soft)', spec: 'Lentil soup (Dal), steamed vegetables, warm wholewheat bread', status: 'Ready for Cart', diet: 'Vegetarian' },
  { orderId: 'MEAL-303', bed: 'Bed A-04', patient: 'George Tanner', meal: 'Lunch (Diabetic 50g Carb)', spec: 'Grilled chicken breast, quinoa, tossed green salad (Sugar-free dessert)', status: 'Cooking', diet: 'Diabetic' },
  { orderId: 'MEAL-304', bed: 'Bed A-06', patient: 'Aisha Nkosi', meal: 'Lunch (NPO / Fasting)', spec: 'Pre-Op Fasting Order (Clear ice chips only)', status: 'Withheld (NPO)', diet: 'NPO Fasting' },
]

export default function CanteenSubScreens({ slug, userName }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="flex flex-col w-full space-y-gutter-desktop">
      {/* ── 1. PATIENT MEAL ORDERS ── */}
      {slug === 'meal-orders' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Inpatient Dietary Meal Assembly & Dispatch"
            badge="42 Meals for Lunch"
            badgeVariant="live"
            description="Clinical inpatient meal tray assembly, allergy safety checks, and ward distribution carts."
          />

          <div className="grid grid-cols-1 gap-3">
            {SAMPLE_MEALS.map((m) => (
              <div key={m.orderId} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#123047] dark:text-white">{m.orderId}</span>
                    <span className="font-semibold text-sm text-[#123047] dark:text-white">{m.patient}</span>
                    <span className="text-xs font-bold text-[#4A5D6B] dark:text-[#9FB1C0]">({m.bed})</span>
                  </div>
                  <div className="text-sm font-semibold text-[#123047] dark:text-white mt-1">{m.meal}</div>
                  <div className="text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium mt-0.5">{m.spec}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    m.status === 'Ready for Cart' ? 'bg-[#EBF7F2] text-[#2E7D5B] border-[#C3ECD8]' : m.status === 'Withheld (NPO)' ? 'bg-[#FDF2F2] text-[#C94A4A] border-[#F8D7D7]' : 'bg-[#FFF8E6] text-[#C58A24] border-[#FCE6BD]'
                  }`}>
                    {m.status}
                  </span>
                  <button className="btn-secondary text-xs font-semibold py-1.5 px-3">
                    Mark Assembled
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 2. CAFETERIA POS ── */}
      {slug === 'pos' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Hospital Cafeteria POS Terminal"
            badge="Cafeteria Counter"
            description="Quick counter billing for visiting families, nursing staff lunches, and retail beverage sales."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border-subtle p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Staff & Visitor Quick Menu</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Hot Chef Lunch Platter', price: '$8.50' },
                  { name: 'Fresh Salad Bowl', price: '$6.00' },
                  { name: 'Artisan Soup & Roll', price: '$4.50' },
                  { name: 'Organic Fruit Cup', price: '$3.00' },
                  { name: 'Espresso / Cappuccino', price: '$3.50' },
                  { name: 'Cold Pressed Green Juice', price: '$4.00' },
                ].map((item) => (
                  <button key={item.name} className="p-4 rounded-xl border border-border-subtle bg-slate-50/60 hover:bg-[#F2F9F9] hover:border-medical-teal text-left transition-all">
                    <div className="font-semibold text-sm text-[#123047] dark:text-white">{item.name}</div>
                    <div className="font-mono font-bold text-sm text-[#0F8B8D] dark:text-[#28B5B7] mt-1">{item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl border border-border-subtle p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6B] dark:text-[#9FB1C0]">Order Summary</span>
                <div className="mt-3 space-y-2 text-xs border-b border-border-subtle pb-3">
                  <div className="flex justify-between text-[#123047] dark:text-white"><span>1x Hot Chef Lunch Platter</span><span className="font-mono font-bold text-xs">$8.50</span></div>
                  <div className="flex justify-between text-[#123047] dark:text-white"><span>1x Cold Pressed Juice</span><span className="font-mono font-bold text-xs">$4.00</span></div>
                </div>
                <div className="pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium"><span>Subtotal:</span><span className="font-mono font-bold">$12.50</span></div>
                  <div className="flex justify-between text-base font-bold text-[#123047] dark:text-white pt-1 border-t border-border-subtle">
                    <span>Total:</span>
                    <span className="text-[#0F8B8D] dark:text-[#28B5B7] font-mono font-bold">$12.50</span>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full justify-center py-2.5 text-xs font-semibold">
                <ClinivaIcon name="point_of_sale" size={18} strokeWidth={1.5} />
                <span>Collect $12.50</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 3. MENU MANAGEMENT ── */}
      {slug === 'menu' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Weekly Clinical Nutrition Menu Planner"
            badge="Week 38 Rotation"
            description="Nutritional caloric planning per diet class (Regular, Renal, Low Sodium, Diabetic, Pureed)."
          />

          <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/60 border border-border-subtle">
                <span className="font-bold text-sm text-[#0F8B8D] dark:text-[#28B5B7] block mb-2">Breakfast (07:30)</span>
                <p className="text-xs font-medium text-[#253848] dark:text-[#D9E5F0] leading-relaxed">Steel-cut oatmeal with sliced almonds & berries, scrambled egg whites, herbal tea.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/60 border border-border-subtle">
                <span className="font-bold text-sm text-[#0F8B8D] dark:text-[#28B5B7] block mb-2">Lunch (12:30)</span>
                <p className="text-xs font-medium text-[#253848] dark:text-[#D9E5F0] leading-relaxed">Herbed baked salmon or grilled chicken, steamed asparagus, brown basmati rice.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/60 border border-border-subtle">
                <span className="font-bold text-sm text-[#0F8B8D] dark:text-[#28B5B7] block mb-2">Dinner (18:30)</span>
                <p className="text-xs font-medium text-[#253848] dark:text-[#D9E5F0] leading-relaxed">Hearty vegetable minestrone, tender roasted turkey breast, mashed sweet potatoes.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 4. INVENTORY ── */}
      {slug === 'inventory' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Kitchen Pantry & Grocery Inventory"
            badge="Re-stock Alert"
            badgeVariant="alert"
            description="Pantry bulk inventory, dairy chillers, dry provisions, and dietary supplements."
          />

          <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-[#4A5D6B] dark:text-[#9FB1C0] uppercase tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Quantity on Hand</th>
                    <th className="px-5 py-3">Minimum Par</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    { name: 'Brown Basmati Rice', cat: 'Dry Grains', qty: '85 kg', par: '50 kg', status: 'Optimal' },
                    { name: 'Fresh Atlantic Salmon Fillets', cat: 'Chilled Seafood', qty: '12 kg', par: '20 kg', status: 'Low Stock' },
                    { name: 'Organic Pasteurized Eggs', cat: 'Dairy & Poultry', qty: '360 units', par: '200 units', status: 'Optimal' },
                    { name: 'Diabetic Nutrition Powder (Glucerna)', cat: 'Dietary Clinical', qty: '18 cans', par: '15 cans', status: 'Optimal' },
                  ].map((it) => (
                    <tr key={it.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-sm text-[#123047] dark:text-white">{it.name}</td>
                      <td className="px-5 py-3.5 text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{it.cat}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#123047] dark:text-white">{it.qty}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#4A5D6B] dark:text-[#9FB1C0] font-medium">{it.par}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          it.status === 'Optimal' ? 'bg-[#EBF7F2] text-[#2E7D5B] border-[#C3ECD8]' : 'bg-[#FDF2F2] text-[#C94A4A] border-[#F8D7D7]'
                        }`}>
                          {it.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 5. DIETARY RESTRICTIONS ── */}
      {slug === 'dietary' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Inpatient Dietary Restrictions & Allergy Matrix"
            badge="Live Clinical Safety"
            description="Direct sync between doctor admission orders and the kitchen prep line to prevent severe allergen exposure."
          />

          <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-slate-50/80 text-label-sm text-secondary-text uppercase border-b border-border-subtle">
                  <tr>
                    <th className="px-5 py-3">Bed</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Diet Category</th>
                    <th className="px-5 py-3">Known Food Allergies</th>
                    <th className="px-5 py-3">Sodium / Sugar Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    { bed: 'Bed A-01', patient: 'Marcus Delacroix', diet: 'Low Sodium Cardiac', allergy: 'Penicillin (Sulfa)', rule: 'Strictly <1500mg Na/day' },
                    { bed: 'Bed A-02', patient: 'Priya Mehta', diet: 'Lacto-Ovo Vegetarian', allergy: 'Aspirin', rule: 'No animal gelatins' },
                    { bed: 'Bed A-04', patient: 'George Tanner', diet: 'Diabetic Controlled', allergy: 'None Known', rule: 'Consistent carb count (45g)' },
                    { bed: 'Bed A-06', patient: 'Aisha Nkosi', diet: 'NPO (Fasting)', allergy: 'Ibuprofen', rule: 'Complete Fasting (Surgery)' },
                  ].map((p) => (
                    <tr key={p.bed} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-medical-teal">{p.bed}</td>
                      <td className="px-5 py-3.5 font-semibold text-primary-navy">{p.patient}</td>
                      <td className="px-5 py-3.5 font-medium text-primary-text">{p.diet}</td>
                      <td className="px-5 py-3.5 text-[#C94A4A] font-semibold">{p.allergy}</td>
                      <td className="px-5 py-3.5 text-secondary-text font-mono">{p.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. SETTINGS ── */}
      {slug === 'settings' && (
        <>
          <SubScreenHeader
            parentLabel="Canteen & Meals"
            parentHref="/canteen"
            title="Dietary Operations Settings"
            description="Configure meal distribution cutoff hours, tray cart routing, and kitchen station thermal printers."
          />

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Lunch Tray Assembly Cut-off Time</label>
              <input type="text" defaultValue="11:30 AM" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <div>
              <label className="text-label-sm font-medium text-on-surface-variant block mb-1">Dinner Tray Assembly Cut-off Time</label>
              <input type="text" defaultValue="17:30 PM" className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm" />
            </div>
            <button className="btn-primary">Save Dietary Schedules</button>
          </div>
        </>
      )}
    </div>
  )
}
