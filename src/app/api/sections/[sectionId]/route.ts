import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// 섹션 수정
export async function PUT(
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
    const body = await request.json()
    const { content } = body

    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 내용입니다' },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    // 2. 섹션 소유권 확인
    const { data: section, error: sectionError } = await supabase
      .from('business_plan_sections')
      .select('id,plan_id,business_plans!inner(user_id)')
      .eq('id', sectionId)
      .maybeSingle()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, message: '섹션을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // TypeScript 타입 안전성을 위한 타입 단언
    const businessPlan = section.business_plans as any
    if (businessPlan.user_id !== session.user.email) {
      return NextResponse.json(
        { success: false, message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 3. 섹션 내용 업데이트
    const { error: updateError } = await supabase
      .from('business_plan_sections')
      .update({ 
        content,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (updateError) {
      console.error('Section update error:', updateError)
      return NextResponse.json(
        { success: false, message: '섹션 업데이트에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '섹션이 성공적으로 업데이트되었습니다'
    })

  } catch (error) {
    console.error('Section update API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}