import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { NetworkStatus } from '@/components/NetworkStatus'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'GK Store - Premium E-commerce',
  description: 'Shop the best products online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          {children}
          <ConnectionStatus />
          <NetworkStatus />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
