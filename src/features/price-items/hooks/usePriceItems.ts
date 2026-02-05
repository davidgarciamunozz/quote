import { useState, useEffect } from 'react'
import { priceItemsService } from '../services/priceItems.service'
import type { PriceItem } from '../types'

export function usePriceItems() {
    const [priceItems, setPriceItems] = useState<PriceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        loadPriceItems()
    }, [])

    const loadPriceItems = async () => {
        setLoading(true)
        setError(null)

        try {
            const items = await priceItemsService.getAll()
            setPriceItems(items)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load price items'))
        } finally {
            setLoading(false)
        }
    }

    const refresh = () => {
        loadPriceItems()
    }

    return {
        priceItems,
        loading,
        error,
        refresh,
    }
}
