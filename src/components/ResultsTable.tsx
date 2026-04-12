'use client'
import { ResultatRapprochement } from '@/types'
import { clsx } from 'clsx'

interface Props { results: ResultatRapprochement[] }

export function ResultsTable({ results }: Props) {
  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
          <tr className="border-b border-slate-200">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Référence</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Attendu</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Détecté</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Écart</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/50">
          {results.map(r => (
            <tr key={r.reference} className={clsx(
              'group transition-colors duration-200',
              r.statut === 'prioritaire' ? 'bg-red-50/20 hover:bg-red-50/40' : 
              r.statut === 'a_verifier' ? 'bg-amber-50/20 hover:bg-amber-50/40' : 
              'hover:bg-slate-50/50'
            )}>
              <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600 tracking-tight">{r.reference}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-800">{r.client}</td>
              <td className="px-6 py-4 text-right font-mono text-sm text-slate-500">{fmt(r.montantAttendu)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm text-slate-500">{fmt(r.montantDetecte)}</td>
              <td className={clsx('px-6 py-4 text-right font-mono text-sm font-bold',
                r.ecart > 0 ? 'text-red-500' : r.ecart < 0 ? 'text-blue-500' : 'text-emerald-500'
              )}>
                {r.ecart > 0 ? '+' : ''}{fmt(r.ecart)}
              </td>
              <td className="px-6 py-4">
                <div className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  r.statut === 'valide' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  r.statut === 'a_verifier' && 'bg-amber-50 text-amber-600 border-amber-100',
                  r.statut === 'prioritaire' && 'bg-red-50 text-red-600 border-red-100'
                )}>
                  <div className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    r.statut === 'valide' && 'bg-emerald-500',
                    r.statut === 'a_verifier' && 'bg-amber-500',
                    r.statut === 'prioritaire' && 'bg-red-500'
                  )} />
                  {r.statut === 'valide' ? 'Conforme' : r.statut === 'a_verifier' ? 'Vérification' : 'Prioritaire'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}