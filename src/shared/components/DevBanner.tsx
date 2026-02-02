import { isSupabaseConfigured } from '@/lib/env'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'

export function DevBanner() {
  if (isSupabaseConfigured()) {
    return null
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-b border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <TriangleAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        UI Preview Mode - Supabase Not Configured
      </AlertTitle>
      <AlertDescription>
        Authentication and data persistence are disabled. To enable full functionality, add your Supabase credentials to <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env.local</code>
      </AlertDescription>
    </Alert>
  )
}
