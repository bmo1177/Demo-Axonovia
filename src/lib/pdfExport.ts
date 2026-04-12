import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DossierLitige } from '@/types'

export function generatePDF(dossier: DossierLitige) {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text('DOSSIER DE LITIGE — Vigilo Mini', 14, 20)
  
  doc.setFontSize(10)
  doc.text(`Date : ${dossier.dateGeneration} | Transporteur : ${dossier.transporteur}`, 14, 28)
  doc.text(`Généré par : Agent de rapprochement automatique`, 14, 33)
  
  doc.setFontSize(14)
  doc.text('RÉSUMÉ EXÉCUTIF', 14, 42)
  doc.setFontSize(10)
  const splitSummary = doc.splitTextToSize(dossier.resume, 180)
  doc.text(splitSummary, 14, 48)
  
  const rows = dossier.resultats
    .filter(r => r.typeEcart !== 'ok')
    .map(r => [
      r.reference,
      r.client,
      `${r.montantAttendu} €`,
      `${r.montantDetecte} €`,
      `${r.ecart > 0 ? '+' : ''}${r.ecart} €`,
      r.statut === 'prioritaire' ? 'PRIORITAIRE' : 'À VÉRIFIER'
    ])

  autoTable(doc, {
    startY: 70,
    head: [['Réf', 'Client', 'Attendu', 'Détecté', 'Écart', 'Statut']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 25 },
      4: { halign: 'right', fontStyle: 'bold' }
    }
  })

  // Add RECOMMANDATION section
  const finalY = (doc as any).lastAutoTable.finalY || 70
  doc.setFontSize(12)
  doc.text('RECOMMANDATION', 14, finalY + 10)
  doc.setFontSize(10)
  
  const recs = dossier.resultats
    .filter(r => r.typeEcart !== 'ok')
    .map(r => `• ${r.reference} : ${r.statut === 'prioritaire' ? 'Ouvrir litige immédiat' : 'Vérification manuelle requise'}`)
  
  if (recs.length > 0) {
    doc.text(recs.join('\n'), 14, finalY + 16)
  } else {
    doc.text('Aucune action requise. Tous les flux sont conformes.', 14, finalY + 16)
  }

  // Candidate footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Prototype développé par Belalia Mohamed Oussama | github.com/bmo1177', 14, doc.internal.pageSize.height - 10)
  
  doc.save(`Vigilo_Litige_${dossier.id}.pdf`)
}