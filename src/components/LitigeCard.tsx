import ReactMarkdown from 'react-markdown'
import { ResultatRapprochement } from '@/types'

interface Props { result: ResultatRapprochement }

export function LitigeCard({ result }: Props) {
  const fmt = (n: number) => `${Math.abs(n).toLocaleString('fr-FR')} €`
  return (
    <div className="glass-card p-6 flex flex-col h-full border-l-4 border-l-amber-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dossier de litige</span>
          <span className="font-mono text-xl font-bold text-slate-800 tracking-tight">{result.reference}</span>
        </div>
        <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
          result.statut === 'prioritaire' 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {result.statut === 'prioritaire' ? 'Priorité Haute' : 'À vérifier'}
        </span>
      </div>
      
      <p className="text-sm font-semibold text-slate-700 mb-6">{result.client}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Attendu</p>
          <p className="font-bold text-slate-700">{fmt(result.montantAttendu)}</p>
        </div>
        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Détecté</p>
          <p className="font-bold text-slate-700">{fmt(result.montantDetecte)}</p>
        </div>
      </div>

      <div className="mt-auto relative p-4 rounded-xl bg-slate-900 text-slate-100 text-sm leading-relaxed overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-4xl select-none">AI</div>
        <div className="relative z-10 font-medium italic prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>
            {result.alerte}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}