import { useNavigate } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { formatPriceCOP, copToUsd, formatPriceUSD } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { quotesService } from '../services/quotes.service'
import { DeleteQuoteDialog } from './DeleteQuoteDialog'

export function QuoteList() {
  const navigate = useNavigate()
  const { quotes, loading, error, refresh } = useQuotes()
  
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const selectedQuote = quotes.find(q => q.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return
    await quotesService.delete(deleteId)
    refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading quotes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Button onClick={() => navigate('/quotes/new')}>
          New Quote
        </Button>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No quotes yet</p>
              <Button onClick={() => navigate('/quotes/new')}>
                Create your first quote
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/quotes/${quote.id}`)}
                  >
                    <TableCell>{quote.patient_name}</TableCell>
                    <TableCell className="text-right">
                      <span>{formatPriceCOP(quote.total)}</span>
                      {quote.exchange_rate && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({formatPriceUSD(copToUsd(quote.total, quote.exchange_rate))})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(quote.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <DeleteQuoteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        patientName={selectedQuote?.patient_name || ''}
      />
    </div>
  )
}
