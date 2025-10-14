export interface QnaInput {
  companyName: string;      // 회사/프로젝트명
  problem: string;          // 해결하려는 문제
  solution: string;         // 해결책/제품 설명
  targetCustomer: string;   // 목표 고객
  competition: string;      // 경쟁 현황 및 차별점
  bizModel: string;         // 수익 모델
  fundingNeed: string;      // 필요 자금 및 용도
  financeSnapshot: string;  // 재무 현황 요약
  roadmap: string;          // 추진 계획
  team: string;             // 팀 구성
}

// Schema definition for validation
export const QnaSchemaDefinition = {
  companyName: { min: 2, max: 100, required: true },
  problem: { min: 10, max: 1000, required: true },
  solution: { min: 10, max: 1000, required: true },
  targetCustomer: { min: 5, max: 500, required: true },
  competition: { min: 5, max: 800, required: true },
  bizModel: { min: 5, max: 600, required: true },
  fundingNeed: { min: 1, max: 500, required: true },
  financeSnapshot: { min: 1, max: 500, required: true },
  roadmap: { min: 5, max: 800, required: true },
  team: { min: 3, max: 500, required: true }
};

// Types for field configurations
type FieldKey = keyof QnaInput;
type TemplateKey = 'government' | 'investment' | 'loan';

interface FieldConfig {
  label: string;
  placeholder: string;
  hint: string;
}

// Template-specific field configurations
export const FIELD_CONFIGS: Record<TemplateKey, Partial<Record<FieldKey, FieldConfig>>> = {
  government: {
    problem: {
      label: '정책과제와의 부합 문제 정의',
      placeholder: '국가 정책 목표와 연계된 해결 과제를 구체적으로 기술하세요...',
      hint: '정부 정책 방향과 부합하는 사회적 문제나 기술적 과제를 명시'
    },
    fundingNeed: {
      label: '총사업비·정부지원금·민간부담금 개요',
      placeholder: '총 10억원 (정부지원 7억원, 민간부담 3억원) 장비구축 5억원, 인건비 3억원...',
      hint: '총사업비 구성 및 정부지원금 비율을 명시'
    }
  },
  investment: {
    problem: {
      label: '시장 기회 및 해결하려는 문제',
      placeholder: '기존 시장의 한계점과 우리가 발견한 비즈니스 기회를...',
      hint: '시장 규모와 성장 가능성을 함께 언급'
    },
    fundingNeed: {
      label: '투자 유치 규모 및 자금 사용 계획',
      placeholder: 'Series A 50억원 유치 예정, 마케팅 30억원, R&D 15억원...',
      hint: '투자 라운드, 투자 규모, 구체적 사용 용도'
    }
  },
  loan: {
    problem: {
      label: '사업 추진 배경 및 목적',
      placeholder: '기존 사업 확장을 위한 운영자금 및 시설투자가 필요한 상황...',
      hint: '대출이 필요한 사업적 배경과 목적을 설명'
    },
    fundingNeed: {
      label: '대출 희망 금액 및 상환 계획',
      placeholder: '운영자금 20억원, 3년 거치 7년 분할상환, 월 매출 10억원 기준...',
      hint: '대출 금액, 상환 방식, 상환 능력 근거'
    }
  }
} as const;