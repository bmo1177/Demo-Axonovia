// src/app/api/parse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const keys = Array.from(formData.keys())
    console.log('📡 Received POST to /api/parse. Keys:', keys)

    const prefacture = formData.get('prefacture') as File
    const proforma = formData.get('proforma') as File

    if (!prefacture || !proforma) {
      console.warn('⚠️ Missing files in formData. Found:', keys)
      return NextResponse.json({ 
        error: 'Deux fichiers requis', 
        received_keys: keys 
      }, { status: 400 })
    }

    const parseCSV = async (file: File) => {
      const text = await file.text()
      console.log(`📄 Parsing ${file.name}:`, text.substring(0, 200))
      
      const result = Papa.parse(text, { 
        header: true, 
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.toLowerCase().trim()
      })
      
      console.log(`✅ Parsed ${result.data.length} rows from ${file.name}`)
      console.log('Sample row:', result.data[0])
      
      return result.data
    }

    const [pref, prof] = await Promise.all([
      parseCSV(prefacture),
      parseCSV(proforma)
    ])

    return NextResponse.json({ prefacture: pref, proforma: prof })
  } catch (error) {
    console.error('❌ Parse error:', error)
    return NextResponse.json(
      { error: 'Échec du parsing CSV', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}