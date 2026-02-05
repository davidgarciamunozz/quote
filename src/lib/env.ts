/**
 * Environment variable validation and type-safe access
 */

export const env = {
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
} as const

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

/**
 * Validates that all required environment variables are present
 * Now warns instead of throwing to allow UI preview without Supabase
 */
export function validateEnv(): void {
    const missing: string[] = []

    if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')

    if (missing.length > 0) {
        console.warn(
            `⚠️  Missing Supabase configuration: ${missing.join(', ')}\n` +
            'Running in UI preview mode. Authentication and data persistence will not work.\n' +
            'To enable full functionality, copy .env.example to .env.local and add your Supabase credentials.'
        )
    }
}
