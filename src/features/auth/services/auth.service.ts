import { supabase } from '@/lib/supabaseClient'
import type { LoginCredentials, SignUpCredentials } from '../types'

/**
 * Authentication service
 * Handles all auth-related operations with Supabase
 */
export const authService = {
    /**
     * Sign in with email and password
     */
    async signIn({ email, password }: LoginCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    /**
     * Sign up with email and password
     */
    async signUp({ email, password }: SignUpCredentials) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    /**
     * Sign out current user
     */
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /**
     * Get current session
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data.session
    },

    /**
     * Get current user
     */
    async getUser() {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user
    },
}
