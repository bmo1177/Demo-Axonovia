// src/app/api/analyse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { runPipeline } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  try {
    const { prefacture, proforma } = await req.json()
    
    // For demo: simulate file objects from parsed data
    // In real flow, files would be re-uploaded or cached
    const dossier = await runPipeline(prefacture, proforma)
    
    return NextResponse.json(dossier)
  } catch (error) {
    console.error('Analyse error:', error)
    return NextResponse.json({ error: 'Échec de l\'analyse' }, { status: 500 })
  }
}