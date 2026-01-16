import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:6005',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'ui-vendor': ['lucide-react', 'sonner', 'recharts'],
          'form-vendor': ['react-hook-form', 'zod'],
          'utils-vendor': ['axios', 'date-fns', 'zustand'],
          
          // Feature chunks
          'dashboard': ['./src/pages/DashboardPage.tsx', './src/hooks/useDashboard.ts'],
          'products': ['./src/pages/ProductsPage.tsx', './src/hooks/useProducts.ts'],
          'orders': ['./src/pages/OrdersPage.tsx', './src/pages/OrderDetailPage.tsx', './src/hooks/useOrders.ts'],
          'customers': ['./src/pages/CustomersPage.tsx', './src/pages/CustomerDetailPage.tsx', './src/hooks/useCustomers.ts'],
          'reports': ['./src/pages/ReportsPage.tsx', './src/hooks/useReports.ts'],
          'settings': ['./src/pages/SettingsPage.tsx', './src/pages/ApiKeysPage.tsx', './src/pages/SubscriptionPage.tsx'],
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'axios',
      'zustand',
      'lucide-react',
      'sonner',
      'recharts',
    ],
  },
})
