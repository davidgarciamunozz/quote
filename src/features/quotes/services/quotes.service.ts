import { supabase } from '@/lib/supabaseClient'
import type { Quote, QuoteWithItems, CreateQuoteInput } from '../types'

/**
 * Quotes service
 * Handles all operations for creating and managing quotes
 */
export const quotesService = {
    /**
     * Fetch all quotes for the current user
     */
    async getAll(): Promise<Quote[]> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    /**
     * Get a single quote with all its items
     */
    async getById(id: string): Promise<QuoteWithItems | null> {
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .single()

        if (quoteError) throw quoteError

        const { data: items, error: itemsError } = await supabase
            .from('quote_items')
            .select(`
        *,
        price_item:price_items(*)
      `)
            .eq('quote_id', id)

        if (itemsError) throw itemsError

        return {
            ...quote,
            items: items || [],
        }
    },

    /**
     * Create a new quote with items
     */
    async create(input: CreateQuoteInput): Promise<Quote> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Calculate total
        const total = input.items.reduce((sum, item) => {
            return sum + (item.price_snapshot * item.quantity)
        }, 0)

        // Create quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .insert({
                patient_name: input.patient_name,
                notes: input.notes || null,
                total,
                created_by: user.id,
            })
            .select()
            .single()

        if (quoteError) throw quoteError

        // Create quote items
        const quoteItems = input.items.map(item => ({
            quote_id: quote.id,
            price_item_id: item.price_item_id,
            price_snapshot: item.price_snapshot,
            quantity: item.quantity,
            subtotal: item.price_snapshot * item.quantity,
        }))

        const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(quoteItems)

        if (itemsError) throw itemsError

        return quote
    },

    /**
     * Delete a quote (and cascade delete items)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', id)

        if (error) throw error
    },
}
