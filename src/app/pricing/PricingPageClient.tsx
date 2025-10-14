'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'
import { PricingConfig, getEnabledPlans } from '@/lib/config'
import PricingHero from '@/components/pricing/PricingHero'
import AnnualToggle from '@/components/pricing/AnnualToggle'
import PlanCard from '@/components/pricing/PlanCard'
import PlanComparison from '@/components/pricing/PlanComparison'
import EnterpriseBanner from '@/components/pricing/EnterpriseBanner'

interface PricingPageClientProps {
  config: PricingConfig
  session: Session | null
}

export default function PricingPageClient({ config, session }: PricingPageClientProps) {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  
  const enabledPlans = getEnabledPlans(config)
  
  // Handle plan selection
  const handlePlanSelect = async (planId: string) => {
    // Analytics tracking
    if (typeof window !== 'undefined') {
      console.debug('[analytics] plan_select', { planId })
    }
    
    if (!session) {
      // Not logged in - redirect to login with return URL
      router.push(`/login?returnUrl=/pricing&planId=${planId}`)
      return
    }
    
    if (planId === 'free') {
      // Free plan - redirect to onboarding/dashboard
      router.push('/dashboard')
      return
    }
    
    // Paid plan - start checkout flow
    try {
      console.debug('[analytics] checkout_started', { planId, interval: isAnnual ? 'annual' : 'monthly' })
      
      // TODO: Implement actual checkout flow
      // const response = await fetch('/api/billing/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     planId, 
      //     interval: isAnnual ? 'annual' : 'monthly' 
      //   })
      // })
      // const { checkoutUrl } = await response.json()
      // window.location.href = checkoutUrl
      
      alert(`결제 시스템 준비 중입니다.\n플랜: ${planId}\n주기: ${isAnnual ? '연간' : '월간'}`)
      
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('결제 시작에 실패했습니다. 다시 시도해주세요.')
    }
  }
  
  // Handle primary CTA (free trial)
  const handlePrimaryCTA = () => {
    if (typeof window !== 'undefined') {
      console.debug('[analytics] pricing_view', { cta: 'primary' })
    }
    
    if (!session) {
      router.push('/login?returnUrl=/dashboard')
    } else {
      router.push('/dashboard')
    }
  }
  
  // Handle secondary CTA (enterprise inquiry)
  const handleSecondaryCTA = () => {
    if (typeof window !== 'undefined') {
      console.debug('[analytics] enterprise_inquiry_opened')
    }
    
    router.push('/enterprise/request')
  }
  
  // Handle enterprise banner click
  const handleEnterpriseBanner = () => {
    if (typeof window !== 'undefined') {
      console.debug('[analytics] enterprise_inquiry_opened', { source: 'banner' })
    }
    
    router.push('/enterprise/request')
  }

  return (
    <main>
      {/* Hero Section */}
      <PricingHero 
        config={config}
        onPrimaryClick={handlePrimaryCTA}
        onSecondaryClick={handleSecondaryCTA}
      />
      
      {/* Annual Toggle */}
      {config.ab.showAnnualToggle && (
        <AnnualToggle
          isAnnual={isAnnual}
          onToggle={setIsAnnual}
          discountMonths={config.ab.annualDiscount}
        />
      )}
      
      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {enabledPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isAnnual={isAnnual}
            annualDiscount={config.ab.annualDiscount}
            onSelect={handlePlanSelect}
            // TODO: Add current plan detection
            // isCurrentPlan={userPlan?.id === plan.id}
          />
        ))}
      </div>
      
      {/* Plan Comparison Table */}
      {config.ab.showComparison && (
        <PlanComparison
          plans={enabledPlans}
          isAnnual={isAnnual}
          annualDiscount={config.ab.annualDiscount}
        />
      )}
      
      {/* Enterprise Banner */}
      <EnterpriseBanner
        config={config.enterprise}
        onClick={handleEnterpriseBanner}
      />
    </main>
  )
}