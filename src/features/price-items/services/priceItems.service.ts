import { supabase } from '@/lib/supabaseClient'
import type { PriceItem, CreatePriceItemInput, UpdatePriceItemInput } from '../types'

/**
 * Price Items service
 * Handles all CRUD operations for the price catalog
 */
export const priceItemsService = {
    /**
     * Fetch all active price items
     */
    async getAll(): Promise<PriceItem[]> {
        const { data, error } = await supabase
            .from('price_items')
            .select('*')
            .eq('is_active', true)
            .order('group_type', { ascending: true })
            .order('name', { ascending: true })

        if (error) throw error
        return data || []
    },

    /**
     * Fetch price items by group type
     */
    async getByGroupType(groupType: string): Promise<PriceItem[]> {
        const { data, error } = await supabase
            .from('price_items')
            .select('*')
            .eq('group_type', groupType)
            .eq('is_active', true)
            .order('name', { ascending: true })

        if (error) throw error
        return data || []
    },

    /**
     * Get a single price item by ID
     */
    async getById(id: string): Promise<PriceItem | null> {
        const { data, error } = await supabase
            .from('price_items')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Create a new price item
     */
    async create(input: CreatePriceItemInput): Promise<PriceItem> {
        const { data, error } = await supabase
            .from('price_items')
            .insert({
                ...input,
                is_active: true,
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update an existing price item
     */
    async update(id: string, input: UpdatePriceItemInput): Promise<PriceItem> {
        const { data, error } = await supabase
            .from('price_items')
            .update({
                ...input,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Soft delete a price item (set is_active to false)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('price_items')
            .update({ is_active: false })
            .eq('id', id)

        if (error) throw error
    },
}
