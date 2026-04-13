// src/lib/aiLayer.ts
import { ResultatRapprochement, DossierLitige } from '@/types'

// ================= CONFIGURATION =================
const USE_REAL_AI = process.env.NEXT_PUBLIC_AI_MODE_ENABLED === 'true' || process.env.NEXT_PUBLIC_OPENROUTER_MODE === 'true'
//const USE_REAL_AI = !!OPENROUTER_KEY
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
//const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'

if (typeof window !== 'undefined') {
  console.log(`🤖 AI Layer Initialized | Mode: ${USE_REAL_AI ? 'Real AI' : 'Mock'} | Model: ${MODEL}`)
}

// ================= REAL AI CALL =================
async function callOpenRouter(prompt: string): Promise<string> {
  if (!USE_REAL_AI || !OPENROUTER_KEY) {
    throw new Error('Real AI not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://demo-axonovia.vercel.app/', //change to LocalHost if want to test the app locally, use: ''http://localhost:3000
      'X-Title': 'Vigilo Mini Prototype'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 250
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// ================= MOCK FALLBACKS =================
export function generateAlerteMock(result: ResultatRapprochement): string {
  const { client, montantAttendu, montantDetecte, ecart, typeEcart, reference } = result
  if (typeEcart === 'ok') return `Dossier ${client} conforme.`
  if (typeEcart === 'montant') {
    const direction = ecart > 0 ? 'surfacturation' : 'sous-facturation'
    return `Écart détecté sur ${client} : ${direction} de ${Math.abs(ecart)}€ (attendu ${montantAttendu}€, reçu ${montantDetecte}€). Litige recommandé.`
  }
  if (typeEcart === 'reference_manquante') {
    return `Référence ${reference} absente de la préfacture. Vérification manuelle requise.`
  }
  if (typeEcart === 'ligne_supplementaire') {
    return `Ligne supplémentaire détectée (${client}, ${montantDetecte}€) — non attendue dans le proforma.`
  }
  return `Anomalie non classifiée sur ${client}.`
}

export function generateResumeMock(dossier: Partial<DossierLitige>): string {
  return `Analyse complète : ${dossier.totalDossiers} dossiers traités, ${dossier.totalEcarts} écarts détectés. Montant récupérable estimé : ${dossier.montantRecuperable}€. ${dossier.totalEcarts} dossiers de litige prêts pour validation métier.`
}

// ================= MAIN EXPORTS (HYBRID + ASYNC) =================
export async function generateAlerte(result: ResultatRapprochement): Promise<string> {
  if (USE_REAL_AI && OPENROUTER_KEY) {
    try {
      const prompt = `Tu es un expert en contrôle de facturation transport.
Génère une alerte concise et professionnelle en français pour ce résultat:
- Référence: ${result.reference} | Client: ${result.client}
- Attendu: ${result.montantAttendu}€ | Détecté: ${result.montantDetecte}€
- Écart: ${result.ecart}€ | Type: ${result.typeEcart}
Règles: Si écart=0 "Conforme". Si écart montant: mentionner surfacturation/sous-facturation. Si ref manquante: "absente de la préfacture". Si ligne supp: "non attendue".
Ton professionnel, phrase unique.`

      const aiResponse = await callOpenRouter(prompt)
      if (aiResponse) {
        console.info(`✨ AI Response received for ${result.reference}: "${aiResponse}"`)
        return aiResponse
      }
    } catch (err) {
      console.warn(`⚠️ AI Alerte failed, falling back to mock:`, err instanceof Error ? err.message : err)
    }
  }

  // Fallback to mock if AI is disabled, missing key, or failed
  return generateAlerteMock(result)
}

export async function generateResume(dossier: Partial<DossierLitige>): Promise<string> {
  if (USE_REAL_AI && OPENROUTER_KEY) {
    try {
      const prompt = `Résume cette analyse transport en une phrase professionnelle:
- Dossiers: ${dossier.totalDossiers} | Écarts: ${dossier.totalEcarts}
- Récupérable: ${dossier.montantRecuperable}€
Format strict: "Analyse complète : ${dossier.totalDossiers} dossiers traités, ${dossier.totalEcarts} écarts détectés. Montant récupérable estimé : ${dossier.montantRecuperable}€. ${dossier.totalEcarts} dossiers de litige prêts pour validation métier."`

      const aiResponse = await callOpenRouter(prompt)
      if (aiResponse) return aiResponse
    } catch (err) {
      console.warn(`⚠️ AI Resume failed, falling back to mock:`, err instanceof Error ? err.message : err)
    }
  }

  // Fallback to mock if AI is disabled, missing key, or failed
  return generateResumeMock(dossier)
}
