import { LigneTarif } from '@/types'

export function normalizeData(data: Record<string, any>[]): LigneTarif[] {
  console.log('🔧 Normalizing data:', data.length, 'rows')
  
  return data.map((row: Record<string, any>, idx: number) => {
    // Try multiple possible field names
    const ref = (row.reference || row.REF || row.Reference || `UNKN-${idx}`).toString().trim().toUpperCase()
    const client = (row.client || row.CHARGEUR || row.Client || 'Inconnu').toString().trim()
    const desc = (row.description || row.DESIGNATION || row.Description || '').toString().trim()
    
    // Try multiple possible amount field names
    const montantRaw = row.montant || row.MONTANT || row.montant || row.amount || row.Amount || row.total || row.TOTAL || 0
    const montantStr = montantRaw.toString().replace(/[^\d.,-]/g, '').replace(',', '.')
    const montant = parseFloat(montantStr) || 0
    
    const date = row.date || row.DATE || row.Date || new Date().toISOString().split('T')[0]

    console.log(`  Row ${idx}: ref=${ref}, montant=${montant} (from ${montantRaw})`)

    return { 
      reference: ref, 
      client, 
      description: desc, 
      montant, 
      date: date.toString(),
      source: 'prefacture' as const
    }
  }).filter(item => item.reference && !item.reference.startsWith('UNKN'))
}