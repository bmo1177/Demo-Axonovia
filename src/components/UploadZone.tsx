// components/UploadZone.tsx
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { clsx } from 'clsx'

interface Props {
  label: string
  subtitle?: string
  acceptedFile: File | null
  onFileSelect: (file: File) => void
  side: 'left' | 'right'
}

export function UploadZone({ label, subtitle, acceptedFile, onFileSelect, side }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      console.log(`📁 File selected in UploadZone (${side}):`, {
        name: files[0].name,
        type: files[0].type,
        size: files[0].size
      })
      onFileSelect(files[0])
    }
  }, [onFileSelect, side])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'text/csv': ['.csv', '.CSV'], 
      'application/csv': ['.csv', '.CSV'],
      'application/pdf': ['.pdf', '.PDF'],
      'text/plain': ['.csv', '.CSV']
    },
    maxFiles: 1,
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'flex-1 glass-card p-10 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed',
        'hover:border-slate-300 hover:shadow-2xl hover:scale-[1.01]',
        isDragActive ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200',
        acceptedFile ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'
      )}
    >
      <input {...getInputProps()} />
      
      {acceptedFile ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-bold text-slate-900 tracking-tight">{acceptedFile.name}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">
            {(acceptedFile.size / 1024).toFixed(1)} Ko // PRÊT
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-6 group-hover:text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1">{label}</p>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium mb-4">{subtitle}</p>
          )}
          <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-tighter">
            Parcourir les fichiers
          </div>
        </div>
      )}
    </div>
  )
}