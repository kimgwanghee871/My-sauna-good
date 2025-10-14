'use client'

import { useRouter } from 'next/navigation'

interface EnterpriseBannerProps {
  ent: {
    enabled: boolean
    name: string
    title: string
    badges: string[]
    bullets: string[]
    cta_primary: string
    cta_secondary: string
    response_sla: string
    link: string
  }
}

export function EnterpriseBanner({ ent }: EnterpriseBannerProps) {
  const router = useRouter()
  
  if (!ent.enabled) return null

  return (
    <section className="mt-12 rounded-2xl border-2 border-blue-100 p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
      <div className="flex items-start justify-between gap-6 md:flex-row flex-col">
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {ent.badges?.map((badge, i) => (
              <span 
                key={i} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
              >
                {badge}
              </span>
            ))}
          </div>
          
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{ent.name}</h3>
            <p className="text-lg text-gray-700 font-medium">{ent.title}</p>
          </div>
          
          {/* Features List */}
          <ul className="text-gray-600 text-sm space-y-2">
            {ent.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        
        {/* CTA Section */}
        <div className="flex-shrink-0 space-y-3 text-center md:text-right">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg w-full md:w-auto"
            onClick={() => router.push(ent.link)}
          >
            {ent.cta_primary}
          </button>
          <div className="text-xs text-gray-500 font-medium">
            {ent.cta_secondary}
          </div>
        </div>
      </div>
    </section>
  )
}