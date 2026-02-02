import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { AppRouter } from './router'
import { DevBanner } from '@/shared/components/DevBanner'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <DevBanner />
        <AppRouter />
      </div>
    </AuthProvider>
  )
}

export default App
