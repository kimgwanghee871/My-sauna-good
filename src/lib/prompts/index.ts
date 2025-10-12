// 프롬프트 템플릿 관리
import { TemplateType, UserInputs } from '@/types/template'

// 시스템 프롬프트 (공통)
export const SYSTEM_PROMPT = `당신은 한국의 전문 사업계획서 작성 컨설턴트입니다. 

전문성 요구사항:
- 한국 중소기업 R&D, 투자심사, 금융심사 전문가 수준
- 정부정책, 산업동향, 투자시장에 대한 깊은 이해
- 결론형 문법 사용, 객관적이고 논리적인 서술
- 구체적 수치와 근거 제시 (출처 표기)

품질 기준:
- 섹션별 2,000자 내외 목표
- 표, 체크리스트, 단계별 계획 포함
- 한국 제도 및 용어 정확히 준수
- 수치 표기시 단위 명확히 명시

주의사항:
- 근거 없는 단정적 표현 금지
- "예상됨", "추정됨" 등 적절한 표현 사용
- 최신 법규, 정책 변경사항 주석 표기
- 검증 가능한 데이터만 인용`

// 템플릿별 특화 프롬프트
export const TEMPLATE_PROMPTS = {
  government: {
    system: `${SYSTEM_PROMPT}

정부지원 특화 요구사항:
- R&D 과제 평가 기준 반영 (기술성, 사업성, 파급효과)
- TRL(기술성숙도), BRL(사업성숙도) 개념 활용
- 정부정책 방향성과 부합도 강조
- 일자리 창출, 사회적 가치 등 공공성 부각
- KOSIS, K-ICT 통계 등 공신력 있는 데이터 인용`,
    
    tone: '공식적이고 체계적인 어조',
    focus: '기술력, 혁신성, 사회적 파급효과',
  },

  investment: {
    system: `${SYSTEM_PROMPT}

투자유치 특화 요구사항:
- VC/PE 심사 기준 반영 (팀, 시장, 제품, 비즈니스모델)
- TAM/SAM/SOM 시장분석 프레임워크 적용
- Unit Economics, LTV/CAC 등 핵심지표 제시
- 경쟁우위와 방어전략(Moat) 명확히 기술
- Exit 전략과 밸류에이션 합리적 추정
- 글로벌 사례와 벤치마킹 포함`,
    
    tone: '역동적이고 성장성 중심의 어조',
    focus: '성장성, 수익성, 확장성, 투자매력도',
  },

  loan: {
    system: `${SYSTEM_PROMPT}

대출심사 특화 요구사항:
- 금융기관 여신심사 기준 반영 (안정성, 상환능력)
- 재무비율 분석 (유동비율, 부채비율, 매출성장률 등)
- 현금흐름 예측과 상환계획 구체화
- 담보가치 평가와 리스크 요인 분석
- 업계 평균 대비 재무건전성 비교
- 보증기관 요구사항 반영 (신보, 기보 등)`,
    
    tone: '보수적이고 신중한 어조',
    focus: '안정성, 상환능력, 리스크 관리',
  },
}

// 섹션별 프롬프트 생성 함수
export function generateSectionPrompt(
  template: TemplateType,
  sectionCode: string,
  userInputs: UserInputs,
  sectionTitle: string,
  targetLength: number = 2000
): string {
  const templateConfig = TEMPLATE_PROMPTS[template]
  
  const basePrompt = `${templateConfig.system}

작성 요청:
섹션: ${sectionTitle}
목표 분량: ${targetLength}자 내외
작성 어조: ${templateConfig.tone}
중점 사항: ${templateConfig.focus}

입력 정보:
${JSON.stringify(userInputs, null, 2)}

작성 지침:
1. 제목은 포함하지 말고 본문만 작성
2. 목표 글자수 ${targetLength}자 내외로 작성
3. 구체적 수치와 근거 포함
4. 표나 리스트 형태로 정리가 필요한 부분은 마크다운 형식 사용
5. 전문적이면서도 이해하기 쉽게 작성
6. 출처가 필요한 부분은 [출처필요] 표기

특별 요구사항:
${getSectionSpecialRequirements(template, sectionCode)}`

  return basePrompt
}

