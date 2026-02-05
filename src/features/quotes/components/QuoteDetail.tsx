import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quotesService } from '../services/quotes.service'
import { formatPriceCOP, copToUsd, formatPriceUSD } from '@/lib/utils'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileDown, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DeleteQuoteDialog } from './DeleteQuoteDialog'
import type { QuoteWithItems } from '../types'

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<QuoteWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      loadQuote(id)
    }
  }, [id])

  const handleExportPDF = () => {
    if (!quote) return

    const doc = new jsPDF()
    const exchangeRate = quote.exchange_rate ?? 3500

    // Header
    doc.setFontSize(22)
    doc.setTextColor(40, 40, 40)
    doc.text('Cotización de Servicios Dentales', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Fecha: ${new Date(quote.created_at).toLocaleDateString()}`, 14, 30)
    doc.text(`ID: ${quote.id.slice(0, 8)}`, 14, 35)

    // Patient Info card-like section
    doc.setDrawColor(230, 230, 230)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(14, 42, 182, 30, 2, 2, 'FD')
    
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text('Información del Paciente', 20, 50)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nombre: ${quote.patient_name}`, 20, 58)
    if (quote.notes) {
      doc.text(`Notas: ${quote.notes}`, 20, 65)
    }

    // Items Table
    const tableData = quote.items.map(item => [
      item.price_item.name,
      formatPriceCOP(item.price_snapshot),
      item.quantity,
      formatPriceCOP(item.subtotal),
      formatPriceUSD(copToUsd(item.subtotal, exchangeRate))
    ])

    autoTable(doc, {
      startY: 78,
      head: [['Servicio', 'Precio Unit.', 'Cant.', 'Subtotal (COP)', 'Subtotal (USD)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    })

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const itemsTotal = quote.items.reduce((s, i) => s + i.subtotal, 0)
    
    doc.text('Total egresos:', 130, finalY)
    doc.text(formatPriceCOP(itemsTotal), 196, finalY, { align: 'right' })
    
    if (quote.operational_profit) {
      doc.text('Ganancia operacional:', 130, finalY + 7)
      doc.text(formatPriceCOP(quote.operational_profit), 196, finalY + 7, { align: 'right' })
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Total Cotización:', 130, finalY + 18)
    doc.text(formatPriceCOP(quote.total), 196, finalY + 18, { align: 'right' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Tipo de cambio: 1 USD = ${exchangeRate} COP`, 14, finalY + 30)
    doc.text(`Valor Total USD: ${formatPriceUSD(copToUsd(quote.total, exchangeRate))}`, 14, finalY + 35)

    doc.save(`cotizacion_${quote.patient_name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
  }

  const handleDelete = async () => {
    if (!quote) return
    await quotesService.delete(quote.id)
    navigate('/quotes')
  }

  const loadQuote = async (quoteId: string) => {
    try {
      setLoading(true)

      const data = await quotesService.getById(quoteId)
      setQuote(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load quote'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error?.message || 'Quote not found'}</AlertDescription>
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>
          Back to Quotes
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resumen de Cotización</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden md:flex" onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-destructive hidden md:flex" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <Button variant="secondary" onClick={() => navigate('/quotes')}>
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Patient Information</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Patient Name</dt>
              <dd className="mt-1 text-sm">{quote.patient_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date</dt>
              <dd className="mt-1 text-sm">
                {new Date(quote.created_at).toLocaleDateString()}
              </dd>
            </div>
            {quote.notes && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="mt-1 text-sm">{quote.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Items</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quote.items.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.price_item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPriceCOP(item.price_snapshot)} × {item.quantity}
                    <span className="ml-1.5 text-xs opacity-80">({formatPriceUSD(copToUsd(item.subtotal, quote.exchange_rate ?? 3500))})</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPriceCOP(item.subtotal)}</p>
                  <p className="text-xs text-muted-foreground">{formatPriceUSD(copToUsd(item.subtotal, quote.exchange_rate ?? 3500))}</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4 space-y-2">
              {quote.operational_profit != null && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total egresos</span>
                    <PriceDisplay cop={quote.items.reduce((s, i) => s + i.subtotal, 0)} exchangeRate={quote.exchange_rate ?? 3500} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ganancia operacional</span>
                    <PriceDisplay cop={quote.operational_profit} exchangeRate={quote.exchange_rate ?? 3500} />
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-lg font-semibold">Total cotización</p>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{formatPriceCOP(quote.total)}</p>
                  <p className="text-xs text-muted-foreground">{formatPriceUSD(copToUsd(quote.total, quote.exchange_rate ?? 3500))}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:hidden grid grid-cols-2 gap-3 pt-4">
        <Button variant="outline" className="w-full" onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button variant="destructive" className="w-full" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <DeleteQuoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        patientName={quote.patient_name}
      />
    </div>
  )
}
