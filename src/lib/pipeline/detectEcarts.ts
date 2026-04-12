import { ResultatRapprochement } from '@/types'

export function detectEcarts(results: ResultatRapprochement[]): ResultatRapprochement[] {
  return results.map(r => {
    const absEcart = Math.abs(r.ecart)
    
    if (absEcart === 0 && r.typeEcart === 'ok') {
      return { ...r, typeEcart: 'ok', statut: 'valide' }
    }
    if (r.typeEcart === 'ligne_supplementaire' || r.typeEcart === 'reference_manquante') {
      return { ...r, statut: 'a_verifier' }
    }
    
    // Spec thresholds
    if (absEcart < 50) return { ...r, typeEcart: 'montant', statut: 'a_verifier' }
    return { ...r, typeEcart: 'montant', statut: 'prioritaire' }
  })
}