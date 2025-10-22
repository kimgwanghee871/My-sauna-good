import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// ⚡ CRITICAL: Force Node.js runtime for Supabase operations
export const runtime = 'nodejs'

// PUT /api/sections/[sectionId] - 섹션 편집
export async function PUT(
  _req: Request, 
  { params }: { params: Promise<{ sectionId: string }> }
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

    const { sectionId } = await params
    if (!sectionId) {
      return NextResponse.json({ error: 'missing sectionId' }, { status: 400 })
    }

    const { content } = await _req.json()
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: '내용이 필요합니다' },
        { status: 400 }
      )
    }

    // 2. 소유권 확인 및 업데이트
    const supabase = supabaseServer()
    
    // 먼저 섹션 소유권 확인
    const { data: section, error: fetchError } = await supabase
      .from('business_plan_sections')
      .select('id, plan_id, business_plans!inner(user_id)')
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

    // 3. 섹션 업데이트
    const { error: updateError } = await supabase
      .from('business_plan_sections')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (updateError) {
      console.error('Section update error:', updateError)
      return NextResponse.json(
        { success: false, message: '업데이트 중 오류가 발생했습니다' },
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