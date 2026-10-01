'use client'

import React, { useState, useMemo } from 'react'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'
import { usePortalLang } from '@/context/PortalLanguageContext'
import ClinivaIcon from '@/components/ui/ClinivaIcon'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SymptomItem = {
  id: string
  label: string
  category: 'cardio' | 'derm' | 'neuro' | 'ortho' | 'ent' | 'gastro' | 'general' | 'peds'
  isRedFlag?: boolean
  weight: number
}

export type RecommendationResult = {
  department: string
  doctor: string
  doctorTitle: string
  confidence: number
  urgency: 'routine' | 'urgent' | 'emergency'
  rationale: string
  suggestedAction: string
  recommendedTests: string[]
}

// ─── Symptom Dictionary ───────────────────────────────────────────────────────
// Labels are now set at render time via t(); we keep the id/category/weight here
const COMMON_SYMPTOMS: SymptomItem[] = [
  { id: 'chest_pain',       label: 'Chest Pain or Pressure',             category: 'cardio',  isRedFlag: true,  weight: 10 },
  { id: 'palpitations',     label: 'Irregular Heartbeat',                category: 'cardio',  isRedFlag: false, weight: 8  },
  { id: 'shortness_breath', label: 'Shortness of Breath',                category: 'cardio',  isRedFlag: true,  weight: 9  },
  { id: 'swollen_ankles',   label: 'Swollen Feet / Ankles',              category: 'cardio',  isRedFlag: false, weight: 6  },
  { id: 'skin_rash',        label: 'Itchy Red Skin Rash',                category: 'derm',    isRedFlag: false, weight: 8  },
  { id: 'hives',            label: 'Hives or Welts',                     category: 'derm',    isRedFlag: false, weight: 7  },
  { id: 'mole_change',      label: 'Changing / Irregular Mole',          category: 'derm',    isRedFlag: false, weight: 8  },
  { id: 'eczema',           label: 'Dry / Eczema Patches',               category: 'derm',    isRedFlag: false, weight: 6  },
  { id: 'severe_headache',  label: 'Severe Headache / Migraine',         category: 'neuro',   isRedFlag: false, weight: 8  },
  { id: 'dizziness',        label: 'Dizziness or Vertigo',               category: 'neuro',   isRedFlag: false, weight: 7  },
  { id: 'numbness',         label: 'Numbness / Tingling in Limbs',       category: 'neuro',   isRedFlag: true,  weight: 9  },
  { id: 'blurred_vision',   label: 'Sudden Blurred Vision',              category: 'neuro',   isRedFlag: true,  weight: 9  },
  { id: 'joint_pain',       label: 'Severe Joint Pain or Swelling',      category: 'ortho',   isRedFlag: false, weight: 8  },
  { id: 'back_pain',        label: 'Lower Back Pain / Sciatica',         category: 'ortho',   isRedFlag: false, weight: 7  },
  { id: 'knee_stiffness',   label: 'Knee Stiffness / Reduced Mobility',  category: 'ortho',   isRedFlag: false, weight: 7  },
  { id: 'sprain',           label: 'Sports Injury / Ligament Sprain',    category: 'ortho',   isRedFlag: false, weight: 6  },
  { id: 'sore_throat',      label: 'Sore Throat & Difficulty Swallowing',category: 'ent',     isRedFlag: false, weight: 7  },
  { id: 'persistent_cough', label: 'Chronic Dry or Productive Cough',    category: 'ent',     isRedFlag: false, weight: 8  },
  { id: 'sinus_pressure',   label: 'Sinus Pressure & Nasal Blockage',    category: 'ent',     isRedFlag: false, weight: 6  },
  { id: 'ear_pain',         label: 'Ear Ache or Ringing (Tinnitus)',     category: 'ent',     isRedFlag: false, weight: 6  },
  { id: 'stomach_pain',     label: 'Sharp Abdominal Pain / Cramps',      category: 'gastro',  isRedFlag: false, weight: 8  },
  { id: 'heartburn',        label: 'Acid Reflux / Heartburn',            category: 'gastro',  isRedFlag: false, weight: 7  },
  { id: 'nausea',           label: 'Persistent Nausea or Vomiting',      category: 'gastro',  isRedFlag: false, weight: 7  },
  { id: 'bloating',         label: 'Chronic Indigestion & Bloating',     category: 'gastro',  isRedFlag: false, weight: 5  },
  { id: 'high_fever',       label: 'High Fever & Chills (>101°F)',        category: 'general', isRedFlag: false, weight: 8  },
  { id: 'extreme_fatigue',  label: 'Extreme Fatigue & Malaise',          category: 'general', isRedFlag: false, weight: 6  },
  { id: 'weight_loss',      label: 'Unexplained Weight Loss',            category: 'general', isRedFlag: false, weight: 7  },
]

