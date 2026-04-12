// app/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { UploadZone } from '@/components/UploadZone'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [prefFile, setPrefFile] = useState<File | null>(null)
  const [profFile, setProfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const router = useRouter()

  const loadSampleData = useCallback(() => {
    // Prefacture
    fetch('/samples/prefacture_sample.csv')
      .then(res => res.blob())
      .then(blob => {
        setPrefFile(new File([blob], 'prefacture_sample.csv', { type: 'text/csv' }))
      })

    // Proforma
    fetch('/samples/proforma_sample.csv')
      .then(res => res.blob())
      .then(blob => {
        setProfFile(new File([blob], 'proforma_sample.csv', { type: 'text/csv' }))
      })
  }, [])

  useEffect(() => {
    loadSampleData()
  }, [loadSampleData])

  const handleAnalyse = async () => {
    if (!prefFile || !profFile) return
    setLoading(true)

    console.info('🚀 Starting manual analysis...', {
      prefacture: prefFile?.name,
      proforma: profFile?.name,
      prefSize: prefFile?.size,
      profSize: profFile?.size
    })

    try {
      const fd = new FormData()
      fd.append('prefacture', prefFile)
      fd.append('proforma', profFile)

      console.info('📤 Sending FormData to /api/parse...')
      const res = await fetch('/api/parse', { method: 'POST', body: fd })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('❌ API Parse Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Server error')
      }

      const data = await res.json()
      console.info('✅ Data parsed successfully:', {
        prefRows: data.prefacture?.length,
        profRows: data.proforma?.length
      })

      sessionStorage.setItem('vigilo_parsed', JSON.stringify(data))
      router.push('/analyse')
    } catch (err) {
      console.error('❌ Erreur analyse pipeline:', err)
      alert(`Erreur lors de l'analyse: ${err instanceof Error ? err.message : 'Inconnue'}. Vérifiez la console F12.`)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoDemo = async () => {
    setAutoLoading(true)
    try {
      // Small delay for visual feedback
      await new Promise(r => setTimeout(r, 800))

      const [p1, p2] = await Promise.all([
        fetch('/samples/prefacture_sample.csv').then(r => r.blob()),
        fetch('/samples/proforma_sample.csv').then(r => r.blob())
      ])

      const fd = new FormData()
      fd.append('prefacture', new File([p1], 'prefacture_sample.csv'))
      fd.append('proforma', new File([p2], 'proforma_sample.csv'))

      const res = await fetch('/api/parse', { method: 'POST', body: fd })
      const data = await res.json()

      sessionStorage.setItem('vigilo_parsed', JSON.stringify(data))
      router.push('/analyse')
    } catch (err) {
      console.error('Auto-demo error:', err)
      router.push('/analyse') // Fallback to client-side parse in AnalysePage
    } finally {
      setAutoLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-mesh">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100/50 text-slate-500 text-[10px] font-bold mb-8 tracking-[0.2em] uppercase shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            Control Pipeline v1.2
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-4 tracking-tighter leading-none">
            VIGILO <span className="text-slate-300 font-light italic">AUDIT</span>
          </h1>
          <p className="text-sm font-bold text-amber-600 mb-8 tracking-wide">
            Candidature : Ingénieur IA / Full-Stack AI Native @ Axonovia<br />
            <span className="text-slate-400 font-medium">Prototype par Belalia Mohamed Oussama</span>
          </p>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
            Le standard architectural pour l&apos;audit logistique automatisé.
            Détection proactive des variations de facturation via <span className="text-slate-900 underline decoration-purple-500 underline-offset-4">Détection proactive des variations de facturation via IA - modèle : Nvidia Nemotron (OpenRouter)</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full sm:w-auto">
            <button
              onClick={handleAutoDemo}
              disabled={autoLoading}
              className="primary-cta w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {autoLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  Lancer la démo
                  <span className="opacity-50 font-light group-hover:translate-x-1 transition-transform">──→</span>
                </>
              )}
            </button>
            <a href="#upload" className="secondary-cta w-full sm:w-auto">
              Importer des flux
            </a>
          </div>

          <div className="w-px h-20 bg-gradient-to-b from-slate-200 to-transparent" />
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel p-8 md:p-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <UploadZone
                label="Préfacture (document chargeur)"
                subtitle="PDF ou CSV"
                side="left"
                acceptedFile={prefFile}
                onFileSelect={setPrefFile}
              />
              <UploadZone
                label="Proforma (référence interne)"
                subtitle="PDF ou CSV"
                side="right"
                acceptedFile={profFile}
                onFileSelect={setProfFile}
              />
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleAnalyse}
                disabled={!prefFile || !profFile || loading}
                className={`px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl 
                          ${!prefFile || !profFile || loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-2xl hover:scale-[1.02] cursor-pointer'}`}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement intelligent...
                  </span>
                ) : (
                  'Lancer l\'analyse Vigilo'
                )}
              </button>

              <div className="text-center space-y-2">
                {!prefFile || !profFile ? (
                  <p className="text-sm text-slate-400 italic">
                    Veuillez sélectionner les deux documents pour débloquer l'analyse.
                  </p>
                ) : null}
                <p className="text-[10px] text-slate-400 max-w-lg mx-auto leading-relaxed border-t border-slate-100 pt-4 mt-4">
                  Ce prototype illustre les étapes 1 à 4 du workflow Vigilo. La navigation portail autonome (partie propriétaire Axonovia) n'est pas reproduite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="py-16 px-6 border-t border-slate-100 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="space-y-4">
            <div className="font-bold text-slate-900 tracking-tighter text-lg underline decoration-amber-500 decoration-2 underline-offset-4">
              AXONOVIA <span className="text-slate-400 font-normal">LABS</span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide leading-relaxed">
              VIGILO-MINI-DEPLOY-V1.2<br />
              BUILD: 2026.04.12.A // STACK: NEXT.JS 15
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status Intelligence</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs text-slate-600 font-medium">
                Moteur déterministe par défaut • Couche LLM optionnelle (OpenRouter/Nvidia)
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="flex items-center gap-6">
              <a href="https://github.com/bmo1177" target="_blank" rel="noopener"
                className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Github
              </a>
            </div>
            <p className="text-xs text-slate-300 font-mono">© 2026 AXONOVIA AUTOMATION</p>
          </div>
        </div>
      </footer>
    </main>
  )
}