// src/lib/pipeline/generateLitige.ts
import { ResultatRapprochement, DossierLitige } from '@/types'
import { generateAlerte, generateResume } from '@/lib/aiLayer'

export async function generateLitige(
  results: ResultatRapprochement[], 
  transporteur: string = 'Transporteur Demo'
): Promise<DossierLitige> {
  
  // Generate alert messages for each result (async for hybrid AI)
  // Generate alert messages for each result sequentially to respect rate limits
  const withAlerts: ResultatRapprochement[] = []
  for (const r of results) {
    withAlerts.push({
      ...r,
      alerte: await generateAlerte(r)
    })
    // Small pause to be gentle on free tier APIs
    if (process.env.NEXT_PUBLIC_AI_MODE_ENABLED === 'true') {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  // Filter to only écarts (non-ok results)
  const ecarts = withAlerts.filter(r => r.typeEcart !== 'ok')
  
  // Calculate récupérable amount: only positive écarts with 'prioritaire' status
  const montantRecuperable = ecarts
    .filter(r => r.ecart > 0 && r.statut === 'prioritaire')
    .reduce((sum, r) => sum + r.ecart, 0)

  // Count unique references that were expected (present in proforma)
  const uniqueRefs = new Set(results.filter(r => r.typeEcart !== 'ligne_supplementaire').map(r => r.reference)).size

  // Assemble the final dossier
  const dossier: Partial<DossierLitige> = {
    id: `VIG-${Date.now().toString(36).toUpperCase()}`,
    dateGeneration: new Date().toLocaleDateString('fr-FR'),
    transporteur,
    totalDossiers: uniqueRefs,
    totalEcarts: ecarts.length,
    montantTotal: results.reduce((s, r) => s + r.montantDetecte, 0),
    montantRecuperable,
    resultats: withAlerts
  }

  return {
    ...dossier,
    resume: await generateResume(dossier),
    resultats: withAlerts
  } as DossierLitige
}