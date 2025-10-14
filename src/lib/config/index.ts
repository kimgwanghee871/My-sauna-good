import pricingConfig from './pricing.json'

export interface PricingPlan {
  id: string
  name: string
  price: number
  credits: number
  watermark: boolean
  viz: number
  verify: string
  enabled: boolean
  popular?: boolean
  description: string
  features: string[]
}

export interface EnterpriseConfig {
  enabled: boolean
  cta: string
  title: string
  subtitle: string
  description: string
  features: string[]
  slo: {
    firstResponseHours: number
  }
}

export interface PricingConfig {
  currency: string
  rollover_rate: number
  overage: {
    enabled: boolean
    price_krw: number
  }
  regen_cost_unit: number
  plans: PricingPlan[]
  enterprise: EnterpriseConfig
  ab: {
    showAnnualToggle: boolean
    showComparison: boolean
    annualDiscount: number
  }
  copy: {
    hero: {
      title: string
      subtitle: string
      cta_primary: string
      cta_secondary: string
    }
    overage: {
      title: string
      description: string
    }
    rollover: {
      title: string
      description: string
    }
  }
}

// Fetch pricing config (with caching in production)
export async function fetchPricingConfig(): Promise<PricingConfig> {
  // In a real app, this might fetch from an API or database
  // For now, use the local JSON file
  return pricingConfig.pricing as PricingConfig
}

// Get enabled plans only (filters out disabled plans)
export function getEnabledPlans(config: PricingConfig): PricingPlan[] {
  return config.plans.filter(plan => plan.enabled)
}

// Format price to Korean Won
export function formatPrice(price: number, currency = 'KRW'): string {
  if (price === 0) return '무료'
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// Calculate annual price with discount
export function getAnnualPrice(monthlyPrice: number, discountMonths: number): number {
  return monthlyPrice * (12 - discountMonths)
}

// Get plan by ID
export function getPlanById(config: PricingConfig, planId: string): PricingPlan | null {
  return config.plans.find(plan => plan.id === planId) || null
}