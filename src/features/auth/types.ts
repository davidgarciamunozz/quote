import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export type User = SupabaseUser

export interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface SignUpCredentials extends LoginCredentials {
    email: string
    password: string
}
