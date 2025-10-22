import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { startBusinessPlanGeneration } from '@/lib/generator/orchestrator'
import { TemplateType, UserInputs } from '@/types/template'
import type { TemplateKey } from '@/lib/schemas/template.schema'
import type { QnaInput } from '@/lib/schemas/qset.schema'

// QnaInput을 UserInputs로 변환하는 함수
function mapQnaInputToUserInputs(templateKey: TemplateKey, qnaInput: QnaInput): UserInputs {
  // TemplateKey를 TemplateType으로 변환
  const template: TemplateType = templateKey as TemplateType

  return {
    template,
    title: qnaInput.companyName,
    company: {
      name: qnaInput.companyName,
      description: qnaInput.solution,
      history: '', // QnaInput에 없는 필드는 빈 문자열로 처리
      location: '',
      size: '',
      industry: ''
    },
    product: {
      name: qnaInput.companyName,
      description: qnaInput.solution,
      features: qnaInput.solution,
      benefits: qnaInput.solution,
      technology: '',
      development: qnaInput.roadmap
    },
    market: {
      size: '',
      growth: '',
      target: qnaInput.targetCustomer,
      competition: qnaInput.competition,
      analysis: qnaInput.competition,
      opportunity: qnaInput.problem
    },
    finance: {
      revenue: qnaInput.bizModel,
      costs: '',
      funding: qnaInput.fundingNeed,
      projections: qnaInput.financeSnapshot,
      breakeven: ''
    },
    // 추가 필드들을 QnaInput 데이터로 매핑
    problem: qnaInput.problem,
    solution: qnaInput.solution,
    targetCustomer: qnaInput.targetCustomer,
    competition: qnaInput.competition,
    bizModel: qnaInput.bizModel,
    fundingNeed: qnaInput.fundingNeed,
    financeSnapshot: qnaInput.financeSnapshot,
    roadmap: qnaInput.roadmap,
    team: qnaInput.team,
    attachments: qnaInput.attachments || [],
    extraNotes: qnaInput.extraNotes || ''
  }
}

export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 요청 데이터 파싱
    const body = await request.json()
    const { templateKey, answers, attachments, extraNotes }: {
      templateKey: TemplateKey
      answers: QnaInput
      attachments?: any[]
      extraNotes?: string
    } = body

    if (!templateKey || !answers) {
      return NextResponse.json(
        { success: false, error: '템플릿과 답변 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

    // QnaInput 검증 - 필수 필드 확인
    const requiredFields: (keyof QnaInput)[] = [
      'companyName', 'problem', 'solution', 'targetCustomer', 'competition',
      'bizModel', 'fundingNeed', 'financeSnapshot', 'roadmap', 'team'
    ]

    const missingFields = requiredFields.filter(field => {
      const value = answers[field]
      return !value || (typeof value === 'string' && value.trim().length < 2)
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 항목이 누락되었습니다.',
          missingFields 
        },
        { status: 400 }
      )
    }

    try {
      // QnaInput을 UserInputs로 변환
      const userInputs = mapQnaInputToUserInputs(templateKey, answers)
      
      // 사용자 ID 추출 (NextAuth에서 user.email을 ID로 사용)
      const userId = session.user.email || session.user.id || 'anonymous'

      // AI 생성 작업 시작
      const planId = await startBusinessPlanGeneration(
        templateKey as TemplateType, 
        userInputs, 
        userId
      )

      return NextResponse.json({
        success: true,
        message: '사업계획서 생성이 시작되었습니다.',
        planId,
        estimatedTime: '3-5분'
      })

    } catch (generationError) {
      console.error('Generation start failed:', generationError)
      
      // 구체적인 에러 메시지 제공
      let errorMessage = '생성 작업을 시작할 수 없습니다.'
      if (generationError instanceof Error) {
        errorMessage = generationError.message
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Generate Start API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
      { status: 500 }
    )
  }
}