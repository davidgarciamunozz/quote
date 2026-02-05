import { useState } from 'react'
import { quotesService } from '../services/quotes.service'
import type { CreateQuoteInput } from '../types'
import { isSupabaseConfigured } from '@/lib/env'

export function useQuoteMutations() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const createQuote = async (input: CreateQuoteInput) => {
        try {
            setLoading(true)
            setError(null)

            if (!isSupabaseConfigured()) {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
                const totalEgresos = input.items.reduce((s, i) => s + i.price_snapshot * i.quantity, 0)
                const total = totalEgresos + (input.operational_profit ?? 0)
                return {
                    id: 'mock-new-id',
                    patient_name: input.patient_name,
                    notes: input.notes || null,
                    total,
                    operational_profit: input.operational_profit ?? 0,
                    exchange_rate: input.exchange_rate ?? 3500,
                    created_at: new Date().toISOString(),
                    created_by: 'mock-user-id'
                }
            }

            const quote = await quotesService.create(input)
            return quote
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create quote')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteQuote = async (id: string) => {
        try {
            setLoading(true)
            setError(null)

            if (!isSupabaseConfigured()) {
                await new Promise(resolve => setTimeout(resolve, 500))
                return
            }

            await quotesService.delete(id)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete quote')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        createQuote,
        deleteQuote,
        loading,
        error,
    }
}
