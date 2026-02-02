import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePriceItems } from '@/features/price-items/hooks/usePriceItems'
import { useQuoteMutations } from '../hooks/useQuoteMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PriceItem } from '@/features/price-items/types'
import type { CreateQuoteItemInput } from '../types'

interface SelectedItem extends CreateQuoteItemInput {
  name: string
}

export function QuoteBuilder() {
  const navigate = useNavigate()
  const { priceItems, loading: loadingItems } = usePriceItems()
  const { createQuote, loading: creating } = useQuoteMutations()
  
  const [patientName, setPatientName] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleAddItem = (priceItem: PriceItem) => {
    const existing = selectedItems.find(item => item.price_item_id === priceItem.id)
    
    if (existing) {
      setSelectedItems(selectedItems.map(item =>
        item.price_item_id === priceItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setSelectedItems([...selectedItems, {
        price_item_id: priceItem.id,
        price_snapshot: priceItem.price,
        quantity: 1,
        name: priceItem.name,
      }])
    }
  }

  const handleRemoveItem = (priceItemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.price_item_id !== priceItemId))
  }

  const handleUpdateQuantity = (priceItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(priceItemId)
      return
    }
    
    setSelectedItems(selectedItems.map(item =>
      item.price_item_id === priceItemId
        ? { ...item, quantity }
        : item
    ))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price_snapshot * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedItems.length === 0) {
      setError('Please add at least one item to the quote')
      return
    }

    try {
      await createQuote({
        patient_name: patientName,
        notes: notes || undefined,
        items: selectedItems.map(({ name, ...item }) => item),
      })
      navigate('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote')
    }
  }

  const groupedItems = priceItems.reduce((acc, item) => {
    if (!acc[item.group_type]) {
      acc[item.group_type] = []
    }
    acc[item.group_type].push(item)
    return acc
  }, {} as Record<string, PriceItem[]>)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Quote</h1>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>
          Cancel
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Patient Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name</Label>
              <Input
                id="patient-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                placeholder="Enter patient name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Selected Items</h2>
          </CardHeader>
          <CardContent>
            {selectedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No items selected</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div key={item.price_item_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price_snapshot.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.price_item_id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <p className="font-semibold w-20 text-right">
                        ${(item.price_snapshot * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.price_item_id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Add Items</h2>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <p className="text-muted-foreground text-center py-4">Loading items...</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([groupType, items]) => (
                  <div key={groupType}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 capitalize">{groupType}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map(item => (
                        <Button
                          key={item.id}
                          type="button"
                          variant="outline"
                          className="flex justify-between items-center h-auto py-3 px-4 text-left font-normal"
                          onClick={() => handleAddItem(item)}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={creating} className="w-full">
          {creating ? 'Creating...' : 'Create Quote'}
        </Button>
      </form>
    </div>
  )
}
