'use client'

import { Button } from '@/components/ui/Button'

interface Chip {
  label: string
  desc?: string
}

interface PlanCardProps {
  plan: {
    id: string
    name: string
    tagline: string
    price_monthly: number
    credits: number
    chips: Chip[]
    bullets: string[]
    cta: string
    watermark: boolean
    popular: boolean
  }
  billing: 'monthly' | 'annual'
}

export function PlanCard({ plan, billing }: PlanCardProps) {
  // Calculate price based on billing period
  const price = billing === 'monthly' 
    ? plan.price_monthly 
    : Math.round(plan.price_monthly * 10) // Annual: 2 months free = 10 months

  const formatPrice = (price: number) => {
    if (price === 0) return '무료'
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-lg ${
        plan.popular 
          ? 'border-blue-500 shadow-lg scale-105' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            {plan.tagline}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        {!plan.popular && (
          <p className="text-sm text-gray-500 mb-2">{plan.tagline}</p>
        )}
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {price > 0 && (
            <span className="text-gray-600 ml-1">
              /{billing === 'monthly' ? '월' : '년'}
              {billing === 'annual' && (
                <span className="block text-sm text-green-600 mt-1">
                  2개월 무료
                </span>
              )}
            </span>
          )}
        </div>

        {/* Chips */}
        <div className="flex justify-center space-x-2 mb-4">
          {plan.chips.map((chip, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-xs">
              <span className="font-medium">{chip.label}</span>
              {chip.desc && <span className="text-gray-500 ml-1">{chip.desc}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Features List */}
      <ul className="space-y-3 mb-8">
        {plan.bullets.map((bullet, index) => (
          <li key={index} className="flex items-start text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {bullet}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        variant={plan.popular ? 'primary' : 'outline'}
        fullWidth
        className={plan.popular ? 'text-lg' : ''}
      >
        {plan.cta}
      </Button>
    </div>
  )
}