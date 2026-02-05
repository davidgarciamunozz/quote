import { useState, useEffect } from 'react'
import { quotesService } from '../services/quotes.service'
import type { Quote } from '../types'

export function useQuotes() {
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        loadQuotes()
    }, [])

    async function loadQuotes() {
        setLoading(true)
        setError(null)

        try {
            const data = await quotesService.getAll()
            setQuotes(data)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch quotes'))
        } finally {
            setLoading(false)
        }
    }

    const refresh = () => {
        loadQuotes()
    }

    return {
        quotes,
        loading,
        error,
        refresh,
    }
}
