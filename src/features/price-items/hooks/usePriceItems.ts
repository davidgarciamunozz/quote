import { useState, useEffect } from 'react'
import { priceItemsService } from '../services/priceItems.service'
import { isSupabaseConfigured } from '@/lib/env'
import { MOCK_PRICE_ITEMS } from '@/lib/mockData'
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

        // Return mock data if Supabase is not configured
        // NOTE: isSupabaseConfigured and MOCK_PRICE_ITEMS need to be defined or imported
        // For example:
        // import { isSupabaseConfigured } from '../utils/supabase'
        // import { MOCK_PRICE_ITEMS } from '../data/mockPriceItems'
        if (typeof isSupabaseConfigured !== 'undefined' && !isSupabaseConfigured()) {
            if (typeof MOCK_PRICE_ITEMS !== 'undefined') {
                setPriceItems(MOCK_PRICE_ITEMS as PriceItem[]) // Cast to PriceItem[] if MOCK_PRICE_ITEMS is defined
            } else {
                console.warn("MOCK_PRICE_ITEMS is not defined, cannot load mock data.")
                setPriceItems([])
            }
            setLoading(false)
            return
        }

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
