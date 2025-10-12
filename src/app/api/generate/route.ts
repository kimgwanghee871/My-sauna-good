import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { deductCredits } from '@/lib/db/users'
import { startBusinessPlanGeneration } from '@/lib/generator/orchestrator'
import { validateTemplateInputs } from '@/lib/templates'
import { TemplateType, UserInputs } from '@/types/template'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 요청 데이터 파싱
    const body = await request.json()
    const { template, inputs }: { template: TemplateType, inputs: UserInputs } = body

    if (!template || !inputs) {
      return NextResponse.json(
        { success: false, message: '템플릿과 입력 데이터가 필요합니다' },
        { status: 400 }
      )
    }

    // 입력 데이터 검증
    const validation = validateTemplateInputs(template, inputs)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: '입력 데이터가 유효하지 않습니다',
          errors: validation.errors,
          missingFields: validation.missingFields
        },
        { status: 400 }
      )
    }

    // 크레딧 차감 (1회 차감)
    const creditDeducted = deductCredits(payload.userId, 1)
    if (!creditDeducted) {
      return NextResponse.json(
        { success: false, message: '크레딧이 부족합니다' },
        { status: 402 }
      )
    }

    try {
      // 생성 작업 시작
      const jobId = await startBusinessPlanGeneration(template, inputs, payload.userId)

      return NextResponse.json({
        success: true,
        message: '사업계획서 생성이 시작되었습니다',
        jobId,
        estimatedTime: '3-5분',
      })

    } catch (generationError) {
      // 생성 실패시 크레딧 복원
      // addCredits(payload.userId, 1) // TODO: 구현 필요
      
      console.error('Generation start failed:', generationError)
      return NextResponse.json(
        { 
          success: false, 
          message: '생성 작업을 시작할 수 없습니다',
          error: generationError instanceof Error ? generationError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Generate API Error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}