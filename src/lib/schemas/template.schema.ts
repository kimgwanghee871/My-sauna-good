export type TemplateKey = 'government' | 'investment' | 'loan';

export interface TemplateMeta {
  key: TemplateKey;
  title: string;
  description: string;
  sectionsCommon: string[];    // 공통 15섹션 코드
  sectionsExtra: string[];     // 템플릿별 추가 5섹션 코드
  icon?: string;               // 아이콘 클래스명
  color?: string;              // 테마 컬러
}

export const TEMPLATE_CONFIGS: Record<TemplateKey, TemplateMeta> = {
  government: {
    key: 'government',
    title: '정부지원사업용',
    description: '정부 R&D 과제, 창업지원 사업 등 공공기관 제출용 사업계획서를 작성합니다.',
    sectionsCommon: [
      'summary', 'company_overview', 'problem_definition', 'goals_effects', 'product_service',
      'technology_solution', 'market_analysis', 'strategy_plan', 'team_organization', 'budget_finance',
      'schedule_milestone', 'risk_management', 'implementation_plan', 'monitoring_evaluation', 'expected_outcomes'
    ],
    sectionsExtra: [
      'policy_alignment', 'government_support_request', 'consortium_structure', 
      'regulatory_compliance', 'policy_impact_analysis'
    ],
    icon: '🏛️',
    color: 'blue'
  },
  investment: {
    key: 'investment',
    title: '투자유치용',
    description: '벤처캐피털, 엔젤투자 등 투자 유치를 위한 비즈니스 플랜을 작성합니다.',
    sectionsCommon: [
      'summary', 'company_overview', 'problem_definition', 'goals_effects', 'product_service',
      'technology_solution', 'market_analysis', 'strategy_plan', 'team_organization', 'budget_finance',
      'schedule_milestone', 'risk_management', 'business_model', 'competitive_advantage', 'growth_strategy'
    ],
    sectionsExtra: [
      'investment_terms', 'valuation_analysis', 'ownership_structure', 
      'exit_strategy', 'roi_projections'
    ],
    icon: '💰',
    color: 'green'
  },
  loan: {
    key: 'loan',
    title: '대출심사용',
    description: '은행, 보증기관 등 금융기관 대출 심사를 위한 사업계획서를 작성합니다.',
    sectionsCommon: [
      'summary', 'company_overview', 'problem_definition', 'goals_effects', 'product_service',
      'technology_solution', 'market_analysis', 'strategy_plan', 'team_organization', 'budget_finance',
      'schedule_milestone', 'risk_management', 'financial_stability', 'revenue_model', 'debt_management'
    ],
    sectionsExtra: [
      'collateral_assets', 'repayment_plan', 'financial_statements', 
      'credit_rating_info', 'loan_amount_calculation'
    ],
    icon: '🏦',
    color: 'purple'
  }
};