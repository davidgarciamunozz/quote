import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { QuoteList } from '@/features/quotes/components/QuoteList'
import { QuoteBuilder } from '@/features/quotes/components/QuoteBuilder'
import { QuoteDetail } from '@/features/quotes/components/QuoteDetail'
import { PriceItemList } from '@/features/price-items/components/PriceItemList'
import { Layout } from '@/shared/components/Layout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Protected routes */}
        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <Layout>
                <QuoteList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/new"
          element={
            <ProtectedRoute>
              <Layout>
                <QuoteBuilder />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <QuoteDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-items"
          element={
            <ProtectedRoute>
              <Layout>
                <PriceItemList />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/quotes" replace />} />
        <Route path="*" element={<Navigate to="/quotes" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
