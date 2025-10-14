'use client'

import { SessionProvider } from 'next-auth/react'
import { CheckoutProvider } from './providers/CheckoutProvider'
import { ToastContainer } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CheckoutProvider>
        {children}
        <ToastContainer />
      </CheckoutProvider>
    </SessionProvider>
  )
}
