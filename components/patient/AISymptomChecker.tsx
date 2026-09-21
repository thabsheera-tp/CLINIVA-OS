'use client'

import React, { useState, useMemo } from 'react'
import { useClinicRealtime } from '@/context/ClinicRealtimeContext'

// Pre-defined symptom dictionary organized by clinical presentation
export type SymptomItem = {
  id: string
  label: string
  category: 'cardio' | 'derm' | 'neuro' | 'ortho' | 'ent' | 'gastro' | 'general' | 'peds'
  isRedFlag?: boolean
  weight: number
}

const COMMON_SYMPTOMS: SymptomItem[] = [
  // Cardiology
  { id: 'chest_pain', label: 'Chest Pain or Pressure', category: 'cardio', isRedFlag: true, weight: 10 },
  { id: 'palpitations', label: 'Irregular Heartbeat / Palpitations', category: 'cardio', isRedFlag: false, weight: 8 },
  { id: 'shortness_breath', label: 'Shortness of Breath on Exertion', category: 'cardio', isRedFlag: true, weight: 9 },
  { id: 'swollen_ankles', label: 'Swollen Feet or Ankles (Edema)', category: 'cardio', isRedFlag: false, weight: 6 },

  // Dermatology
  { id: 'skin_rash', label: 'Itchy Red Skin Rash', category: 'derm', isRedFlag: false, weight: 8 },
  { id: 'hives', label: 'Hives or Welts (Urticaria)', category: 'derm', isRedFlag: false, weight: 7 },
  { id: 'mole_change', label: 'Changing / Irregular Mole', category: 'derm', isRedFlag: false, weight: 8 },
  { id: 'eczema', label: 'Dry, Flaking, Eczema Patches', category: 'derm', isRedFlag: false, weight: 6 },

  // Neurology
  { id: 'severe_headache', label: 'Severe Throbbing Headache / Migraine', category: 'neuro', isRedFlag: false, weight: 8 },
  { id: 'dizziness', label: 'Dizziness or Vertigo', category: 'neuro', isRedFlag: false, weight: 7 },
  { id: 'numbness', label: 'Numbness or Tingling in Limbs', category: 'neuro', isRedFlag: true, weight: 9 },
  { id: 'blurred_vision', label: 'Sudden Blurred / Double Vision', category: 'neuro', isRedFlag: true, weight: 9 },

  // Orthopedics
  { id: 'joint_pain', label: 'Severe Joint Pain or Swelling', category: 'ortho', isRedFlag: false, weight: 8 },
  { id: 'back_pain', label: 'Lower Back Pain / Sciatica', category: 'ortho', isRedFlag: false, weight: 7 },
  { id: 'knee_stiffness', label: 'Knee Stiffness or Reduced Mobility', category: 'ortho', isRedFlag: false, weight: 7 },
  { id: 'sprain', label: 'Sports Injury / Ligament Sprain', category: 'ortho', isRedFlag: false, weight: 6 },

  // ENT & Respiratory
  { id: 'sore_throat', label: 'Sore Throat & Difficulty Swallowing', category: 'ent', isRedFlag: false, weight: 7 },
  { id: 'persistent_cough', label: 'Chronic Dry or Productive Cough', category: 'ent', isRedFlag: false, weight: 8 },
  { id: 'sinus_pressure', label: 'Sinus Pressure & Nasal Blockage', category: 'ent', isRedFlag: false, weight: 6 },
  { id: 'ear_pain', label: 'Ear Ache or Ringing (Tinnitus)', category: 'ent', isRedFlag: false, weight: 6 },

  // Gastroenterology
  { id: 'stomach_pain', label: 'Sharp Abdominal Pain or Cramps', category: 'gastro', isRedFlag: false, weight: 8 },
  { id: 'heartburn', label: 'Acid Reflux / Burning Heartburn', category: 'gastro', isRedFlag: false, weight: 7 },
  { id: 'nausea', label: 'Persistent Nausea or Vomiting', category: 'gastro', isRedFlag: false, weight: 7 },
  { id: 'bloating', label: 'Chronic Indigestion & Bloating', category: 'gastro', isRedFlag: false, weight: 5 },

  // General Medicine
  { id: 'high_fever', label: 'High Fever & Chills (> 101°F)', category: 'general', isRedFlag: false, weight: 8 },
  { id: 'extreme_fatigue', label: 'Extreme Fatigue & General Malaise', category: 'general', isRedFlag: false, weight: 6 },
  { id: 'weight_loss', label: 'Unexplained Sudden Weight Loss', category: 'general', isRedFlag: false, weight: 7 },
]

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

