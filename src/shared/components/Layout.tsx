import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  if (!user) {
    return <>{children}</>
  }

  const isActive = (path: string) => location.pathname === path

  const linkClass = (active: boolean) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile-first navigation */}
      <nav className="bg-background border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary">Dental Quotes</h1>
              
              <div className="hidden sm:flex space-x-4">
                <Link to="/quotes" className={linkClass(isActive('/quotes'))}>
                  Quotes
                </Link>
                <Link to="/price-items" className={linkClass(isActive('/price-items'))}>
                  Price Items
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button variant="secondary" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="sm:hidden pb-3 space-x-2">
            <Link to="/quotes" className={cn('inline-block', linkClass(isActive('/quotes')))}>
              Quotes
            </Link>
            <Link to="/price-items" className={cn('inline-block', linkClass(isActive('/price-items')))}>
              Price Items
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
