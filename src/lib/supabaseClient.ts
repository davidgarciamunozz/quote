import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Supabase client singleton
 * Configured with environment variables
 */
export const supabase = createClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    }
)

/**
 * Database type definitions
 * These will match your Supabase schema
 */
export type Database = {
    public: {
        Tables: {
            price_items: {
                Row: {
                    id: string
                    name: string
                    price: number
                    group_type: string
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    price: number
                    group_type: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    price?: number
                    group_type?: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            quotes: {
                Row: {
                    id: string
                    patient_name: string
                    notes: string | null
                    total: number
                    operational_profit: number | null
                    exchange_rate: number | null
                    created_at: string
                    created_by: string
                }
                Insert: {
                    id?: string
                    patient_name: string
                    notes?: string | null
                    total: number
                    operational_profit?: number | null
                    exchange_rate?: number | null
                    created_at?: string
                    created_by: string
                }
                Update: {
                    id?: string
                    patient_name?: string
                    notes?: string | null
                    total?: number
                    operational_profit?: number | null
                    exchange_rate?: number | null
                    created_at?: string
                    created_by?: string
                }
            }
            quote_items: {
                Row: {
                    id: string
                    quote_id: string
                    price_item_id: string
                    price_snapshot: number
                    quantity: number
                    subtotal: number
                }
                Insert: {
                    id?: string
                    quote_id: string
                    price_item_id: string
                    price_snapshot: number
                    quantity?: number
                    subtotal: number
                }
                Update: {
                    id?: string
                    quote_id?: string
                    price_item_id?: string
                    price_snapshot?: number
                    quantity?: number
                    subtotal?: number
                }
            }
        }
    }
}