const DEPARTMENT_PROFILES: Record<
  string,
  {
    name: string
    doctor: string
    doctorTitle: string
    rationaleTemplate: string
    tests: string[]
  }
> = {
  cardio: {
    name: 'Cardiology',
    doctor: 'Dr. Sarah Jenkins',
    doctorTitle: 'Senior Consultant Cardiologist',
    rationaleTemplate:
      'Symptoms indicate potential cardiovascular involvement requiring immediate hemodynamic evaluation, cardiac rhythm assessment, and risk stratification.',
    tests: ['12-Lead Electrocardiogram (ECG)', 'Cardiac Troponin I', 'Echocardiogram', 'Lipid Profile'],
  },
  derm: {
    name: 'Dermatology',
    doctor: 'Dr. Maya Lin',
    doctorTitle: 'Consultant Dermatologist & Cutaneous Specialist',
    rationaleTemplate:
      'Cutaneous presentations such as pruritus, erythematous rashes, or lesion alterations warrant direct dermatoscopic examination and tailored topical or systemic therapy.',
    tests: ['Dermoscopy', 'Skin Scraping / Biopsy', 'Total Serum IgE / Allergy Panel'],
  },
  neuro: {
    name: 'Neurology',
    doctor: 'Dr. Robert Chen',
    doctorTitle: 'Lead Neurologist & Neurophysiologist',
    rationaleTemplate:
      'Neurological symptoms such as focal numbness, severe cephalalgia, or acute vestibular instability require detailed cranial nerve assessment.',
    tests: ['Neurological Cranial Nerve Exam', 'Brain MRI / CT Angiography', 'Carotid Doppler Ultrasound'],
  },
  ortho: {
    name: 'Orthopedics',
    doctor: 'Dr. Rajesh Patel',
    doctorTitle: 'Chief Orthopedic Surgeon & Sports Medicine Specialist',
    rationaleTemplate:
      'Musculoskeletal and articular discomfort indicates possible joint inflammation, ligamentous strain, or degenerative disc changes requiring radiographic evaluation.',
    tests: ['Targeted Digital X-Ray', 'Joint Ultrasound / MRI', 'Serum Uric Acid & ESR / CRP'],
  },
  ent: {
    name: 'ENT & Pulmonology',
    doctor: 'Dr. Marcus Vance',
    doctorTitle: 'ENT Specialist & Respiratory Physician',
    rationaleTemplate:
      'Upper and lower airway manifestations such as pharyngitis, persistent cough, or sinus obstruction require endoscopy and pulmonary air-flow evaluation.',
    tests: ['Fiberoptic Nasopharyngoscopy', 'Chest X-Ray (PA View)', 'Spirometry (PFT)'],
  },
  gastro: {
    name: 'Gastroenterology',
    doctor: 'Dr. Angela Davis',
    doctorTitle: 'Consultant Gastroenterologist & Hepatologist',
    rationaleTemplate:
      'Digestive tract symptoms like dyspepsia, epigastric discomfort, or gastroesophageal reflux necessitate specialist digestive assessment.',
    tests: ['Abdominal Ultrasound', 'Upper GI Endoscopy', 'Liver Function Panel (LFT)', 'H. Pylori Antigen'],
  },
  general: {
    name: 'General Medicine',
    doctor: 'Dr. Alan Bradley',
    doctorTitle: 'Head of Internal Medicine & Primary Care',
    rationaleTemplate:
      'Systemic symptoms like pyrexia, general malaise, or multi-system fatigue are best initially triaged by an Internal Medicine physician.',
    tests: ['Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel (CMP)', 'Urinalysis', 'C-Reactive Protein'],
  },
  peds: {
    name: 'Pediatrics',
    doctor: 'Dr. Elena Rostova',
    doctorTitle: 'Pediatric Specialist & Child Health Lead',
    rationaleTemplate:
      'Pediatric presentation requires age-specific clinical evaluation, developmental assessment, and gentle pediatric intervention.',
    tests: ['Pediatric Vitals & Growth Charting', 'Rapid Strep / Viral PCR', 'Pediatric Blood Screen'],
  },
}

