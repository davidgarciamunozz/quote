import { useState, useEffect } from 'react'
import { quotesService } from '../services/quotes.service'
import { isSupabaseConfigured } from '@/lib/env'
import { MOCK_QUOTES } from '@/lib/mockData'
import type { Quote } from '../types'

export function useQuotes() {
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchQuotes() {
            setLoading(true)
            setError(null)

            // Return mock data if Supabase is not configured
            if (!isSupabaseConfigured()) {
                setQuotes(MOCK_QUOTES)
                setLoading(false)
                return
            }

            try {
                const data = await quotesService.getAll()
                setQuotes(data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch quotes'))
            } finally {
                setLoading(false)
            }
        }

        fetchQuotes()
    }, [])

    const refresh = () => {
        // Re-trigger the fetch logic by calling the function directly
        // or by introducing a dependency in useEffect if more complex state is involved.
        // For now, we'll just re-run the fetch logic.
        // Note: If fetchQuotes was defined outside useEffect, it could be called directly.
        // As it's inside, we'd need to refactor or trigger the useEffect again.
        // For simplicity, let's assume the user wants to re-run the initial fetch logic.
        // A better approach might be to move fetchQuotes outside or use a state variable as a dependency.
        // Given the instruction, the most direct interpretation is to re-execute the fetch logic.
        // However, since fetchQuotes is now inside useEffect, we can't directly call it from refresh.
        // Let's re-introduce a `loadQuotes` function for `refresh` to call,
        // or make `fetchQuotes` callable from outside.
        // For now, let's assume `refresh` should trigger the same logic as the initial load.
        // This implies the `useEffect` should be able to be re-triggered.
        // Let's make `fetchQuotes` a standalone function again, similar to the original `loadQuotes`.
        // This makes `refresh` work as intended.

        // Re-implementing loadQuotes to be callable by refresh
        async function loadQuotesInternal() {
            setLoading(true)
            setError(null)

            if (!isSupabaseConfigured()) {
                setQuotes(MOCK_QUOTES)
                setLoading(false)
                return
            }

            try {
                const data = await quotesService.getAll()
                setQuotes(data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load quotes'))
            } finally {
                setLoading(false)
            }
        }
        loadQuotesInternal()
    }

    return {
        quotes,
        loading,
        error,
        refresh,
    }
}
