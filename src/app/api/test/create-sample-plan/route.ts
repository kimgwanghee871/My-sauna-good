import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { supabaseServer } from '@/lib/supabase-server'

// GET/POST /api/test/create-sample-plan - 테스트용 샘플 계획서 생성
export async function GET(request: NextRequest) {
  return await createSamplePlan(request)
}

export async function POST(request: NextRequest) {
  return await createSamplePlan(request)
}

async function createSamplePlan(request: NextRequest) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 요청 데이터 (GET/POST 모두 지원)
    let templateKey = 'investment'
    let planTitle = '샘플 사업계획서'
    
    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}))
      templateKey = body.templateKey || templateKey
      planTitle = body.planTitle || planTitle
    }
    
    const planId = `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 3. Supabase에 샘플 계획서 생성
    const supabase = supabaseServer()

    // 계획서 메타데이터 생성
    const { error: planError } = await supabase
      .from('business_plans')
      .insert({
        id: planId,
        user_id: session.user.email,
        template_key: templateKey,
        status: 'completed',
        title: planTitle,
        quality_score: 85,
        form_data: {
          companyName: '샘플 회사',
          problem: '시장의 문제점을 해결하는 혁신적인 솔루션이 필요합니다.',
          solution: 'AI 기반 솔루션으로 효율성을 크게 개선합니다.',
          targetCustomer: '중소기업 및 스타트업',
          competition: '기존 솔루션 대비 30% 성능 향상',
          bizModel: '구독 기반 SaaS 모델',
          fundingNeed: '시리즈 A 50억원',
          financeSnapshot: '전년 대비 200% 성장',
          roadmap: '6개월 내 베타 출시, 12개월 내 정식 서비스',
          team: 'CEO, CTO, 개발팀 5명',
          extraNotes: '테스트용 샘플 데이터입니다.'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (planError) {
      console.error('Plan creation error:', planError)
      return NextResponse.json(
        { success: false, message: '계획서 생성 실패' },
        { status: 500 }
      )
    }

    // 4. 샘플 섹션들 생성
    const sampleSections = [
      {
        plan_id: planId,
        section_index: 1,
        heading: '사업 개요',
        content: `# 사업 개요

${planTitle}는 혁신적인 AI 기반 솔루션을 제공하는 기술 회사입니다.

## 주요 특징
- 인공지능 기반 자동화 시스템
- 사용자 친화적 인터페이스  
- 확장 가능한 클라우드 아키텍처
- 실시간 데이터 분석 및 인사이트

## 비전
모든 기업이 AI의 혜택을 쉽게 누릴 수 있는 세상을 만들어갑니다.

*생성일: ${new Date().toLocaleString('ko-KR')}*`,
        status: 'completed'
      },
      {
        plan_id: planId,
        section_index: 2,
        heading: '시장 분석',
        content: `# 시장 분석

## 시장 규모
- 국내 AI 솔루션 시장: 연간 5조원 (2024년 기준)
- 예상 성장률: 연 25% 성장
- 목표 시장 점유율: 3% (1,500억원)

## 경쟁 환경
### 주요 경쟁사
1. **A사**: 기존 레거시 시스템 업체
2. **B사**: 글로벌 클라우드 서비스
3. **C사**: 국내 중견 솔루션 업체

### 경쟁 우위
- 특화된 AI 알고리즘으로 30% 높은 성능
- 한국어 자연어 처리에 최적화
- 중소기업 맞춤형 가격 정책

## 고객 분석
- **주 고객층**: 직원 50-500명 규모 중소기업
- **니즈**: 업무 자동화, 비용 절감, 효율성 향상
- **구매력**: 월 100-500만원 IT 투자 예산`,
        status: 'completed'
      },
      {
        plan_id: planId,
        section_index: 3,
        heading: '제품/서비스',
        content: `# 제품/서비스

## 핵심 제품: AI-Biz Platform

### 주요 기능
1. **스마트 문서 처리**
   - AI 기반 문서 자동 분류 및 요약
   - OCR + NLP 통합 처리
   - 99.5% 정확도 보장

2. **예측 분석 대시보드**
   - 실시간 비즈니스 메트릭 모니터링
   - 매출 예측 및 트렌드 분석
   - 맞춤형 인사이트 제공

3. **자동화 워크플로우**
   - 드래그 앤 드롭 워크플로우 편집기
   - 100+ 사전 구축된 템플릿
   - API 연동을 통한 외부 시스템 통합

