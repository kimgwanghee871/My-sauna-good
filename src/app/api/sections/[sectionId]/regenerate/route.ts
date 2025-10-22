import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// POST /api/sections/[sectionId]/regenerate - 섹션 재생성
export async function POST(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const { sectionId } = params
    
    if (!sectionId) {
      return NextResponse.json(
        { success: false, message: '섹션 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 2. 소유권 확인 및 섹션 정보 조회
    const supabase = supabaseServer()
    
    const { data: section, error: fetchError } = await supabase
      .from('business_plan_sections')
      .select(`
        id, 
        plan_id, 
        section_index, 
        heading,
        business_plans!inner(user_id, template_key, form_data)
      `)
      .eq('id', sectionId)
      .single()

    if (fetchError || !section) {
      return NextResponse.json(
        { success: false, message: '섹션을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 소유권 검증
    const planOwner = (section as any).business_plans?.user_id
    if (planOwner !== session.user.email) {
      return NextResponse.json(
        { success: false, message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 3. 크레딧 확인 (추후 구현 - 지금은 시뮬레이션)
    // TODO: 사용자 크레딧 확인 및 차감 로직
    const hasCredits = true // 임시로 true
    
    if (!hasCredits) {
      return NextResponse.json(
        { success: false, message: '크레딧이 부족합니다', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      )
    }

    // 4. 재생성 상태로 업데이트
    const { error: statusUpdateError } = await supabase
      .from('business_plan_sections')
      .update({
        status: 'generating',
        content: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (statusUpdateError) {
      console.error('Status update error:', statusUpdateError)
      return NextResponse.json(
        { success: false, message: '상태 업데이트 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // 5. 비동기 재생성 작업 시작 (백그라운드)
    startSectionRegeneration(
      sectionId,
      (section as any).business_plans?.template_key,
      (section as any).business_plans?.form_data,
      section.section_index,
      section.heading
    )

    return NextResponse.json({
      success: true,
      message: '섹션 재생성이 시작되었습니다',
      sectionId,
      estimatedTime: '30-60초'
    })

  } catch (error) {
    console.error('Section regenerate API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 비동기 재생성 작업 (백그라운드 실행)
async function startSectionRegeneration(
  sectionId: string,
  templateKey: string,
  formData: any,
  sectionIndex: number,
  heading: string
) {
  try {
    // TODO: 실제 AI 재생성 로직 연결
    // const { regenerateSection } = await import('@/lib/generator/ai-orchestrator')
    // const newContent = await regenerateSection(templateKey, formData, sectionIndex, heading)
    
    // 현재는 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000)) // 3초 대기
    
    const simulatedContent = `[재생성됨] ${heading}\n\n이 섹션은 AI에 의해 재생성되었습니다. 실제 구현에서는 여기에 새로운 내용이 생성됩니다.\n\n생성 시간: ${new Date().toLocaleString('ko-KR')}`

    // 완료 상태로 업데이트
    const supabase = supabaseServer()
    const { error: completeError } = await supabase
      .from('business_plan_sections')
      .update({
        status: 'completed',
        content: simulatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (completeError) {
      console.error('Regeneration completion error:', completeError)
      
      // 실패 상태로 업데이트
      await supabase
        .from('business_plan_sections')
        .update({
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId)
    }

  } catch (error) {
    console.error('Background regeneration error:', error)
    
    // 실패 상태로 업데이트
    const supabase = supabaseServer()
    await supabase
      .from('business_plan_sections')
      .update({
        status: 'error',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)
  }
}