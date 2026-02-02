import { useState } from 'react'
import { usePriceItemMutations } from '../hooks/usePriceItemMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PriceItem } from '../types'

interface PriceItemFormProps {
  item?: PriceItem
  onSuccess?: () => void
  onCancel?: () => void
}

export function PriceItemForm({ item, onSuccess, onCancel }: PriceItemFormProps) {
  const { createPriceItem, updatePriceItem, loading } = usePriceItemMutations()
  const [name, setName] = useState(item?.name || '')
  const [price, setPrice] = useState(item?.price.toString() || '')
  const [groupType, setGroupType] = useState<string>(item?.group_type || 'clinic')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum <= 0) {
        setError('Please enter a valid price')
        return
      }

      if (item) {
        await updatePriceItem(item.id, { name, price: priceNum, group_type: groupType as 'clinic' | 'laboratory' | 'logistics' | 'extra' })
      } else {
        await createPriceItem({ name, price: priceNum, group_type: groupType as 'clinic' | 'laboratory' | 'logistics' | 'extra' })
      }
      
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save price item')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Dental Cleaning"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-type">Group Type</Label>
        <Select value={groupType} onValueChange={setGroupType}>
          <SelectTrigger id="group-type">
            <SelectValue placeholder="Select group type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="laboratory">Laboratory</SelectItem>
            <SelectItem value="logistics">Logistics</SelectItem>
            <SelectItem value="extra">Extra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