// 섹션별 특별 요구사항
function getSectionSpecialRequirements(template: TemplateType, sectionCode: string): string {
  const requirements: Record<TemplateType, Record<string, string>> = {
    government: {
      summary: '사업 개요는 평가위원이 첫 번째로 보는 부분이므로 핵심 내용을 임팩트 있게 요약. 기술의 차별성과 사회적 가치를 부각.',
      technology: 'TRL 수준별 개발계획 구체화. 기존기술 대비 우수성을 정량적 지표로 제시. 특허 출원 계획 포함.',
      market_analysis: 'KOSIS 등 공신력 있는 통계 인용. 시장세분화와 타겟시장 규모 산정. 정부정책과의 부합성 강조.',
      rd_plan: '연차별 R&D 추진계획을 구체적으로 제시. 핵심성과지표(KPI) 설정. 위험요소와 대안 계획 포함.',
    },
    investment: {
      executive_summary: 'VC가 30초 내에 관심을 가질 수 있는 핵심 메시지 전달. Problem-Solution Fit과 Product-Market Fit 강조.',
      market_opportunity: 'TAM-SAM-SOM 분석으로 시장기회 정량화. 시장성장률과 진입전략 구체화.',
      traction_milestones: '핵심지표(MAU, ARR, LTV 등)의 성장 추이 제시. 고객 검증 사례와 레퍼런스 포함.',
      financial_projections: 'Unit Economics 기반 매출모델 설명. 5년 재무계획과 주요 가정사항 명시.',
    },
    loan: {
      business_overview: '안정적 사업모델과 지속가능성 강조. 기존 실적 기반의 신뢰성 있는 계획 제시.',
      financial_status: '최근 3년 재무실적 분석. 주요 재무비율과 업계 평균 비교. 재무건전성 입증.',
      repayment_plan: '월별 현금흐름 예측과 상환 시뮬레이션. 다양한 시나리오별 상환능력 분석.',
      risk_analysis: '사업 리스크 요인을 객관적으로 분석. 각 리스크별 구체적 대응방안과 contingency plan 제시.',
    },
  }

  return requirements[template]?.[sectionCode] || '해당 섹션의 목적과 특성에 맞게 전문적으로 작성하세요.'
}

// 일관성 검증 프롬프트
export function generateConsistencyCheckPrompt(sections: Array<{code: string, content: string}>): string {
  return `다음 사업계획서 섹션들의 일관성을 검토하고 개선사항을 제안해주세요:

${sections.map(section => `### ${section.code}\n${section.content}`).join('\n\n')}

검토 항목:
1. 수치의 일관성 (매출, 시장규모, 투자금액 등)
2. 시기와 일정의 일치성
3. 논리적 연결성과 흐름
4. 중복되거나 상충되는 내용
5. 전체적인 narrative의 완성도

JSON 형식으로 응답해주세요:
{
  "issues": [
    {
      "type": "숫자불일치|논리오류|중복내용|기타",
      "severity": "high|medium|low",
      "description": "문제 설명",
      "sections": ["관련 섹션들"],
      "suggestion": "개선 제안"
    }
  ],
  "overall_score": 85,
  "summary": "전체적인 평가 요약"
}`
}

// 품질 평가 프롬프트
export function generateQualityAssessmentPrompt(
  template: TemplateType, 
  fullContent: string
): string {
  return `다음 ${TEMPLATE_PROMPTS[template].focus} 중심의 사업계획서 품질을 평가해주세요:

${fullContent}

평가 기준:
1. 내용의 전문성과 완성도 (40점)
2. 논리적 구조와 흐름 (20점)
3. 구체성과 실행가능성 (20점)  
4. 차별화와 독창성 (20점)

JSON 형식으로 응답:
{
  "scores": {
    "professionalism": 85,
    "structure": 90,
    "specificity": 80,
    "uniqueness": 75
  },
  "total_score": 82.5,
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선사항1", "개선사항2"],
  "recommendations": "전체적인 개선 방향"
}`
}