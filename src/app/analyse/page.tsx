// app/analyse/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { DossierLitige, PipelineStep } from '@/types'
import { runPipeline } from '@/lib/pipeline'
import { PipelineStatus } from '@/components/PipelineStatus'
import { ResultsTable } from '@/components/ResultsTable'
import { LitigeCard } from '@/components/LitigeCard'
import { generatePDF } from '@/lib/pdfExport'

export default function AnalysePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dossier, setDossier] = useState<DossierLitige | null>(null)
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'normalize', label: 'Normalisation', status: 'pending' },
    { id: 'match', label: 'Rapprochement', status: 'pending' },
    { id: 'detect', label: 'Détection', status: 'pending' },
    { id: 'generate', label: 'Dossier prêt', status: 'pending' }
  ])

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        let raw = sessionStorage.getItem('vigilo_parsed')

        if (!raw) {
          const [p1Res, p2Res] = await Promise.all([
            fetch('/samples/prefacture_sample.csv'),
            fetch('/samples/proforma_sample.csv')
          ])

          if (!p1Res.ok || !p2Res.ok) throw new Error('Failed to load sample CSV files')

          const [p1Text, p2Text] = await Promise.all([p1Res.text(), p2Res.text()])
          const Papa = (await import('papaparse')).default

          const prefacture = Papa.parse(p1Text, { header: true, skipEmptyLines: true, dynamicTyping: true }).data
          const proforma = Papa.parse(p2Text, { header: true, skipEmptyLines: true, dynamicTyping: true }).data

          raw = JSON.stringify({ prefacture, proforma })
        }

        const { prefacture, proforma } = JSON.parse(raw)
        const result = await runPipeline(prefacture, proforma, (step) => {
          setSteps(prev => prev.map(s => s.id === step.id ? step : s))
        })

        setDossier(result)
      } catch (err) {
        console.error('❌ Analysis error:', err)
        alert('Erreur: ' + (err instanceof Error ? err.message : 'Unknown error'))
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    runAnalysis()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center text-slate-500 font-mono">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="tracking-widest uppercase text-[10px] font-bold text-slate-400">Initialisation du pipeline IA...</p>
      </div>
    )
  }

  if (!dossier) return null

  const ecarts = dossier.resultats.filter(r => r.typeEcart !== 'ok')
  const fmt = (n: number) => `${Math.abs(n).toLocaleString('fr-FR')} €`

  return (
    <>
      <main className="min-h-screen bg-mesh p-4 md:p-10">
        <div className="max-w-6xl mx-auto">

          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de Bord <span className="text-slate-400 font-light">Vigilo</span></h1>
                {process.env.NEXT_PUBLIC_AI_MODE_ENABLED === 'true' && (
                  <div className="relative flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-emerald-100 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">MOTEUR DE RACCORCHEMENT ACTIF</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-sm">Rapprochement transport automatisé — ID: {dossier.id}</p>
            </div>

            <button
              onClick={() => generatePDF(dossier)}
              className="secondary-cta shadow-sm hover:shadow-md h-fit whitespace-nowrap"
            >
              Exporter en PDF
            </button>
          </div>

          <section className="mb-12">
            <PipelineStatus steps={steps} />
          </section>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
            {[
              { label: 'Lignes analysées', value: dossier.totalDossiers, color: 'slate' },
              { label: 'Écarts détectés', value: dossier.totalEcarts, color: 'amber' },
              { label: 'Montant récupérable', value: fmt(dossier.montantRecuperable), color: 'emerald' },
              { label: 'Litiges prioritaires', value: ecarts.filter(e => e.statut === 'prioritaire').length, color: 'purple' }
            ].map((kpi, i) => (
              <div key={i} className="glass-card p-6 border-l-4 border-l-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* AI Synthesis Section - Light Box style */}
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="glass-panel p-8 md:p-10 border-none bg-white/70 backdrop-blur-xl text-slate-800 relative overflow-hidden shadow-2xl shadow-slate-200/50 border border-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-3xl -ml-20 -mb-20" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Synthèse Recherche IA
                  </div>
                </div>
                
                <div className="markdown-content max-w-none text-slate-600 leading-relaxed font-semibold text-lg
                              [&_strong]:text-slate-900 [&_strong]:font-black
                              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2
                              [&_p]:mb-0">
                  <ReactMarkdown>{dossier.resume}</ReactMarkdown>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sections */}
          <div className="space-y-16 pb-20">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-mono text-xs">01</div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight text-gradient">Audit de rapprochement</h2>
              </div>
              <div className="glass-panel overflow-hidden border-none shadow-glass-light">
                <ResultsTable results={dossier.resultats} />
              </div>
            </section>

            {ecarts.length > 0 && (
              <section animate-in="fade">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-mono text-xs">02</div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight text-gradient">Litiges assistés par IA</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ecarts.map(e => <LitigeCard key={e.reference} result={e} />)}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      {/* Simplified Footer */}
      <footer className="py-16 px-6 border-t border-slate-100 bg-white/30 backdrop-blur-sm relative z-10">
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
    </>
  )
}