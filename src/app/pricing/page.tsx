export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import PricingPageClient from './PricingPageClient'
import { fetchPricingConfig } from '@/lib/config'

export default async function PricingPage() {
  const session = await getServerSession()
  const config = await fetchPricingConfig()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PricingPageClient 
          config={config}
          session={session}
        />
      </div>
    </div>
  )
}