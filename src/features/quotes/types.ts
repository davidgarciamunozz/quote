import type { PriceItem } from '../price-items/types'

export interface Quote {
    id: string
    patient_name: string
    notes: string | null
    total: number
    /** Ganancia operacional en COP */
    operational_profit?: number
    /** Tasa de cambio COP/USD usada (ej: 3500 = 1 USD = 3500 COP) */
    exchange_rate?: number
    created_at: string
    created_by: string
}

export interface QuoteItem {
    id: string
    quote_id: string
    price_item_id: string
    price_snapshot: number
    quantity: number
    subtotal: number
}

export interface QuoteWithItems extends Quote {
    items: QuoteItemWithDetails[]
}

export interface QuoteItemWithDetails extends QuoteItem {
    price_item: PriceItem
}

export interface CreateQuoteInput {
    patient_name: string
    notes?: string
    items: CreateQuoteItemInput[]
    /** Ganancia operacional en COP */
    operational_profit?: number
    /** Tasa de cambio COP/USD (ej: 3500) */
    exchange_rate?: number
}

export interface CreateQuoteItemInput {
    price_item_id: string
    price_snapshot: number
    quantity: number
}
