'use client'

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
    </div>
  )
}