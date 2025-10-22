import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { QnaInput } from '@/lib/schemas/qset.schema'
import { TemplateKey } from '@/lib/schemas/template.schema'

export async function POST(request: NextRequest) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 요청 데이터 파싱
    const body = await request.json()
    const { templateKey, formData }: { 
      templateKey: TemplateKey, 
      formData: QnaInput 
    } = body

    if (!templateKey || !formData) {
      return NextResponse.json(
        { success: false, message: '템플릿 키와 폼 데이터가 필요합니다' },
        { status: 400 }
      )
    }

    // 3. 폼 데이터 검증
    const requiredFields: (keyof QnaInput)[] = [
      'companyName', 'problem', 'solution', 'targetCustomer', 'competition',
      'bizModel', 'fundingNeed', 'financeSnapshot', 'roadmap', 'team'
    ]

    const missingFields = requiredFields.filter(field => {
      const value = formData[field]?.toString().trim()
      return !value || value.length < 2
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: '필수 항목이 누락되었습니다',
          missingFields
        },
        { status: 400 }
      )
    }

    // 4. 간단한 planId 생성 (개발 단계)
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 5. localStorage에 데이터 저장 준비 (클라이언트에서 수행)
    console.log('Plan generation started:', { planId, templateKey, userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: '사업계획서 생성이 시작되었습니다',
      planId,
      templateKey,
      estimatedTime: '3-5분'
    })

  } catch (error) {
    console.error('Generate start API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

