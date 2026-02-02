import { PriceItem } from '@/features/price-items/types'
import { Quote, QuoteWithItems } from '@/features/quotes/types'
import { User } from '@/features/auth/types'

// Mock user matching localized needs of Supabase User type
export const MOCK_USER = {
    id: 'mock-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'doctor@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
        provider: 'email',
        providers: ['email'],
    },
    user_metadata: {
        name: 'Dr. Mock',
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as unknown as User

export const MOCK_PRICE_ITEMS: PriceItem[] = [
    // Clinic
    { id: '1', name: 'Dental Cleaning', price: 80, group_type: 'clinic', is_active: true, created_at: '', updated_at: '' },
    { id: '2', name: 'Dental Exam', price: 50, group_type: 'clinic', is_active: true, created_at: '', updated_at: '' },
    { id: '3', name: 'X-Ray (Single)', price: 25, group_type: 'clinic', is_active: true, created_at: '', updated_at: '' },
    { id: '4', name: 'Filling (Composite)', price: 120, group_type: 'clinic', is_active: true, created_at: '', updated_at: '' },

    // Laboratory
    { id: '5', name: 'Crown (Porcelain)', price: 1200, group_type: 'laboratory', is_active: true, created_at: '', updated_at: '' },
    { id: '6', name: 'Bridge (3-unit)', price: 2500, group_type: 'laboratory', is_active: true, created_at: '', updated_at: '' },
    { id: '7', name: 'Dentures (Full Set)', price: 1800, group_type: 'laboratory', is_active: true, created_at: '', updated_at: '' },

    // Logistics
    { id: '8', name: 'Rush Delivery', price: 50, group_type: 'logistics', is_active: true, created_at: '', updated_at: '' },

    // Extra
    { id: '9', name: 'Emergency Visit', price: 100, group_type: 'extra', is_active: true, created_at: '', updated_at: '' },
]

export const MOCK_QUOTES: Quote[] = [
    {
        id: '101',
        patient_name: 'John Doe',
        notes: 'Routine checkup and cleaning.',
        total: 130,
        created_at: new Date().toISOString(),
        created_by: 'mock-user-id'
    },
    {
        id: '102',
        patient_name: 'Jane Smith',
        notes: 'Requires a porcelain crown on tooth #14.',
        total: 1250,
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        created_by: 'mock-user-id'
    },
]

export const MOCK_QUOTE_DETAILS: Record<string, QuoteWithItems> = {
    '101': {
        ...MOCK_QUOTES[0],
        items: [
            {
                id: 'item-1',
                quote_id: '101',
                price_item_id: '1',
                price_snapshot: 80,
                quantity: 1,
                subtotal: 80,
                price_item: MOCK_PRICE_ITEMS[0]
            },
            {
                id: 'item-2',
                quote_id: '101',
                price_item_id: '2',
                price_snapshot: 50,
                quantity: 1,
                subtotal: 50,
                price_item: MOCK_PRICE_ITEMS[1]
            }
        ]
    },
    '102': {
        ...MOCK_QUOTES[1],
        items: [
            {
                id: 'item-3',
                quote_id: '102',
                price_item_id: '5',
                price_snapshot: 1200,
                quantity: 1,
                subtotal: 1200,
                price_item: MOCK_PRICE_ITEMS[4]
            },
            {
                id: 'item-4',
                quote_id: '102',
                price_item_id: '8',
                price_snapshot: 50,
                quantity: 1,
                subtotal: 50,
                price_item: MOCK_PRICE_ITEMS[7]
            }
        ]
    }
}
