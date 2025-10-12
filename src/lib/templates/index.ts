import { TemplateType, TemplateConfig } from '@/types/template'
import { governmentTemplate } from './government'
import { investmentTemplate } from './investment' 
import { loanTemplate } from './loan'

// 모든 템플릿을 하나의 객체로 관리
export const templates: Record<TemplateType, TemplateConfig> = {
  government: governmentTemplate,
  investment: investmentTemplate,
  loan: loanTemplate,
}

// 템플릿 선택을 위한 메타 데이터
export const templateMetadata = [
  {
    key: 'government' as const,
    name: '정부지원용',
    description: 'R&D 과제, 창업지원, 기술개발 과제 신청용',
    icon: '🏛️',
    color: 'bg-blue-500',
    features: ['R&D 계획서', '기술개발 로드맵', '정부과제 맞춤', '사회적 파급효과'],
    sampleUseCase: 'TIPS, K-스타트업, 중소벤처기업부 R&D 과제',
  },
  {
    key: 'investment' as const,
    name: '투자유치용',
    description: 'VC, PE, 엔젤투자자 대상 투자유치용',
    icon: '💰',
    color: 'bg-green-500',
    features: ['Executive Summary', 'Traction 지표', 'Exit 전략', '밸류에이션'],
    sampleUseCase: '시리즈 A/B, 브릿지 투자, 액셀러레이터 데모데이',
  },
  {
    key: 'loan' as const,
    name: '대출용',
    description: '은행, 보증기금 등 금융기관 대출용',
    icon: '🏦',
    color: 'bg-purple-500',
    features: ['재무실적 분석', '상환계획', '담보현황', '리스크 관리'],
    sampleUseCase: '신용보증기금, 기술보증기금, 시중은행 대출',
  },
]

// 유틸리티 함수들
export function getTemplate(type: TemplateType): TemplateConfig {
  const template = templates[type]
  if (!template) {
    throw new Error(`Template not found: ${type}`)
  }
  return template
}

export function getTemplateMetadata(type: TemplateType) {
  return templateMetadata.find(meta => meta.key === type)
}

export function validateTemplateInputs(type: TemplateType, inputs: Record<string, any>): {
  isValid: boolean
  missingFields: string[]
  errors: string[]
} {
  const template = getTemplate(type)
  const missingFields: string[] = []
  const errors: string[] = []

  // 필수 질문 검증
  template.questions
    .filter(q => q.required)
    .forEach(question => {
      const value = getNestedValue(inputs, question.mapTo)
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(question.label)
      }
    })

  // 타입별 특별 검증
  if (type === 'investment') {
    if (!inputs.finance?.projections) {
      errors.push('투자용 계획서는 재무 전망이 필수입니다')
    }
  }

  if (type === 'loan') {
    if (!inputs.finance?.recentSales) {
      errors.push('대출용 계획서는 최근 매출 실적이 필수입니다')
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  }
}

// 중첩된 객체에서 값 가져오기 (lodash.get 대체)
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 섹션 순서 정의 (템플릿별로 다를 수 있음)
export const sectionOrder: Record<TemplateType, string[]> = {
  government: [
    'summary',
    'company_intro', 
    'technology',
    'market_analysis',
    'competitive_analysis',
    'business_model',
    'rd_plan',
    'finance_plan',
    'risk_management',
    'expected_effects',
  ],
  investment: [
    'executive_summary',
    'problem_solution',
    'market_opportunity',
    'product_service',
    'business_model',
    'traction_milestones',
    'competitive_landscape',
    'team_organization',
    'financial_projections',
    'funding_use',
    'growth_strategy',
    'exit_strategy',
  ],
  loan: [
    'business_overview',
    'company_profile',
    'management_team',
    'business_plan',
    'market_analysis',
    'financial_status',
    'financial_projections',
    'loan_purpose',
    'repayment_plan',
    'risk_analysis',
  ],
}