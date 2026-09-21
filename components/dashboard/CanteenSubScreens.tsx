'use client'

import React, { useState } from 'react'
import SubScreenHeader from './SubScreenHeader'
import StatusBadge from '@/components/ui/StatusBadge'

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
                    <span className="font-mono font-bold text-primary">{m.orderId}</span>
                    <span className="font-semibold text-on-surface text-body-md">{m.patient}</span>
                    <span className="text-label-sm font-bold text-outline">({m.bed})</span>
                  </div>
                  <div className="text-body-sm font-semibold text-on-surface mt-1">{m.meal}</div>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">{m.spec}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                    m.status === 'Ready for Cart' ? 'bg-emerald-100 text-emerald-800' : m.status === 'Withheld (NPO)' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m.status}
                  </span>
                  <button className="btn-secondary text-label-sm py-1.5 px-3">
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
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
              <span className="text-label-lg font-semibold text-on-surface">Staff & Visitor Quick Menu</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Hot Chef Lunch Platter', price: '$8.50' },
                  { name: 'Fresh Salad Bowl', price: '$6.00' },
                  { name: 'Artisan Soup & Roll', price: '$4.50' },
                  { name: 'Organic Fruit Cup', price: '$3.00' },
                  { name: 'Espresso / Cappuccino', price: '$3.50' },
                  { name: 'Cold Pressed Green Juice', price: '$4.00' },
                ].map((item) => (
                  <button key={item.name} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:bg-primary/10 hover:border-primary/40 text-left transition-all">
                    <div className="font-semibold text-on-surface text-body-sm">{item.name}</div>
                    <div className="font-mono font-bold text-primary mt-1">{item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-label-lg font-semibold text-on-surface">Order Summary</span>
                <div className="mt-3 space-y-2 text-body-sm border-b border-outline-variant/20 pb-3">
                  <div className="flex justify-between"><span>1x Hot Chef Lunch Platter</span><span className="font-mono font-semibold">$8.50</span></div>
                  <div className="flex justify-between"><span>1x Cold Pressed Juice</span><span className="font-mono font-semibold">$4.00</span></div>
                </div>
                <div className="pt-3 space-y-1.5">
                  <div className="flex justify-between text-body-sm text-on-surface-variant"><span>Subtotal:</span><span className="font-mono">$12.50</span></div>
                  <div className="flex justify-between text-headline-sm font-bold text-on-surface pt-1 border-t border-outline-variant/20">
                    <span>Total:</span>
                    <span className="text-primary font-mono">$12.50</span>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full justify-center py-3">
                <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
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

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                <span className="font-semibold text-primary text-body-md block mb-2">Breakfast (07:30)</span>
                <p className="text-body-sm text-on-surface font-medium">Steel-cut oatmeal with sliced almonds & berries, scrambled egg whites, herbal tea.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                <span className="font-semibold text-primary text-body-md block mb-2">Lunch (12:30)</span>
                <p className="text-body-sm text-on-surface font-medium">Herbed baked salmon or grilled chicken, steamed asparagus, brown basmati rice.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                <span className="font-semibold text-primary text-body-md block mb-2">Dinner (18:30)</span>
                <p className="text-body-sm text-on-surface font-medium">Hearty vegetable minestrone, tender roasted turkey breast, mashed sweet potatoes.</p>
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

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Quantity on Hand</th>
                    <th className="px-5 py-3">Minimum Par</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { name: 'Brown Basmati Rice', cat: 'Dry Grains', qty: '85 kg', par: '50 kg', status: 'Optimal' },
                    { name: 'Fresh Atlantic Salmon Fillets', cat: 'Chilled Seafood', qty: '12 kg', par: '20 kg', status: 'Low Stock' },
                    { name: 'Organic Pasteurized Eggs', cat: 'Dairy & Poultry', qty: '360 units', par: '200 units', status: 'Optimal' },
                    { name: 'Diabetic Nutrition Powder (Glucerna)', cat: 'Dietary Clinical', qty: '18 cans', par: '15 cans', status: 'Optimal' },
                  ].map((it) => (
                    <tr key={it.name} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{it.name}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{it.cat}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-on-surface">{it.qty}</td>
                      <td className="px-5 py-3.5 font-mono text-outline">{it.par}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          it.status === 'Optimal' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
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

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3">Bed</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Diet Category</th>
                    <th className="px-5 py-3">Known Food Allergies</th>
                    <th className="px-5 py-3">Sodium / Sugar Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { bed: 'Bed A-01', patient: 'Marcus Delacroix', diet: 'Low Sodium Cardiac', allergy: 'Penicillin (Sulfa)', rule: 'Strictly &lt;1500mg Na/day' },
                    { bed: 'Bed A-02', patient: 'Priya Mehta', diet: 'Lacto-Ovo Vegetarian', allergy: 'Aspirin', rule: 'No animal gelatins' },
                    { bed: 'Bed A-04', patient: 'George Tanner', diet: 'Diabetic Controlled', allergy: 'None Known', rule: 'Consistent carb count (45g)' },
                    { bed: 'Bed A-06', patient: 'Aisha Nkosi', diet: 'NPO (Fasting)', allergy: 'Ibuprofen', rule: 'Complete Fasting (Surgery)' },
                  ].map((p) => (
                    <tr key={p.bed} className="hover:bg-surface-container-low/30">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{p.bed}</td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{p.patient}</td>
                      <td className="px-5 py-3.5 font-medium text-primary">{p.diet}</td>
                      <td className="px-5 py-3.5 text-red-700 font-semibold">{p.allergy}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant font-mono">{p.rule}</td>
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
