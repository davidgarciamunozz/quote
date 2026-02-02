export interface PriceItem {
    id: string
    name: string
    price: number
    group_type: 'clinic' | 'laboratory' | 'logistics' | 'extra'
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreatePriceItemInput {
    name: string
    price: number
    group_type: string
}

export interface UpdatePriceItemInput {
    name?: string
    price?: number
    group_type?: string
    is_active?: boolean
}
