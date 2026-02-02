import type { PriceItem } from '../price-items/types'

export interface Quote {
    id: string
    patient_name: string
    notes: string | null
    total: number
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
}

export interface CreateQuoteItemInput {
    price_item_id: string
    price_snapshot: number
    quantity: number
}
