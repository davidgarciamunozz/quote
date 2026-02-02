import { useState } from 'react'
import { priceItemsService } from '../services/priceItems.service'
import type { CreatePriceItemInput, UpdatePriceItemInput } from '../types'

export function usePriceItemMutations() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const createPriceItem = async (input: CreatePriceItemInput) => {
        try {
            setLoading(true)
            setError(null)
            const item = await priceItemsService.create(input)
            return item
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create price item')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const updatePriceItem = async (id: string, input: UpdatePriceItemInput) => {
        try {
            setLoading(true)
            setError(null)
            const item = await priceItemsService.update(id, input)
            return item
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update price item')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deletePriceItem = async (id: string) => {
        try {
            setLoading(true)
            setError(null)
            await priceItemsService.delete(id)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete price item')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        createPriceItem,
        updatePriceItem,
        deletePriceItem,
        loading,
        error,
    }
}
