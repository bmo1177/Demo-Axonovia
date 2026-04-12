// src/types/index.ts
export type DocumentType = 'prefacture' | 'proforma'
export type EcartType = 'montant' | 'reference_manquante' | 'ligne_supplementaire' | 'ok'
export type StatutLitige = 'prioritaire' | 'a_verifier' | 'valide' | 'archive'

export interface LigneTarif {
  reference: string
  client: string
  description: string
  montant: number
  date: string
  source: DocumentType
}

export interface ResultatRapprochement {
  reference: string
  client: string
  description: string
  montantAttendu: number
  montantDetecte: number
  ecart: number
  ecartPct: number
  typeEcart: EcartType
  statut: StatutLitige
  alerte: string
}

export interface DossierLitige {
  id: string
  dateGeneration: string
  transporteur: string
  totalDossiers: number
  totalEcarts: number
  montantTotal: number
  montantRecuperable: number
  resultats: ResultatRapprochement[]
  resume: string
}

export interface PipelineStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
}