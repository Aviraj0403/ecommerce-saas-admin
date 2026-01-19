import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/auth-store'
import DashboardLayout from './components/layout/DashboardLayout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { DebugInfo } from './components/DebugInfo'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const CustomersPage = lazy(() => import('./pages/CustomersPage'))
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ApiKeysPage = lazy(() => import('./pages/ApiKeysPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))

// Test components (development only)
const PersistenceTest = lazy(() => import('./components/PersistenceTest').then(module => ({ default: () => <module.PersistenceTest /> })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="test-persistence" element={<PersistenceTest />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
      <DebugInfo />
    </>
  )
}

export default App
