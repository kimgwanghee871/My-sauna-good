import { fetchLandingPricingConfig } from '@/lib/config'
import { PlanGrid } from '@/components/landing/PlanGrid'
import { EnterpriseBanner } from '@/components/landing/EnterpriseBanner'

export async function PricingSection() {
  const config = await fetchLandingPricingConfig()
  
  return (
    <>
      <PlanGrid 
        plans={config.plans} 
        hero={config.hero}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <EnterpriseBanner ent={config.enterprise} />
      </div>
    </>
  )
}