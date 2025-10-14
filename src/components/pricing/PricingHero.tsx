'use client'

import { PricingConfig } from '@/lib/config'

interface PricingHeroProps {
  config: PricingConfig
  onPrimaryClick: () => void
  onSecondaryClick: () => void
}

export default function PricingHero({ 
  config, 
  onPrimaryClick, 
  onSecondaryClick 
}: PricingHeroProps) {
  return (
    <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl mb-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {config.copy.hero.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {config.copy.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onPrimaryClick}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {config.copy.hero.cta_primary}
          </button>
          
          <button
            onClick={onSecondaryClick}
            className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            {config.copy.hero.cta_secondary}
          </button>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-sm">
          {config.copy.core_features.map((feature, index) => (
            <div key={index} className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                index === 0 ? 'bg-green-500' : 
                index === 1 ? 'bg-blue-500' : 'bg-purple-500'
              }`}></div>
              <span className="text-gray-600">
                <strong className="font-medium">{feature.title}:</strong> {feature.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}