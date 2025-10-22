import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// 섹션 재생성
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const { sectionId } = await context.params
    const supabase = supabaseServer()

    // 2. 섹션 및 소유권 확인
    const { data: section, error: sectionError } = await supabase
      .from('business_plan_sections')
      .select(`
        id,
        plan_id,
        section_index,
        heading,
        business_plans!inner(
          user_id,
          template_key,
          form_data
        )
      `)
      .eq('id', sectionId)
      .maybeSingle()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, message: '섹션을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const businessPlan = section.business_plans as any
    if (businessPlan.user_id !== session.user.email) {
      return NextResponse.json(
        { success: false, message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 3. 크레딧 확인 (임시로 항상 통과)
    // TODO: 실제 크레딧 시스템 구현시 활성화
    // const hasCredits = await checkUserCredits(session.user.email)
    // if (!hasCredits) {
    //   return NextResponse.json(
    //     { success: false, message: '크레딧이 부족합니다' },
    //     { status: 402 }
    //   )
    // }

    // 4. 섹션을 생성 중 상태로 변경
    const { error: statusUpdateError } = await supabase
      .from('business_plan_sections')
      .update({ 
        status: 'generating',
        content: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (statusUpdateError) {
      console.error('Section status update error:', statusUpdateError)
      return NextResponse.json(
        { success: false, message: '섹션 상태 업데이트에 실패했습니다' },
        { status: 500 }
      )
    }

    // 5. 백그라운드에서 재생성 작업 시작 (실제로는 큐 시스템 사용)
    startSectionRegenerationAsync(
      sectionId, 
      section.plan_id, 
      section.section_index,
      section.heading,
      businessPlan.template_key,
      businessPlan.form_data
    )

    return NextResponse.json({
      success: true,
      message: '섹션 재생성이 시작되었습니다',
      sectionId,
      estimatedTime: '30초-1분'
    })

  } catch (error) {
    console.error('Section regenerate API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 백그라운드 재생성 작업 (시뮬레이션)
async function startSectionRegenerationAsync(
  sectionId: string,
  planId: string,
  sectionIndex: number,
  heading: string,
  templateKey: string,
  formData: any
) {
  try {
    // 실제로는 AI 오케스트레이터를 호출하여 섹션을 재생성
    // 여기서는 시뮬레이션으로 처리
    
    console.log('Starting section regeneration:', {
      sectionId,
      planId,
      sectionIndex,
      heading,
      templateKey
    })

    // 시뮬레이션: 5-15초 대기
    const delay = Math.random() * 10000 + 5000
    await new Promise(resolve => setTimeout(resolve, delay))

    // 샘플 컨텐츠 생성 (실제로는 AI가 생성)
    const sampleContent = generateSampleContent(heading, templateKey, formData)

    // 섹션 완료 상태로 업데이트
    const supabase = supabaseServer()
    const { error } = await supabase
      .from('business_plan_sections')
      .update({
        content: sampleContent,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (error) {
      console.error('Section completion update error:', error)
      
      // 오류 상태로 업데이트
      await supabase
        .from('business_plan_sections')
        .update({
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId)
    } else {
      console.log('Section regeneration completed:', sectionId)
    }

  } catch (error) {
    console.error('Section regeneration background error:', error)
    
    // 오류 발생시 상태 업데이트
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

// 샘플 컨텐츠 생성 (실제로는 AI가 생성)
function generateSampleContent(heading: string, templateKey: string, formData: any): string {
  const companyName = formData?.companyName || '회사명'
  const businessModel = formData?.bizModel || '비즈니스 모델'
  
  return `
🔄 AI가 재생성한 ${heading}

${companyName}의 ${heading.toLowerCase()}에 대한 분석입니다.

주요 내용:
• ${businessModel}을 기반으로 한 전략적 접근
• ${templateKey} 템플릿에 최적화된 구조
• 시장 동향과 경쟁 환경을 반영한 실행 계획

이 섹션은 AI에 의해 자동으로 재생성되었습니다.
생성 시간: ${new Date().toLocaleString('ko-KR')}

[실제 구현시에는 여기에 AI가 생성한 상세한 내용이 포함됩니다]
`.trim()
}