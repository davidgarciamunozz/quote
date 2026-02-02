import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quotesService } from '../services/quotes.service'
import { isSupabaseConfigured } from '@/lib/env'
import { MOCK_QUOTE_DETAILS } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { QuoteWithItems } from '../types'

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<QuoteWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (id) {
      loadQuote(id)
    }
  }, [id])

  const loadQuote = async (quoteId: string) => {
    try {
      setLoading(true)

      if (!isSupabaseConfigured()) {
        const mockQuote = MOCK_QUOTE_DETAILS[quoteId]
        if (mockQuote) {
          setQuote(mockQuote)
        } else {
          setError(new Error('Quote not found (Mock Data)'))
        }
        setLoading(false)
        return
      }

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
        <h1 className="text-2xl font-bold">Quote Details</h1>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>
          Back
        </Button>
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
                    ${item.price_snapshot.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-2xl font-bold text-primary">
                  ${quote.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
