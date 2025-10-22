import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/export/docx?planId=xxx - DOCX 다운로드
export async function GET(request: NextRequest) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. planId 파라미터 확인
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'planId가 필요합니다' },
        { status: 400 }
      )
    }

    // 3. 소유권 확인 및 계획서 데이터 조회
    const supabase = supabaseServer()
    
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, user_id, title, template_key, created_at')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, message: '계획서를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (plan.user_id !== session.user.email) {
      return NextResponse.json(
        { success: false, message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 4. 섹션 데이터 조회
    const { data: sections, error: sectionsError } = await supabase
      .from('business_plan_sections')
      .select('section_index, heading, content, status')
      .eq('plan_id', planId)
      .eq('status', 'completed')
      .order('section_index')

    if (sectionsError) {
      console.error('Sections fetch error:', sectionsError)
      return NextResponse.json(
        { success: false, message: '섹션 데이터를 불러올 수 없습니다' },
        { status: 500 }
      )
    }

    // 5. DOCX 생성 (현재는 시뮬레이션 - 실제로는 docx 라이브러리 사용)
    const docxContent = generateDocxContent(plan, sections || [])
    
    // TODO: 실제 DOCX 생성 구현
    // const docx = new Document({
    //   sections: [{
    //     properties: {},
    //     children: docxContent
    //   }]
    // })
    
    // 현재는 텍스트 파일로 다운로드 (개발용)
    const textContent = generateTextContent(plan, sections || [])
    
    return new NextResponse(textContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${plan.title || '사업계획서'}_${new Date().toISOString().split('T')[0]}.txt"`
      }
    })

  } catch (error) {
    console.error('DOCX export error:', error)
    return NextResponse.json(
      { success: false, message: '내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DOCX 컨텐츠 생성 (미래 구현용)
function generateDocxContent(plan: any, sections: any[]) {
  // TODO: docx 라이브러리를 사용한 실제 DOCX 생성
  return []
}

// 텍스트 컨텐츠 생성 (현재 구현)
function generateTextContent(plan: any, sections: any[]): string {
  const lines = [
    `${plan.title || '사업계획서'}`,
    '='.repeat(50),
    '',
    `템플릿: ${plan.template_key}`,
    `생성일: ${new Date(plan.created_at).toLocaleDateString('ko-KR')}`,
    `내보내기일: ${new Date().toLocaleDateString('ko-KR')}`,
    '',
    '='.repeat(50),
    ''
  ]

  sections.forEach(section => {
    lines.push(`${section.section_index}. ${section.heading}`)
    lines.push('-'.repeat(30))
    lines.push('')
    lines.push(section.content || '내용이 없습니다.')
    lines.push('')
    lines.push('')
  })

  lines.push('='.repeat(50))
  lines.push('이 문서는 AI 사업계획서 생성기에 의해 작성되었습니다.')
  lines.push(`생성 시점: ${new Date().toLocaleString('ko-KR')}`)

  return lines.join('\n')
}