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
    badges: string[]
    bullets: string[]
    cta_primary: string
    cta_secondary: string
    response_sla: string
    link: string
  }
}

// Safe config fetcher with fallback
async function safeConfigImport<T>(importFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await importFn()
  } catch (error) {
    console.warn('Config import failed, using fallback:', error)
    return fallback
  }
}

// Fetch pricing config (with caching in production)
export async function fetchPricingConfig(): Promise<PricingConfig> {
  const defaultConfig: PricingConfig = {
    currency: "KRW",
    rollover_rate: 0.3,
    overage: { enabled: true, price_krw: 100 },
    regen_cost_unit: 50,
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        credits: 3,
        watermark: true,
        viz: 1,
        verify: "basic",
        priority: "standard",
        enabled: true,
        subtitle: "무료로 시작",
        description: "개인 사용자를 위한 기본 플랜",
        features: ["월 3회 생성", "워터마크 포함", "기본 템플릿"],
        target: "개인"
      }
    ],
    enterprise: {
      enabled: true,
      cta: "문의하기",
      title: "Enterprise",
      subtitle: "맞춤형 솔루션",
      description: "대기업을 위한 맞춤 솔루션",
      bullets: ["무제한 생성", "API 접근", "24/7 지원"],
      features: [],
      target: "enterprise",
      link: "/enterprise/request",
      slo: { firstResponseHours: 24 }
    },
    ab: {
      showAnnualToggle: true,
      showComparison: true,
      annualDiscount: 2
    },
    copy: {
      hero: {
        title: "10분 내 고품질 사업계획서",
        subtitle: "AI가 작성하는 전문적인 사업계획서",
        cta_primary: "무료로 시작하기",
        cta_secondary: "샘플 보기"
      },
      core_features: [],
      overage: { title: "추가 사용", description: "크레딧 소진 시 추가 구매" },
      rollover: { title: "크레딧 이월", description: "미사용 크레딧 다음달 이월" },
      regen: { title: "재생성", description: "결과가 만족스럽지 않을 때 재생성" }
    }
  }

  return safeConfigImport(
    async () => pricingConfig.pricing as PricingConfig,
    defaultConfig
  )
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

// Fetch landing pricing config with fallback
export async function fetchLandingPricingConfig(): Promise<LandingPricingConfig> {
  const defaultLandingConfig: LandingPricingConfig = {
    hero: {
      title: "10분 내 고품질 사업계획서",
      subtitle: "AI가 작성하는 전문적인 사업계획서로 투자 유치와 사업 성공을 한번에",
      cta_primary: "무료로 시작하기",
      cta_secondary: "샘플 보기",
      bullets: ["✅ 10분 내 완성", "✅ 전문가 수준", "✅ 투자 유치 최적화"],
      billing_toggle: {
        monthly_label: "월간",
        annual_label: "연간",
        annual_discount_rate: 20
      }
    },
    plans: [
      {
        id: "free",
        name: "Free",
        tagline: "무료로 시작",
        price_monthly: 0,
        credits: 3,
        chips: [{ label: "기본", desc: "개인용" }],
        bullets: ["월 3회 생성", "기본 템플릿", "워터마크 포함"],
        cta: "무료 시작",
        watermark: true,
        popular: false,
        enabled: true
      }
    ],
    enterprise: {
      enabled: true,
      name: "Enterprise",
      title: "맞춤형 솔루션",
      badges: ["24/7 지원", "전담 매니저"],
      bullets: ["무제한 생성", "API 접근", "맞춤 템플릿"],
      cta_primary: "상담 신청",
      cta_secondary: "자료 다운로드",
      response_sla: "24시간 내 응답",
      link: "/enterprise/request"
    }
  }

  return safeConfigImport(
    async () => (pricingConfig as any).landing_pricing as LandingPricingConfig,
    defaultLandingConfig
  )
}

// Fetch QNA form config with fallback
export async function fetchQnaConfig(): Promise<QnaFormConfig> {
  const defaultQnaConfig: QnaFormConfig = {
    attachments: {
      enabled: true,
      title: "첨부파일 (선택)",
      subtitle: "정확성 향상을 위해 첨부 권장",
      note: "PDF/DOCX 최대 2개, 총 30MB",
      recommend_badge: "권장",
      allowed_mimes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      max_files: 2,
      max_total_mb: 30,
      cta_upload: "파일 선택",
      cta_remove: "제거",
      extra_notes_label: "추가 설명 (선택)",
      extra_notes_placeholder: "AI가 고려해야 할 추가 정보나 특별한 요구사항을 입력해주세요..."
    }
  }

  return safeConfigImport(
    async () => {
      const qnaConfig = await import('./qna.json')
      return qnaConfig.qna_form as QnaFormConfig
    },
    defaultQnaConfig
  )
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