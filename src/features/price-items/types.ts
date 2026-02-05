export type PriceItemGroupType =
    | 'clinic'           // Dentista
    | 'laboratory'       // Laboratorio
    | 'logistics'        // Logística (Transporte, Hotel, etc.)
    | 'implantologist'   // Implantólogo
    | 'periodontist'     // Periodoncista
    | 'endodontist'      // Endodoncista
    | 'extra'

/** Etiquetas en español para cada tipo de grupo */
export const GROUP_LABELS: Record<PriceItemGroupType, string> = {
    clinic: 'Dentista',
    laboratory: 'Laboratorio',
    logistics: 'Logística',
    implantologist: 'Implantólogo',
    periodontist: 'Periodoncista',
    endodontist: 'Endodoncista',
    extra: 'Extra',
}

export interface PriceItem {
    id: string
    name: string
    price: number
    group_type: PriceItemGroupType
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
