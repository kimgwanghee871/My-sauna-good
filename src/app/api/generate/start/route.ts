// AI 오케스트레이션 시작 API 엔드포인트
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { startAIGeneration, type GenerationInput } from '@/lib/generator/ai-orchestrator'
import type { QnaInput, AttachmentFile } from '@/lib/schemas/qset.schema'
import type { TemplateKey } from '@/lib/generator/ai-orchestrator'

// Supabase 서버 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface StartGenerationRequest {
  templateKey: TemplateKey
  answers: QnaInput
  attachments?: AttachmentFile[]
  extraNotes?: string
}

interface StartGenerationResponse {
  success: boolean
  planId?: string
  message?: string
  error?: string
}

/**
 * POST /api/generate/start
 * AI 사업계획서 생성을 시작합니다
 */
export async function POST(req: NextRequest): Promise<NextResponse<StartGenerationResponse>> {
  try {
    // 1. 세션 확인
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 요청 데이터 파싱
    const body: StartGenerationRequest = await req.json()
    const { templateKey, answers, attachments = [], extraNotes = '' } = body

    // 3. 입력 검증
    const validationResult = validateGenerationInput(templateKey, answers)
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      )
    }

    // 4. 사용자 정보 조회
    const { data: user } = await supabase
      .from('user_generation_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // 5. 생성 제한 확인
    const limitCheck = checkGenerationLimits(user)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: limitCheck.reason },
        { status: 429 }
      )
    }

    // 6. 새 비즈니스 플랜 생성
    const planId = await createBusinessPlan(session.user.id!, templateKey, answers, attachments, extraNotes)
    if (!planId) {
      throw new Error('비즈니스 플랜 생성에 실패했습니다')
    }

    // 7. AI 생성 워커 큐에 추가 (비동기)
    const generationInput: GenerationInput = {
      planId,
      templateKey,
      answers,
      attachments,
      extraNotes
    }

    // 백그라운드에서 AI 생성 실행 (await 하지 않음)
    queueAIGeneration(generationInput).catch(error => {
      console.error('AI 생성 중 오류 발생:', error)
      // 에러 발생 시 플랜 상태를 failed로 변경
      supabase
        .from('business_plans')
        .update({ status: 'failed' })
        .eq('id', planId)
        .then(() => console.log(`Plan ${planId} marked as failed`))
    })

    // 8. 사용자 통계 업데이트
    await updateUserStats(session.user.id!)

    // 9. 즉시 응답 반환
    return NextResponse.json({
      success: true,
      planId,
      message: 'AI 생성이 시작되었습니다. 진행상황은 실시간으로 업데이트됩니다.'
    })

  } catch (error) {
    console.error('AI 생성 시작 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '서버 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}

/**
 * 입력 데이터 검증
 */
function validateGenerationInput(
  templateKey: string, 
  answers: QnaInput
): { valid: boolean; error?: string } {
  // 템플릿 키 검증
  const validTemplates: TemplateKey[] = ['government', 'investment', 'loan']
  if (!validTemplates.includes(templateKey as TemplateKey)) {
    return { valid: false, error: '유효하지 않은 템플릿입니다' }
  }

  // 필수 필드 검증
  const requiredFields: (keyof QnaInput)[] = [
    'companyName', 'problem', 'solution', 'targetCustomer', 
    'competition', 'bizModel', 'fundingNeed', 'financeSnapshot', 
    'roadmap', 'team'
  ]

  for (const field of requiredFields) {
    const value = answers[field]
    if (!value || (typeof value === 'string' && value.trim().length < 2)) {
      return { 
        valid: false, 
        error: `${field} 항목이 비어있거나 너무 짧습니다` 
      }
    }
  }

  return { valid: true }
}

/**
 * 사용자 생성 제한 확인
 */
function checkGenerationLimits(userStats: any): { allowed: boolean; reason?: string } {
  if (!userStats) {
    return { allowed: true } // 새 사용자는 허용
  }

  const { current_month_plans, monthly_plan_limit, plan_tier } = userStats

  // Free 플랜 제한
  if (plan_tier === 'free' && current_month_plans >= monthly_plan_limit) {
    return { 
      allowed: false, 
      reason: `무료 플랜 월 ${monthly_plan_limit}회 제한을 초과했습니다. 업그레이드 해주세요.` 
    }
  }

  // Pro/Enterprise는 높은 제한 (여기서는 간단히 100으로 설정)
  if (plan_tier !== 'free' && current_month_plans >= 100) {
    return { 
      allowed: false, 
      reason: '월 사용량을 초과했습니다. 고객지원에 문의해주세요.' 
    }
  }

  return { allowed: true }
}

/**
 * 새 비즈니스 플랜 생성
 */
async function createBusinessPlan(
  userId: string,
  templateKey: TemplateKey,
  answers: QnaInput,
  attachments: AttachmentFile[],
  extraNotes: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('business_plans')
      .insert({
        user_id: userId,
        template_key: templateKey,
        title: answers.companyName || `${templateKey} 사업계획서`,
        status: 'pending',
        answers,
        attachments,
        extra_notes: extraNotes,
        total_api_calls: 0,
        total_tokens_used: 0
      })
      .select('id')
      .single()

    if (error) {
      console.error('비즈니스 플랜 생성 오류:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('createBusinessPlan 오류:', error)
    return null
  }
}

/**
 * AI 생성을 비동기 큐에 추가
 */
async function queueAIGeneration(input: GenerationInput): Promise<void> {
  try {
    // 실제 환경에서는 Redis Queue나 Background Job을 사용
    // 여기서는 직접 실행 (프로덕션에서는 별도 워커 프로세스 필요)
    console.log(`AI 생성 시작: Plan ${input.planId}`)
    
    await startAIGeneration(input)
    
    console.log(`AI 생성 완료: Plan ${input.planId}`)
    
  } catch (error) {
    console.error(`AI 생성 실패: Plan ${input.planId}:`, error)
    
    // 실패 상태 업데이트
    await supabase
      .from('business_plans')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', input.planId)
    
    throw error
  }
}

/**
 * 사용자 사용량 통계 업데이트
 */
async function updateUserStats(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_generation_stats')
      .upsert({
        user_id: userId,
        current_month_plans: 1, // SQL에서 increment 로직 필요
        total_plans_created: 1
      }, {
        onConflict: 'user_id'
      })

    // 더 정확한 증가 연산을 위해 RPC 호출 (선택적)
    await supabase.rpc('increment_user_stats', { user_uuid: userId })

    if (error) {
      console.error('사용자 통계 업데이트 오류:', error)
    }
  } catch (error) {
    console.error('updateUserStats 오류:', error)
  }
}

/**
 * GET /api/generate/start (상태 확인용)
 * 현재 진행 중인 생성 작업 조회
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 사용자의 최근 생성 작업들 조회
    const { data: plans, error } = await supabase
      .from('business_plans')
      .select(`
        id,
        title,
        template_key,
        status,
        quality_score,
        total_api_calls,
        created_at,
        updated_at,
        completed_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      plans: plans || []
    })

  } catch (error) {
    console.error('생성 작업 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}