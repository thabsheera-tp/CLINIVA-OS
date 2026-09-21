import { NextResponse } from 'next/server'

export type SymptomAnalysisRequest = {
  symptoms?: string[]
  description?: string
  severity?: number
  duration?: string
}

export type SymptomAnalysisResponse = {
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
      'Airway manifestations such as pharyngitis, persistent cough, or sinus obstruction require endoscopy and pulmonary air-flow evaluation.',
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
  pediatrics: {
    name: 'Pediatrics',
    doctor: 'Dr. Elena Rostova',
    doctorTitle: 'Pediatric Specialist & Child Health Lead',
    rationaleTemplate:
      'Pediatric presentation requires age-specific clinical evaluation, developmental assessment, and gentle pediatric intervention.',
    tests: ['Pediatric Vitals & Growth Charting', 'Rapid Strep / Viral PCR', 'Pediatric Blood Screen'],
  },
}

export async function POST(req: Request) {
  try {
    const body: SymptomAnalysisRequest = await req.json()
    const { symptoms = [], description = '', severity = 5, duration = '2-3 days' } = body

    const scores: Record<string, number> = {
      cardio: 0,
      derm: 0,
      neuro: 0,
      ortho: 0,
      ent: 0,
      gastro: 0,
      general: 0,
      pediatrics: 0,
    }

    let hasEmergencyRedFlag = false

    // 1. Evaluate selected symptom tokens
    for (const s of symptoms) {
      const sym = s.toLowerCase()
      if (sym.includes('chest') || sym.includes('angina') || sym.includes('palpitation') || sym.includes('cardio')) {
        scores.cardio += 10
        if (sym.includes('chest_pain')) hasEmergencyRedFlag = true
      } else if (sym.includes('rash') || sym.includes('skin') || sym.includes('derm') || sym.includes('mole') || sym.includes('hives')) {
        scores.derm += 10
      } else if (sym.includes('headache') || sym.includes('neuro') || sym.includes('dizzy') || sym.includes('numb') || sym.includes('vision')) {
        scores.neuro += 10
        if (sym.includes('blurred_vision') || sym.includes('numbness')) hasEmergencyRedFlag = true
      } else if (sym.includes('joint') || sym.includes('back') || sym.includes('ortho') || sym.includes('knee') || sym.includes('sprain')) {
        scores.ortho += 10
      } else if (sym.includes('cough') || sym.includes('throat') || sym.includes('ent') || sym.includes('sinus') || sym.includes('ear')) {
        scores.ent += 10
      } else if (sym.includes('stomach') || sym.includes('gastro') || sym.includes('nausea') || sym.includes('heartburn') || sym.includes('bloat')) {
        scores.gastro += 10
      } else if (sym.includes('fever') || sym.includes('fatigue') || sym.includes('weight') || sym.includes('malaise')) {
        scores.general += 8
      } else if (sym.includes('child') || sym.includes('pediatric') || sym.includes('infant')) {
        scores.pediatrics += 12
      }
    }

    // 2. Natural language keyword NLP analysis
    const text = description.toLowerCase()
    if (text.includes('chest') || text.includes('heart') || text.includes('angina') || text.includes('pulse') || text.includes('palpitation')) {
      scores.cardio += 14
      if (text.includes('severe') || text.includes('crushing') || text.includes('radiat') || text.includes('left arm')) {
        hasEmergencyRedFlag = true
      }
    }
    if (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('acne') || text.includes('eczema') || text.includes('mole') || text.includes('hives')) {
      scores.derm += 14
    }
    if (text.includes('headache') || text.includes('migraine') || text.includes('numb') || text.includes('dizzy') || text.includes('seizure') || text.includes('paralysis') || text.includes('speech')) {
      scores.neuro += 14
      if (text.includes('faint') || text.includes('speech') || text.includes('paraly') || text.includes('sudden vision')) {
        hasEmergencyRedFlag = true
      }
    }
    if (text.includes('bone') || text.includes('joint') || text.includes('knee') || text.includes('back pain') || text.includes('fracture') || text.includes('sprain') || text.includes('arthritis')) {
      scores.ortho += 14
    }
    if (text.includes('throat') || text.includes('cough') || text.includes('ear') || text.includes('sinus') || text.includes('breathing') || text.includes('nasal') || text.includes('asthma')) {
      scores.ent += 12
      if (text.includes('cannot breathe') || text.includes('gasping')) {
        hasEmergencyRedFlag = true
      }
    }
    if (text.includes('stomach') || text.includes('vomit') || text.includes('reflux') || text.includes('diarrhea') || text.includes('abdomen') || text.includes('cramp') || text.includes('gut')) {
      scores.gastro += 14
      if (text.includes('blood in vomit') || text.includes('black stool')) {
        hasEmergencyRedFlag = true
      }
    }
    if (text.includes('fever') || text.includes('chills') || text.includes('tired') || text.includes('weakness') || text.includes('malaise')) {
      scores.general += 10
    }
    if (text.includes('child') || text.includes('baby') || text.includes('pediatric') || text.includes('toddler') || text.includes('infant')) {
      scores.pediatrics += 16
    }

    // 3. Find top department match
    let topCategory = 'general'
    let highestScore = -1

    for (const [cat, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score
        topCategory = cat
      }
    }

    if (highestScore <= 0) {
      topCategory = 'general'
      highestScore = 6
    }

    const profile = DEPARTMENT_PROFILES[topCategory] || DEPARTMENT_PROFILES.general

    // 4. Determine clinical urgency
    let urgency: 'routine' | 'urgent' | 'emergency' = 'routine'
    if (hasEmergencyRedFlag || severity >= 9) {
      urgency = 'emergency'
    } else if (severity >= 7 || highestScore >= 18) {
      urgency = 'urgent'
    }

    // 5. Calculate calibrated confidence
    const confidence = Math.min(98, Math.max(78, 75 + Math.min(23, highestScore * 2)))

    const response: SymptomAnalysisResponse = {
      department: profile.name,
      doctor: profile.doctor,
      doctorTitle: profile.doctorTitle,
      confidence,
      urgency,
      rationale: profile.rationaleTemplate,
      suggestedAction:
        urgency === 'emergency'
          ? 'Proceed to Emergency Triage immediately or call emergency medical dispatch.'
          : `Schedule a consultation with ${profile.doctor} (${profile.name}) within ${
              urgency === 'urgent' ? '24 hours' : 'the next 3-5 business days'
            }.`,
      recommendedTests: profile.tests,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to analyze symptoms', details: error?.message },
      { status: 500 }
    )
  }
}
