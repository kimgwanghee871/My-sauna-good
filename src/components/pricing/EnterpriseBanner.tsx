'use client'

import { EnterpriseConfig } from '@/lib/config'

interface EnterpriseBannerProps {
  config: EnterpriseConfig
  onClick: () => void
}

export default function EnterpriseBanner({ config, onClick }: EnterpriseBannerProps) {
  if (!config.enabled) return null

  return (
    <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <h3 className="text-2xl font-bold mb-2">{config.title}</h3>
            <p className="text-purple-100 mb-4">{config.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg 
                    className="w-4 h-4 text-purple-200" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className="text-purple-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center lg:items-end">
            <button
              onClick={onClick}
              className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors shadow-lg"
            >
              {config.cta}
            </button>
            <p className="text-purple-200 text-sm mt-2">
              {config.slo.firstResponseHours}시간 내 응답
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}