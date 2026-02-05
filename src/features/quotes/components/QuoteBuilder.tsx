import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePriceItems } from '@/features/price-items/hooks/usePriceItems'
import { GROUP_LABELS } from '@/features/price-items/types'
import { formatPriceCOP, copToUsd, formatPriceUSD } from '@/lib/utils'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { useQuoteMutations } from '../hooks/useQuoteMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PriceItem } from '@/features/price-items/types'
import type { CreateQuoteItemInput } from '../types'

const DEFAULT_EXCHANGE_RATE = 3500

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
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE)
  const [operationalProfit, setOperationalProfit] = useState(0)
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

  const handleUpdatePrice = (priceItemId: string, price: number) => {
    if (price < 0) return
    setSelectedItems(selectedItems.map(item =>
      item.price_item_id === priceItemId
        ? { ...item, price_snapshot: price }
        : item
    ))
  }

  const calculateTotalEgresos = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price_snapshot * item.quantity), 0)
  }

  const calculateTotal = () => {
    return calculateTotalEgresos() + operationalProfit
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedItems.length === 0) {
      setError('Agrega al menos un servicio a la cotización')
      return
    }

    try {
      await createQuote({
        patient_name: patientName,
        notes: notes || undefined,
        items: selectedItems.map(({ name, ...item }) => item),
        operational_profit: operationalProfit,
        exchange_rate: exchangeRate,
      })
      navigate('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cotización')
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
        <h1 className="text-2xl font-bold">Nueva cotización</h1>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>
          Cancelar
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
            <h2 className="text-lg font-semibold">Información del paciente</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Nombre del paciente</Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange-rate">Tasa de cambio (COP/USD)</Label>
                <Input
                  id="exchange-rate"
                  type="number"
                  min={1}
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || DEFAULT_EXCHANGE_RATE)}
                  placeholder="3500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notas adicionales..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Items seleccionados</h2>
            <p className="text-sm text-muted-foreground">Puedes modificar el precio de cada servicio según lo acordado</p>
          </CardHeader>
          <CardContent>
            {selectedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay items seleccionados</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div key={item.price_item_id} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-[140px]">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min={0}
                          step={1000}
                          value={item.price_snapshot}
                          onChange={(e) => handleUpdatePrice(item.price_item_id, parseFloat(e.target.value) || 0)}
                          className="w-28 h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">COP c/u</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.price_item_id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center h-8"
                      />
                      <div className="text-right w-32">
                        <p className="font-semibold">{formatPriceCOP(item.price_snapshot * item.quantity)}</p>
                        <p className="text-xs text-muted-foreground">{formatPriceUSD(copToUsd(item.price_snapshot * item.quantity, exchangeRate))}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.price_item_id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total egresos</span>
                    <PriceDisplay cop={calculateTotalEgresos()} exchangeRate={exchangeRate} />
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="ganancia" className="text-sm font-medium">Ganancia operacional</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="ganancia"
                        type="number"
                        min={0}
                        step={1000}
                        value={operationalProfit || ''}
                        onChange={(e) => setOperationalProfit(parseFloat(e.target.value) || 0)}
                        className="w-32 h-9"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">COP</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-lg font-semibold">Total cotización</p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatPriceCOP(calculateTotal())}</p>
                      <p className="text-xs text-muted-foreground">{formatPriceUSD(copToUsd(calculateTotal(), exchangeRate))}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Agregar servicios</h2>
            <p className="text-sm text-muted-foreground">Precios del catálogo (puedes modificarlos al agregar)</p>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <p className="text-muted-foreground text-center py-4">Loading items...</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([groupType, items]) => (
                  <div key={groupType}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      {GROUP_LABELS[groupType as keyof typeof GROUP_LABELS] || groupType}
                    </h3>
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
                          <span className="text-muted-foreground text-sm">
                            {formatPriceCOP(item.price)}
                            <span className="ml-1 text-xs opacity-80">({formatPriceUSD(copToUsd(item.price, exchangeRate))})</span>
                          </span>
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
          {creating ? 'Creando...' : 'Crear cotización'}
        </Button>
      </form>
    </div>
  )
}
