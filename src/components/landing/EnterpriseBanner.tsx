'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface EnterpriseBannerProps {
  ent: {
    enabled: boolean
    name: string
    title: string
    bullets: string[]
    cta: string
    response_sla: string
    link: string
  }
}

export function EnterpriseBanner({ ent }: EnterpriseBannerProps) {
  if (!ent.enabled) return null

  return (
    <div className="bg-gray-50 rounded-2xl p-8 mb-16">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {ent.name}
        </h3>
        <p className="text-xl text-gray-600 mb-6">
          {ent.title}
        </p>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
          {ent.bullets.map((bullet, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {bullet}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={ent.link}>
            <Button variant="primary" className="px-8 py-3">
              {ent.cta}
            </Button>
          </Link>
          <span className="text-sm text-gray-500">
            {ent.response_sla}
          </span>
        </div>
      </div>
    </div>
  )
}