const CATEGORY_TAB_DEFS = [
  { id: 'all',     tKey: 'cat_all',     icon: 'apps'             },
  { id: 'cardio',  tKey: 'cat_heart',   icon: 'favorite'         },
  { id: 'derm',    tKey: 'cat_skin',    icon: 'dermatology'      },
  { id: 'neuro',   tKey: 'cat_neuro',   icon: 'neurology'        },
  { id: 'ortho',   tKey: 'cat_joints',  icon: 'accessibility'    },
  { id: 'ent',     tKey: 'cat_ent',     icon: 'hearing'          },
  { id: 'gastro',  tKey: 'cat_stomach', icon: 'gastroenterology' },
  { id: 'general', tKey: 'cat_general', icon: 'thermostat'       },
] as const

const DEPARTMENT_PROFILES: Record<string, {
  name: string; doctor: string; doctorTitle: string; rationaleTemplate: string; tests: string[]
}> = {
  cardio:  { name: 'Cardiology',         doctor: 'Dr. Sarah Jenkins', doctorTitle: 'Senior Consultant Cardiologist',              rationaleTemplate: 'Symptoms indicate potential cardiovascular involvement requiring immediate hemodynamic evaluation, cardiac rhythm assessment, and risk stratification.',                                                               tests: ['12-Lead ECG', 'Cardiac Troponin I', 'Echocardiogram', 'Lipid Profile'] },
  derm:    { name: 'Dermatology',        doctor: 'Dr. Maya Lin',      doctorTitle: 'Consultant Dermatologist',                    rationaleTemplate: 'Cutaneous presentations such as pruritus, erythematous rashes, or lesion alterations warrant direct dermatoscopic examination and tailored topical or systemic therapy.',                                    tests: ['Dermoscopy', 'Skin Biopsy', 'Total Serum IgE / Allergy Panel'] },
  neuro:   { name: 'Neurology',          doctor: 'Dr. Robert Chen',   doctorTitle: 'Lead Neurologist & Neurophysiologist',        rationaleTemplate: 'Neurological symptoms such as focal numbness, severe cephalalgia, or acute vestibular instability require detailed cranial nerve assessment.',                                                              tests: ['Cranial Nerve Exam', 'Brain MRI / CT Angiography', 'Carotid Doppler Ultrasound'] },
  ortho:   { name: 'Orthopedics',        doctor: 'Dr. Rajesh Patel',  doctorTitle: 'Chief Orthopedic Surgeon',                   rationaleTemplate: 'Musculoskeletal and articular discomfort indicates possible joint inflammation, ligamentous strain, or degenerative disc changes requiring radiographic evaluation.',                                     tests: ['Digital X-Ray', 'Joint Ultrasound / MRI', 'Serum Uric Acid & CRP'] },
  ent:     { name: 'ENT & Pulmonology',  doctor: 'Dr. Marcus Vance',  doctorTitle: 'ENT Specialist & Respiratory Physician',      rationaleTemplate: 'Upper and lower airway manifestations such as pharyngitis, persistent cough, or sinus obstruction require endoscopy and pulmonary air-flow evaluation.',                                              tests: ['Nasopharyngoscopy', 'Chest X-Ray (PA View)', 'Spirometry (PFT)'] },
  gastro:  { name: 'Gastroenterology',   doctor: 'Dr. Angela Davis',  doctorTitle: 'Consultant Gastroenterologist & Hepatologist', rationaleTemplate: 'Digestive tract symptoms like dyspepsia, epigastric discomfort, or gastroesophageal reflux necessitate specialist digestive assessment.',                                                          tests: ['Abdominal Ultrasound', 'Upper GI Endoscopy', 'Liver Function Panel', 'H. Pylori Antigen'] },
  general: { name: 'General Medicine',   doctor: 'Dr. Alan Bradley',  doctorTitle: 'Head of Internal Medicine & Primary Care',    rationaleTemplate: 'Systemic symptoms like pyrexia, general malaise, or multi-system fatigue are best initially triaged by an Internal Medicine physician.',                                                               tests: ['Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel', 'Urinalysis', 'C-Reactive Protein'] },
  peds:    { name: 'Pediatrics',         doctor: 'Dr. Elena Rostova', doctorTitle: 'Pediatric Specialist & Child Health Lead',    rationaleTemplate: 'Pediatric presentation requires age-specific clinical evaluation, developmental assessment, and gentle pediatric intervention.',                                                                          tests: ['Pediatric Vitals & Growth Charting', 'Rapid Strep / Viral PCR', 'Pediatric Blood Screen'] },
}

