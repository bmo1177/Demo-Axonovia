import { LigneTarif, ResultatRapprochement } from '@/types'

export function rapprochement(prefacture: LigneTarif[], proforma: LigneTarif[]): ResultatRapprochement[] {
  const results: ResultatRapprochement[] = []
  const proformaMap = new Map<string, LigneTarif>()
  proforma.forEach(p => proformaMap.set(p.reference, p))

  // Match prefacture lines against proforma
  prefacture.forEach(pref => {
    const prof = proformaMap.get(pref.reference)
    if (prof) {
      results.push({
        reference: pref.reference,
        client: pref.client,
        description: pref.description || prof.description,
        montantAttendu: prof.montant,
        montantDetecte: pref.montant,
        ecart: pref.montant - prof.montant,
        ecartPct: prof.montant > 0 ? ((pref.montant - prof.montant) / prof.montant) * 100 : 0,
        typeEcart: 'ok',
        statut: 'valide',
        alerte: ''
      })
      proformaMap.delete(pref.reference) // Mark as matched
    } else {
      results.push({
        reference: pref.reference,
        client: pref.client,
        description: pref.description,
        montantAttendu: 0,
        montantDetecte: pref.montant,
        ecart: pref.montant,
        ecartPct: 100,
        typeEcart: 'ligne_supplementaire',
        statut: 'a_verifier',
        alerte: ''
      })
    }
  })

  // Add unmatched proforma lines (missing from prefacture)
  proformaMap.forEach(prof => {
    results.push({
      reference: prof.reference,
      client: prof.client,
      description: prof.description,
      montantAttendu: prof.montant,
      montantDetecte: 0,
      ecart: -prof.montant,
      ecartPct: -100,
      typeEcart: 'reference_manquante',
      statut: 'a_verifier',
      alerte: ''
    })
  })

  return results
}