### 기술 스택
- **AI/ML**: TensorFlow, PyTorch, Transformers
- **백엔드**: Node.js, Python, PostgreSQL  
- **프론트엔드**: React, TypeScript, Tailwind CSS
- **인프라**: AWS, Docker, Kubernetes

### 서비스 플랜
| 플랜 | 가격 | 기능 |
|------|------|------|
| 스타터 | 월 99만원 | 기본 AI 기능, 5명 사용자 |
| 프로 | 월 299만원 | 고급 분석, 20명 사용자 |
| 엔터프라이즈 | 협의 | 맞춤 개발, 무제한 사용자 |`,
        status: 'completed'
      },
      {
        plan_id: planId,
        section_index: 4,
        heading: '재무 계획',
        content: `# 재무 계획

## 매출 예측 (3개년)

### 2024년
- **목표 매출**: 15억원
- **주요 고객**: 중소기업 50개사
- **평균 객단가**: 월 250만원

### 2025년  
- **목표 매출**: 45억원 (200% 성장)
- **주요 고객**: 중소기업 150개사
- **신규 서비스**: 엔터프라이즈 플랜 출시

### 2026년
- **목표 매출**: 120억원 (167% 성장)
- **시장 확대**: 동남아시아 진출
- **기술 고도화**: GPT-5 기반 업그레이드

## 투자 유치 계획

### 시리즈 A (2024년 Q4)
- **목표 금액**: 50억원
- **용도**: 
  - 제품 개발 (60%): 30억원
  - 마케팅/영업 (25%): 12.5억원  
  - 인력 확충 (15%): 7.5억원

### 예상 투자자
- 국내 VC: 티몬투자, 스마일게이트인베스트먼트
- 전략적 투자자: 네이버, 카카오
- 정부 펀드: 한국벤처투자

## 손익 전망
- **2024년**: 매출 15억, 영업손실 10억 (투자 집행기)
- **2025년**: 매출 45억, 영업이익 5억 (흑자전환)  
- **2026년**: 매출 120억, 영업이익 25억 (본격 성장)`,
        status: 'completed'
      },
      {
        plan_id: planId,
        section_index: 5,
        heading: '팀 및 조직',
        content: `# 팀 및 조직

## 핵심 팀

### 김철수 - CEO
- **경력**: 전 네이버 AI Lab 팀장 (5년)
- **학력**: KAIST 컴퓨터공학 박사
- **전문분야**: AI 제품 기획 및 사업 개발
- **성과**: 네이버 파파고 초기 개발 주도

### 이영희 - CTO  
- **경력**: 전 삼성SDS 수석연구원 (8년)
- **학력**: 서울대 전기정보공학 석사
- **전문분야**: 대규모 AI 시스템 아키텍처
- **성과**: 삼성 Bixby 음성인식 엔진 개발

### 박민수 - CPO (Chief Product Officer)
- **경력**: 전 라인 프로덕트 매니저 (4년)  
- **학력**: 연세대 경영학과
- **전문분야**: UX/UI 설계, 제품 전략
- **성과**: 라인워크스 기업용 솔루션 PM

## 조직 구조 (현재 12명)

### 개발팀 (8명)
- **AI/ML 엔지니어**: 3명
- **백엔드 개발자**: 2명  
- **프론트엔드 개발자**: 2명
- **DevOps 엔지니어**: 1명

### 사업팀 (4명)  
- **영업/마케팅**: 2명
- **고객성공**: 1명
- **재무/운영**: 1명

## 향후 채용 계획

### 2024년 (목표: 20명)
- AI 연구원 2명 추가
- 엔터프라이즈 영업 전문가 2명
- 고객 지원팀 4명

### 2025년 (목표: 40명)
- 해외사업 전문가 3명  
- 품질보증(QA) 팀 5명
- 마케팅 전문가 3명
- 추가 개발인력 9명

## 기업문화 및 복지
- **유연 근무제**: 재택/출근 자유 선택
- **교육 지원**: 연 300만원 교육비 지원
- **성과 인센티브**: 분기별 성과급 지급
- **스톡옵션**: 전 직원 대상 제공`,
        status: 'completed'
      }
    ]

    const { error: sectionsError } = await supabase
      .from('business_plan_sections')
      .insert(
        sampleSections.map((section, index) => ({
          ...section,
          id: index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )

    if (sectionsError) {
      console.error('Sections creation error:', sectionsError)
      return NextResponse.json(
        { success: false, message: '섹션 생성 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '샘플 계획서가 생성되었습니다',
      planId,
      viewUrl: `/plans/${planId}`
    })

  } catch (error) {
    console.error('Sample plan creation error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}