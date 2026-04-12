// src/lib/pipeline/index.ts
import { DossierLitige, PipelineStep } from '@/types'
import { normalizeData } from './normalizeData'
import { rapprochement } from './rapprochement'
import { detectEcarts } from './detectEcarts'
import { generateLitige } from './generateLitige'

export async function runPipeline(
  prefactureRaw: Record<string, any>[],
  proformaRaw: Record<string, any>[],
  onStep?: (step: PipelineStep) => void
): Promise<DossierLitige> {
  
  // Debug logs for development
  console.log('🚀 Starting pipeline...')
  console.log('Prefacture raw:', prefactureRaw.length, 'rows')
  console.log('Proforma raw:', proformaRaw.length, 'rows')

  // Initialize pipeline steps for UI feedback
  const steps: PipelineStep[] = [
    { id: 'normalize', label: 'Normalisation', status: 'running' },
    { id: 'match', label: 'Rapprochement', status: 'pending' },
    { id: 'detect', label: 'Détection', status: 'pending' },
    { id: 'generate', label: 'Dossier prêt', status: 'pending' }
  ]

  // Helper to emit step updates to UI
  const emit = (id: string, status: PipelineStep['status'], detail?: string) => {
    const s = steps.find(x => x.id === id)
    if (s) { 
      s.status = status
      s.detail = detail 
      onStep?.({ ...s }) 
    }
  }

  // Step 1: Normalize data
  emit('normalize', 'running')
  console.log('🔧 Normalizing data...')
  const pref = normalizeData(prefactureRaw)
  const prof = normalizeData(proformaRaw)
  console.log(`✅ Normalized: prefacture=${pref.length}, proforma=${prof.length}`)
  emit('normalize', 'done', `${pref.length + prof.length} lignes normalisées`)

  // Step 2: Rapprochement (line-by-line matching)
  emit('match', 'running')
  console.log('🔍 Running rapprochement...')
  const matched = rapprochement(pref, prof)
  console.log(`✅ Matched: ${matched.length} pairs`)
  emit('match', 'done', `${matched.length} paires traitées`)

  // Step 3: Detect and classify écarts
  emit('detect', 'running')
  console.log('⚠️ Detecting écarts...')
  const flagged = detectEcarts(matched)
  const ecartsCount = flagged.filter(r => r.typeEcart !== 'ok').length
  console.log(`✅ Found ${ecartsCount} écarts`)
  emit('detect', 'done', `${ecartsCount} écarts identifiés`)

  // Step 4: Generate final litige dossier (async for AI layer)
  emit('generate', 'running')
  console.log('📄 Generating dossier de litige...')
  const dossier = await generateLitige(flagged)
  console.log(`✅ Dossier generated: ${dossier.id}`)
  emit('generate', 'done', 'Prêt pour export')

  return dossier
}