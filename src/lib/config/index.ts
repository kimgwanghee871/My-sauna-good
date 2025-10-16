import pricingConfig from './pricing.json'

export interface PricingPlan {
  id: string
  name: string
  price: number
  credits: number
  watermark: boolean
  viz: number
  verify: string
  priority: string
  enabled: boolean
  badge?: string | null
  subtitle: string
  description: string
  features: string[]
  target: string
  customize?: string
}

export interface EnterpriseConfig {
  enabled: boolean
  cta: string
  title: string
  subtitle: string
  description: string
  bullets: string[]
  features: string[]
  target: string
  link: string
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
    core_features: Array<{
      title: string
      description: string
    }>
    overage: {
      title: string
      description: string
    }
    rollover: {
      title: string
      description: string
    }
    regen: {
      title: string
      description: string
    }
  }
}

// Landing pricing interfaces
export interface LandingPricingPlan {
  id: string
  name: string
  tagline: string
  price_monthly: number
  credits: number
  chips: Array<{ label: string; desc: string }>
  bullets: string[]
  cta: string
  watermark: boolean
  popular: boolean
  enabled: boolean
}

export interface LandingPricingConfig {
  hero: {
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
  plans: LandingPricingPlan[]
  enterprise: {
    enabled: boolean
    name: string
    title: string
    bullets: string[]
    cta: string
    response_sla: string
    link: string
  }
}

// Fetch pricing config (with caching in production)
export async function fetchPricingConfig(): Promise<PricingConfig> {
  // In a real app, this might fetch from an API or database
  // For now, use the local JSON file
  return pricingConfig.pricing as PricingConfig
}

// QNA Form interfaces
export interface QnaAttachmentConfig {
  enabled: boolean
  title: string
  subtitle: string
  note: string
  recommend_badge: string
  allowed_mimes: string[]
  max_files: number
  max_total_mb: number
  cta_upload: string
  cta_remove: string
  extra_notes_label: string
  extra_notes_placeholder: string
}

export interface QnaFormConfig {
  attachments: QnaAttachmentConfig
}

// Fetch landing pricing config
export async function fetchLandingPricingConfig(): Promise<LandingPricingConfig> {
  // In a real app, this might fetch from remote config
  // For now, use the local JSON file
  return (pricingConfig as any).landing_pricing as LandingPricingConfig
}

// Fetch QNA form config
export async function fetchQnaConfig(): Promise<QnaFormConfig> {
  const qnaConfig = await import('./qna.json')
  return qnaConfig.qna_form as QnaFormConfig
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