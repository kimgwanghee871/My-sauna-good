'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CheckoutContextType {
  startCheckout: (planId: string, interval?: 'monthly' | 'annual') => Promise<void>
  loadingPlan: string | null
}

export const CheckoutContext = createContext<CheckoutContextType | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const startCheckout = useCallback(async (planId: string, interval: 'monthly' | 'annual' = 'monthly') => {
    try {
      setLoadingPlan(planId)
      
      // 결제 준비중 토스트 표시
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'info', msg: '결제 준비중입니다.' }
      }))
      
      // API 호출
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval })
      })
      
      if (!res.ok) throw new Error('checkout_failed')
      
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
      
    } catch (e) {
      console.error('Checkout error:', e)
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'error', msg: '결제 페이지 연결에 실패했습니다.' }
      }))
    } finally {
      setLoadingPlan(null)
    }
  }, [])

  const value = {
    startCheckout,
    loadingPlan
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}