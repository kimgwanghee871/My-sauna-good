'use client'

import { useCheckout } from '@/app/providers/CheckoutProvider'
import { useRouter } from 'next/navigation'

interface HeroPricingProps {
  rc: {
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

export function HeroPricing({ rc }: HeroPricingProps) {
  const { startCheckout } = useCheckout()
  const router = useRouter()
  
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        {rc.title}
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        {rc.subtitle}
      </p>

      {/* Core Features Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
        {rc.bullets.map((bullet, index) => (
          <div key={index} className="flex items-center justify-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              index === 0 ? 'bg-green-500' : 
              index === 1 ? 'bg-blue-500' : 'bg-purple-500'
            }`}></div>
            <span className="text-gray-600">
              {bullet}
            </span>
          </div>
        ))}
      </div>
      
      {/* Hero CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        <button
          onClick={() => startCheckout('starter', 'monthly')}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          {rc.cta_primary}
        </button>
        
        <button
          onClick={() => router.push('/enterprise/request')}
          className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
        >
          {rc.cta_secondary}
        </button>
      </div>
    </div>
  )
}