type Props = {
  className?: string
  initialSymptom?: string
  onBookSuccess?: () => void
}

export default function AISymptomChecker({ className = '', initialSymptom, onBookSuccess }: Props) {
  const { openBookingWithPrefill } = useClinicRealtime()

  // Form states
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialSymptom ? [initialSymptom] : []
  )
  const [customDescription, setCustomDescription] = useState('')
  const [duration, setDuration] = useState('2-3 days')
  const [severity, setSeverity] = useState<number>(5)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<RecommendationResult | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Toggle symptom chip
  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
    // Clear old result so user can re-analyze
    setAnalysisResult(null)
  }

  // Filter symptoms by category
  const filteredSymptomChips = useMemo(() => {
    if (activeCategory === 'all') return COMMON_SYMPTOMS
    return COMMON_SYMPTOMS.filter((s) => s.category === activeCategory)
  }, [activeCategory])

  // AI Diagnostic Heuristic Analysis
  const runSymptomAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Simulate AI inference latency with realistic feedback
    setTimeout(() => {
      const categoryScores: Record<string, number> = {
        cardio: 0,
        derm: 0,
        neuro: 0,
        ortho: 0,
        ent: 0,
        gastro: 0,
        general: 0,
      }

      let hasEmergencyRedFlag = false

      // 1. Score from selected chips
      selectedSymptoms.forEach((symptomId) => {
        const item = COMMON_SYMPTOMS.find((s) => s.id === symptomId)
        if (item) {
          categoryScores[item.category] = (categoryScores[item.category] || 0) + item.weight
          if (item.isRedFlag) hasEmergencyRedFlag = true
        }
      })

      // 2. Score from free-form text input (NLP keyword search)
      const text = customDescription.toLowerCase()
      if (text.includes('chest') || text.includes('heart') || text.includes('angina') || text.includes('pulse')) {
        categoryScores.cardio += 12
        if (text.includes('severe') || text.includes('crushing') || text.includes('radiat')) {
          hasEmergencyRedFlag = true
        }
      }
      if (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('acne') || text.includes('eczema')) {
        categoryScores.derm += 12
      }
      if (text.includes('headache') || text.includes('migraine') || text.includes('numb') || text.includes('dizzy') || text.includes('seizure')) {
        categoryScores.neuro += 12
        if (text.includes('faint') || text.includes('speech') || text.includes('paraly')) {
          hasEmergencyRedFlag = true
        }
      }
      if (text.includes('bone') || text.includes('joint') || text.includes('knee') || text.includes('back pain') || text.includes('fracture')) {
        categoryScores.ortho += 12
      }
      if (text.includes('throat') || text.includes('cough') || text.includes('ear') || text.includes('sinus') || text.includes('breathing')) {
        categoryScores.ent += 10
      }
      if (text.includes('stomach') || text.includes('vomit') || text.includes('reflux') || text.includes('diarrhea') || text.includes('abdomen')) {
        categoryScores.gastro += 12
      }
      if (text.includes('fever') || text.includes('chills') || text.includes('tired') || text.includes('weakness')) {
        categoryScores.general += 8
      }

      // 3. Find highest matching category
      let highestCategory = 'general'
      let maxScore = -1

      Object.entries(categoryScores).forEach(([cat, score]) => {
        if (score > maxScore) {
          maxScore = score
          highestCategory = cat
        }
      })

      // If no symptoms selected and no description, default to general medicine
      if (maxScore <= 0) {
        highestCategory = 'general'
        maxScore = 5
      }

      const deptProfile = DEPARTMENT_PROFILES[highestCategory] || DEPARTMENT_PROFILES.general

      // Determine urgency
      let urgency: 'routine' | 'urgent' | 'emergency' = 'routine'
      if (hasEmergencyRedFlag || severity >= 9) {
        urgency = 'emergency'
      } else if (severity >= 7 || maxScore >= 16) {
        urgency = 'urgent'
      }

      // Calculate confidence percentage
      const computedConfidence = Math.min(98, Math.max(76, 75 + Math.min(22, maxScore * 2)))

      const result: RecommendationResult = {
        department: deptProfile.name,
        doctor: deptProfile.doctor,
        doctorTitle: deptProfile.doctorTitle,
        confidence: computedConfidence,
        urgency,
        rationale: deptProfile.rationaleTemplate,
        suggestedAction:
          urgency === 'emergency'
            ? 'Proceed to Emergency Triage immediately or call emergency dispatch.'
            : `Schedule a consultation with ${deptProfile.doctor} (${deptProfile.name}) within ${
                urgency === 'urgent' ? '24 hours' : 'the next 3-5 days'
              }.`,
        recommendedTests: deptProfile.tests,
      }

      setAnalysisResult(result)
      setIsAnalyzing(false)
    }, 700)
  }

  // Handle direct booking prefill action
  const handleBookWithDepartment = () => {
    if (!analysisResult) return

    const summaryComplaint = [
      selectedSymptoms
        .map((id) => COMMON_SYMPTOMS.find((s) => s.id === id)?.label)
        .filter(Boolean)
        .join(', '),
      customDescription.trim(),
    ]
      .filter(Boolean)
      .join(' — ')

    openBookingWithPrefill({
      department: analysisResult.department,
      doctor: analysisResult.doctor,
      complaint: summaryComplaint || `${analysisResult.department} Consultation`,
    })

    if (onBookSuccess) onBookSuccess()
  }

  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg shadow-sm ${className}`}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between pb-space-md border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-label-xs font-bold uppercase tracking-wider text-primary">
              Clinical AI Assistant
            </span>
          </div>
          <h2 className="font-heading text-title-lg md:text-headline-sm font-bold text-on-surface mt-1">
            AI Symptom Checker & Department Recommender
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Select or describe your symptoms to receive instant clinical triage and department
            recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-md">
        {/* ── Left Column: Symptom Input Form (7 cols) ── */}
        <div className="lg:col-span-7 space-y-space-md">
          {/* Step 1: Category Filter & Multi-Select Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                <span>1. Select Common Symptoms</span>
                {selectedSymptoms.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-on-primary">
                    {selectedSymptoms.length} selected
                  </span>
                )}
              </label>

              {/* Reset selected */}
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="text-label-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5">
              {[
                { id: 'all', label: 'All Symptoms' },
                { id: 'cardio', label: 'Heart & Chest' },
                { id: 'derm', label: 'Skin & Rash' },
                { id: 'neuro', label: 'Head & Nerve' },
                { id: 'ortho', label: 'Joints & Bones' },
                { id: 'ent', label: 'Throat & Ear' },
                { id: 'gastro', label: 'Stomach & Digestion' },
                { id: 'general', label: 'Fever & General' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 rounded-full text-label-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === tab.id
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Symptom Chips */}
            <div className="flex flex-wrap gap-2">
              {filteredSymptomChips.map((chip) => {
                const isSelected = selectedSymptoms.includes(chip.id)
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleToggleSymptom(chip.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-body-xs font-medium transition-all border touch-tap ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-primary font-semibold shadow-xs'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-outline-variant'
                    }`}
                  >
                    {isSelected ? (
                      <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/60" />
                    )}
                    <span>{chip.label}</span>
                    {chip.isRedFlag && (
                      <span
                        title="High clinical importance symptom"
                        className="text-[10px] text-rose-500 font-bold"
                      >
                        *
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Custom Natural Language Complaint */}
          <div>
            <label className="text-label-sm font-bold text-on-surface block mb-1">
              2. Describe Your Condition in Your Own Words
            </label>
            <textarea
              rows={3}
              value={customDescription}
              onChange={(e) => {
                setCustomDescription(e.target.value)
                setAnalysisResult(null)
              }}
              placeholder="e.g., I have had a spreading red rash on both arms for 3 days with intense itching, and mild fever started yesterday..."
              className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Step 3: Duration & Severity Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md p-space-md bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
            {/* Duration */}
            <div>
              <label className="text-label-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                Duration of Symptoms
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Less than 24 hours">Less than 24 hours (Acute)</option>
                <option value="2-3 days">2 - 3 Days</option>
                <option value="1-2 weeks">1 - 2 Weeks</option>
                <option value="Chronic (> 1 month)">Chronic (&gt; 1 Month)</option>
              </select>
            </div>

            {/* Severity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-label-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Discomfort Severity
                </label>
                <span
                  className={`text-label-xs font-bold px-2 py-0.5 rounded-md ${
                    severity <= 3
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : severity <= 6
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {severity}/10 ({severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'})
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-0.5">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>
          </div>

          {/* Action: Run AI Analysis */}
          <button
            onClick={runSymptomAnalysis}
            disabled={isAnalyzing || (selectedSymptoms.length === 0 && !customDescription.trim())}
            className="w-full py-3 px-space-md bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-semibold text-label-md transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-tap"
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Analyzing Symptoms with Clinical Engine...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Analyze Symptoms & Recommend Department</span>
              </>
            )}
          </button>
        </div>

        {/* ── Right Column: AI Triage & Recommendation Result (5 cols) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-space-md">
          {analysisResult ? (
            <div className="bg-gradient-to-b from-surface-container-low to-surface-container-lowest border-2 border-primary/30 rounded-2xl p-space-md shadow-sm space-y-space-md">
              {/* Emergency Banner if Red Flag */}
              {analysisResult.urgency === 'emergency' && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5">
                  <svg
                    className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-label-sm font-bold text-rose-700 dark:text-rose-300">
                      Emergency Alert
                    </h4>
                    <p className="text-body-xs text-rose-600 dark:text-rose-400 mt-0.5">
                      Your symptoms may require immediate medical attention. Please visit the
                      Emergency Room or call an ambulance if you experience severe distress.
                    </p>
                  </div>
                </div>
              )}

              {/* Department Match Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-label-xs uppercase font-bold text-on-surface-variant">
                    Recommended Department
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-label-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {analysisResult.confidence}% Confidence Match
                  </span>
                </div>
                <h3 className="font-heading text-headline-sm font-extrabold text-primary mt-1">
                  {analysisResult.department}
                </h3>
              </div>

              {/* Consulting Specialist Doctor Card */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                <div className="w-11 h-11 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary font-bold text-label-lg flex-shrink-0">
                  {analysisResult.doctor.charAt(4)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-label-md font-bold text-on-surface truncate">
                    {analysisResult.doctor}
                  </div>
                  <div className="text-body-xs text-on-surface-variant truncate">
                    {analysisResult.doctorTitle}
                  </div>
                </div>
              </div>

              {/* Clinical Rationale */}
              <div className="space-y-1">
                <span className="text-label-xs uppercase font-bold text-on-surface-variant">
                  Clinical Rationale
                </span>
                <p className="text-body-xs text-on-surface leading-relaxed">
                  {analysisResult.rationale}
                </p>
              </div>

              {/* Recommended Preliminary Diagnostics */}
              {analysisResult.recommendedTests && analysisResult.recommendedTests.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-label-xs uppercase font-bold text-on-surface-variant">
                    Suggested Preliminary Tests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.recommendedTests.map((test) => (
                      <span
                        key={test}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-surface-container-high text-on-surface border border-outline-variant/30"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DIRECT BOOKING ACTION BUTTON (Requirement 3) */}
              <div className="pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={handleBookWithDepartment}
                  className="w-full py-3 px-space-md bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-label-md transition-all shadow-md flex items-center justify-center gap-2 touch-tap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Book Appointment with {analysisResult.department}</span>
                  <span className="text-white/80 text-xs">→</span>
                </button>
                <p className="text-center text-[11px] text-on-surface-variant mt-1.5">
                  Auto-fills department, doctor, and symptom details into the instant booking form.
                </p>
              </div>
            </div>
          ) : (
            /* Empty State Prompt */
            <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/30 p-space-lg flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h4 className="font-heading text-title-md font-bold text-on-surface">
                Ready to Analyze
              </h4>
              <p className="text-body-sm text-on-surface-variant max-w-xs mt-1">
                Select your symptoms on the left or type your complaint to get a personalized
                department match and direct booking recommendation.
              </p>
            </div>
          )}

          {/* Clinical Disclaimer */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-center">
            <p className="text-[11px] text-on-surface-variant leading-tight">
              <strong>Medical Disclaimer:</strong> This symptom checker is an informational triage aid
              and does not replace professional medical diagnosis. In case of life-threatening
              emergencies, please contact emergency dispatch immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
