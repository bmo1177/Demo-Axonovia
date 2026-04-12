'use client'
import { PipelineStep } from '@/types'
import { clsx } from 'clsx'

interface Props { steps: PipelineStep[] }

export function PipelineStatus({ steps }: Props) {
  return (
    <div className="flex items-center w-full overflow-x-auto pb-4 gap-0">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center group">
          <div className="flex flex-col items-start gap-2 min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className={clsx(
                'relative w-3 h-3 rounded-full border-2 transition-all duration-500',
                s.status === 'done' ? 'bg-emerald-500 border-emerald-200' :
                s.status === 'running' ? 'bg-amber-400 border-amber-100' :
                'bg-white border-slate-200'
              )}>
                {s.status === 'running' && (
                  <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
                )}
              </div>
              <span className={clsx(
                'text-[10px] uppercase font-bold tracking-widest transition-colors duration-300',
                s.status === 'done' ? 'text-emerald-700' :
                s.status === 'running' ? 'text-slate-900' :
                'text-slate-300'
              )}>
                {s.label}
              </span>
            </div>
            {s.detail && (
              <span className="text-[9px] font-mono text-slate-400 ml-6 truncate max-w-[120px]">
                {s.detail}
              </span>
            )}
          </div>
          
          {i < steps.length - 1 && (
            <div className={clsx(
              'h-[1px] w-12 mx-4 transition-colors duration-500',
              s.status === 'done' ? 'bg-emerald-200' : 'bg-slate-100'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}