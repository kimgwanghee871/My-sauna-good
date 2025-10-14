'use client'

import { useState } from 'react'
import { HeroPricing } from './HeroPricing'
import { BillingToggle } from './BillingToggle'
import { PlanCard } from './PlanCard'
import { LandingPricingPlan } from '@/lib/config'

interface PlanGridProps {
  plans: LandingPricingPlan[]
  hero: {
    title: string
    subtitle: string
    cta_primary: string
    cta_secondary: string
    bullets: string[]
    billing_toggle: {
      monthly_label: string
      annual_label: string
      annual_discount_rate: number
    }
  }
}

export function PlanGrid({ plans, hero }: PlanGridProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const enabledPlans = plans.filter(plan => plan.enabled)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <HeroPricing rc={hero} />

        {/* Billing Toggle */}
        <BillingToggle
          value={billing}
          onChange={setBilling}
          labels={{
            monthly: hero.billing_toggle.monthly_label,
            annual: hero.billing_toggle.annual_label
          }}
        />

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {enabledPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
            />
          ))}
        </div>
      </div>
    </section>
  )
}