type Props = { className?: string; initialSymptom?: string; onBookSuccess?: () => void }

// ─── Symptom label key map (id -> translation key) ────────────────────────────
const SYM_KEY_MAP: Record<string, string> = {
  chest_pain: 'sym_chest_pain', palpitations: 'sym_palpitations',
  shortness_breath: 'sym_shortness_breath', swollen_ankles: 'sym_swollen_ankles',
  skin_rash: 'sym_skin_rash', hives: 'sym_hives',
  mole_change: 'sym_mole_change', eczema: 'sym_eczema',
  severe_headache: 'sym_severe_headache', dizziness: 'sym_dizziness',
  numbness: 'sym_numbness', blurred_vision: 'sym_blurred_vision',
  joint_pain: 'sym_joint_pain', back_pain: 'sym_back_pain',
  knee_stiffness: 'sym_knee_stiffness', sprain: 'sym_sprain',
  sore_throat: 'sym_sore_throat', persistent_cough: 'sym_persistent_cough',
  sinus_pressure: 'sym_sinus_pressure', ear_pain: 'sym_ear_pain',
  stomach_pain: 'sym_stomach_pain', heartburn: 'sym_heartburn',
  nausea: 'sym_nausea', bloating: 'sym_bloating',
  high_fever: 'sym_high_fever', extreme_fatigue: 'sym_extreme_fatigue',
  weight_loss: 'sym_weight_loss',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AISymptomChecker({ className = '', initialSymptom, onBookSuccess }: Props) {
  const { openBookingWithPrefill } = useClinicRealtime()
  const { t } = usePortalLang()

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialSymptom ? [initialSymptom] : [])
  const [customDescription, setCustomDescription]  = useState('')
  const [duration, setDuration]                    = useState('2-3 days')
  const [severity, setSeverity]                    = useState<number>(5)
  const [isAnalyzing, setIsAnalyzing]              = useState(false)
  const [analysisResult, setAnalysisResult]        = useState<RecommendationResult | null>(null)
  const [activeCategory, setActiveCategory]        = useState('all')

  const filteredSymptomChips = useMemo(() =>
    activeCategory === 'all' ? COMMON_SYMPTOMS : COMMON_SYMPTOMS.filter(s => s.category === activeCategory),
    [activeCategory]
  )

  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    setAnalysisResult(null)
  }

  const runSymptomAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    try {
      const res = await fetch('/api/ai/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms, description: customDescription, severity, duration }),
      })
      if (res.ok) { setAnalysisResult(await res.json()); setIsAnalyzing(false); return }
    } catch { /* fall through to heuristic */ }

    const scores: Record<string, number> = { cardio:0, derm:0, neuro:0, ortho:0, ent:0, gastro:0, general:0, peds:0 }
    let hasRedFlag = false

    selectedSymptoms.forEach(id => {
      const item = COMMON_SYMPTOMS.find(s => s.id === id)
      if (item) { scores[item.category] += item.weight; if (item.isRedFlag) hasRedFlag = true }
    })

    const t = customDescription.toLowerCase()
    if (t.includes('chest') || t.includes('heart') || t.includes('angina')) { scores.cardio += 12; if (t.includes('severe') || t.includes('crushing')) hasRedFlag = true }
    if (t.includes('skin') || t.includes('rash') || t.includes('itch'))      scores.derm    += 12
    if (t.includes('headache') || t.includes('numb') || t.includes('dizzy')) { scores.neuro  += 12; if (t.includes('faint') || t.includes('speech')) hasRedFlag = true }
    if (t.includes('bone') || t.includes('joint') || t.includes('back'))     scores.ortho   += 12
    if (t.includes('throat') || t.includes('cough') || t.includes('sinus'))  scores.ent     += 10
    if (t.includes('stomach') || t.includes('vomit') || t.includes('reflux'))scores.gastro  += 12
    if (t.includes('fever') || t.includes('chills') || t.includes('tired'))  scores.general +=  8
    if (t.includes('child') || t.includes('baby') || t.includes('pediatric'))scores.peds    += 14

    let topCat = 'general', maxScore = -1
    Object.entries(scores).forEach(([cat, score]) => { if (score > maxScore) { maxScore = score; topCat = cat } })
    if (maxScore <= 0) { topCat = 'general'; maxScore = 5 }

    const dept = DEPARTMENT_PROFILES[topCat] || DEPARTMENT_PROFILES.general
    const urgency: 'routine' | 'urgent' | 'emergency' =
      hasRedFlag || severity >= 9 ? 'emergency' : severity >= 7 || maxScore >= 16 ? 'urgent' : 'routine'
    const confidence = Math.min(98, Math.max(76, 75 + Math.min(22, maxScore * 2)))

    setAnalysisResult({
      department: dept.name, doctor: dept.doctor, doctorTitle: dept.doctorTitle,
      confidence, urgency, rationale: dept.rationaleTemplate,
      suggestedAction: urgency === 'emergency'
        ? 'Proceed to Emergency Triage immediately or call emergency dispatch.'
        : `Schedule a consultation with ${dept.doctor} (${dept.name}) within ${urgency === 'urgent' ? '24 hours' : '3–5 days'}.`,
      recommendedTests: dept.tests,
    })
    setIsAnalyzing(false)
  }

  const handleBook = () => {
    if (!analysisResult) return
    const complaint = [
      selectedSymptoms.map(id => COMMON_SYMPTOMS.find(s => s.id === id)?.label).filter(Boolean).join(', '),
      customDescription.trim(),
    ].filter(Boolean).join(' — ')
    openBookingWithPrefill({ department: analysisResult.department, doctor: analysisResult.doctor, complaint: complaint || `${analysisResult.department} Consultation` })
    onBookSuccess?.()
  }

  const severityLabel = severity <= 3 ? t('ai_mild') : severity <= 6 ? t('ai_moderate') : t('ai_severe')
  const severityColor  = severity <= 3 ? 'text-emerald-600 bg-emerald-500/15' : severity <= 6 ? 'text-amber-600 bg-amber-500/15' : 'text-rose-600 bg-rose-500/15'
  const canAnalyze = selectedSymptoms.length > 0 || customDescription.trim().length > 0

  return (
    <div className={`rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm ${className}`}>

      {/* ── Card Header ─────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-outline-variant/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ClinivaIcon name="smart_toy" size={20} strokeWidth={1.5} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('ai_badge')}</p>
          <h2 className="font-heading font-bold text-on-surface text-base leading-tight">{t('ai_title')}</h2>
        </div>
      </div>

      <div className="p-4 space-y-5">

        {/* ── Step 1 · Category Filter ─────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2.5">
            {t('ai_step1')}
          </p>
          {/* Scrollable pill row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {CATEGORY_TAB_DEFS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap flex-shrink-0 transition-all border ${
                  activeCategory === tab.id
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/40'
                }`}
              >
                <ClinivaIcon name={tab.icon} size={18} strokeWidth={1.5} />
                {t(tab.tKey)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 2 · Symptom Chips ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              {t('ai_step2')}
              {selectedSymptoms.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                  {selectedSymptoms.length}
                </span>
              )}
            </p>
            {selectedSymptoms.length > 0 && (
              <button onClick={() => { setSelectedSymptoms([]); setAnalysisResult(null) }}
                className="text-[11px] text-primary font-semibold hover:underline">
                {t('ai_clear_all')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredSymptomChips.map(chip => {
              const isSelected = selectedSymptoms.includes(chip.id)
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleToggleSymptom(chip.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all border active:scale-95 ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-primary font-semibold'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {isSelected
                    ? <ClinivaIcon name="check_circle" size={14} strokeWidth={1.5} className="text-primary" />
                    : <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/60 flex-shrink-0" />
                  }
                  {SYM_KEY_MAP[chip.id] ? t(SYM_KEY_MAP[chip.id] as any) : chip.label}
                  {chip.isRedFlag && <span className="text-rose-500 font-bold text-[10px]">●</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Step 3 · Text Description ────────────────────────────── */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
            {t('ai_step3')} <span className="normal-case font-normal">{t('ai_step3_optional')}</span>
          </label>
          <textarea
            rows={3}
            value={customDescription}
            onChange={e => { setCustomDescription(e.target.value); setAnalysisResult(null) }}
            placeholder={t('ai_step3_placeholder')}
            className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* ── Step 4 · Duration + Severity ─────────────────────────── */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low/50 p-4 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t('ai_step4')}
          </p>

          {/* Duration select */}
          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1.5">{t('ai_duration_q')}</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Less than 24 hours">{t('ai_dur_acute')}</option>
              <option value="2-3 days">{t('ai_dur_days')}</option>
              <option value="1-2 weeks">{t('ai_dur_weeks')}</option>
              <option value="Chronic (> 1 month)">{t('ai_dur_chronic')}</option>
            </select>
          </div>

          {/* Severity slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-on-surface">{t('ai_severity_label')}</label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${severityColor}`}>
                {severity}/10 · {severityLabel}
              </span>
            </div>
            <input
              type="range"
              min={1} max={10}
              value={severity}
              onChange={e => setSeverity(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant mt-1.5 px-0.5">
              <span>1 · Mild</span>
              <span>5 · Moderate</span>
              <span>10 · Severe</span>
            </div>
          </div>
        </div>

        {/* ── Analyze Button ───────────────────────────────────────── */}
        <button
          onClick={runSymptomAnalysis}
          disabled={isAnalyzing || !canAnalyze}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('ai_analyzing')}
            </>
          ) : (
            <>
              <ClinivaIcon name="psychology" size={18} strokeWidth={1.5} />
              {t('ai_analyze_btn')}
            </>
          )}
        </button>

        {/* ── Result Card ──────────────────────────────────────────── */}
        {analysisResult && (
          <div className="rounded-xl border border-border-subtle bg-white p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Emergency Banner */}
            {analysisResult.urgency === 'emergency' && (
              <div className="flex items-start gap-3 p-3 bg-[#FDF2F2] border border-[#F8D7D7] rounded-xl">
                <ClinivaIcon name="emergency" size={20} strokeWidth={1.5} className="text-[#C94A4A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#C94A4A]">{t('ai_emergency_title')}</p>
                  <p className="text-xs text-[#C94A4A] mt-0.5">{t('ai_emergency_body')}</p>
                </div>
              </div>
            )}

            {/* Dept + Confidence */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">{t('ai_result_dept')}</p>
                <h3 className="font-heading font-bold text-primary-navy text-xl leading-tight mt-0.5">{analysisResult.department}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF7F2] text-[#2E7D5B] border border-[#C3ECD8] flex-shrink-0">
                {analysisResult.confidence}% {t('ai_result_match')}
              </span>
            </div>

            {/* Urgency Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              analysisResult.urgency === 'emergency' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : analysisResult.urgency === 'urgent'  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {analysisResult.urgency === 'emergency' ? t('ai_urgency_emergency')
                : analysisResult.urgency === 'urgent' ? t('ai_urgency_urgent')
                : t('ai_urgency_routine')}
            </div>

            {/* Doctor Card */}
            <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                {analysisResult.doctor.charAt(4)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{analysisResult.doctor}</p>
                <p className="text-xs text-on-surface-variant truncate">{analysisResult.doctorTitle}</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('ai_result_rationale')}</p>
              <p className="text-xs text-on-surface leading-relaxed">{analysisResult.rationale}</p>
            </div>

            {/* Suggested Tests */}
            {analysisResult.recommendedTests.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('ai_result_tests')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.recommendedTests.map(test => (
                    <span key={test} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-container-high text-on-surface border border-outline-variant/30">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Action */}
            <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-xl p-3 leading-relaxed border border-outline-variant/20">
              <strong className="text-on-surface">{t('ai_result_nextstep')}</strong> {analysisResult.suggestedAction}
            </p>

            {/* Book Button */}
            <button
              type="button"
              onClick={handleBook}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ClinivaIcon name="calendar_add_on" size={18} strokeWidth={1.5} />
              {t('ai_book_btn')} {analysisResult.department}
            </button>
            <p className="text-center text-[11px] text-on-surface-variant -mt-2">
              {t('ai_book_sub')}
            </p>
          </div>
        )}

        {/* Empty state (before analysis) */}
        {!analysisResult && !isAnalyzing && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/30 text-on-surface-variant text-xs">
            <ClinivaIcon name="info" size={20} strokeWidth={1.5} className="flex-shrink-0" />
            {t('ai_info_hint')} <strong className="text-on-surface mx-1">{t('ai_info_hint2')}</strong> {t('ai_info_hint3')}
          </div>
        )}

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <p className="text-[11px] text-on-surface-variant text-center leading-relaxed px-2">
          {t('ai_disclaimer')}
        </p>

      </div>
    </div>
  )
}
