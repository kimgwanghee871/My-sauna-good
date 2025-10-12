// 템플릿 관련 타입 정의
export type TemplateType = 'government' | 'investment' | 'loan'

export interface QuestionField {
  id: string
  label: string
  placeholder: string
  mapTo: string
  type: 'short' | 'long' | 'select' | 'multi' | 'number'
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface SectionConfig {
  code: string
  title: string
  minChars: number
  maxChars: number
  required: boolean
  requires?: string[]
  visualizations?: VisualizationConfig[]
}

export interface VisualizationConfig {
  kind: 'bar' | 'line' | 'pie' | 'table' | 'timeline' | 'org'
  title: string
  data: Record<string, any>[]
  encoding?: Record<string, any>
}

export interface TemplateConfig {
  id: string
  key: TemplateType
  version: string
  name: string
  description: string
  sections: SectionConfig[]
  questions: QuestionField[]
}

export interface CitationSource {
  id: string
  claimHash: string
  title: string
  url: string
  publisher: string
  date: string
  credibility?: number
}

// 사용자 입력 데이터 타입
export interface CompanyInfo {
  name: string
  bizNo?: string
  ceo?: string
  address?: string
  establishedYear?: number
  industry: string
  employees?: number
  capital?: number
}

export interface ProductInfo {
  name: string
  category: string
  description: string
  uniqueValue: string
  targetMarket: string
  developmentStage: string
}

export interface MarketInfo {
  kosisCodes?: string[]
  size: number
  growth: number
  competitors: string[]
  marketShare?: number
}

export interface FinanceInfo {
  sales5y: number[]
  profit5y?: number[]
  capex5y?: number[]
  funding?: number
  fundingStage?: string
}

export interface UserInputs {
  template: TemplateType
  title: string
  company: CompanyInfo
  product: ProductInfo  
  market: MarketInfo
  finance: FinanceInfo
  [key: string]: any
}

// 생성된 계획서 관련 타입
export interface PlanSection {
  code: string
  title: string
  content: string
  wordCount: number
  citations: string[]
  visualizations?: any[]
}

export interface BusinessPlan {
  id: string
  userId: string
  template: TemplateType
  title: string
  inputs: UserInputs
  sections: PlanSection[]
  status: 'draft' | 'generating' | 'completed' | 'error'
  version: number
  createdAt: Date
  updatedAt: Date
  citations: CitationSource[]
}