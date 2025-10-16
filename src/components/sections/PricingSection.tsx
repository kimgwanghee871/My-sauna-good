import { fetchLandingPricingConfig } from '@/lib/config'
import { PlanGrid } from '@/components/landing/PlanGrid'
import { EnterpriseBanner } from '@/components/landing/EnterpriseBanner'

export async function PricingSection() {
  try {
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
  } catch (error) {
    console.warn('PricingSection error, showing fallback:', error)
    return (
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            요금제 정보 로딩 중...
          </h2>
          <p className="text-gray-600">
            잠시만 기다려주세요. 페이지를 새로고침하면 해결될 수 있습니다.
          </p>
        </div>
      </div>
    )
  }
}