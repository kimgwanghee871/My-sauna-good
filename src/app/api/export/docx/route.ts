import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/supabase-server'

// DOCX 내보내기
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. planId 파라미터 추출
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'planId가 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    // 3. 계획서 및 소유권 확인
    const { data: plan, error: planError } = await supabase
      .from('business_plans')
      .select('id,user_id,title,template_key,created_at')
      .eq('id', planId)
      .maybeSingle()

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
      .select('section_index,heading,content,status')
      .eq('plan_id', planId)
      .order('section_index')

    if (sectionsError) {
      console.error('Sections fetch error:', sectionsError)
      return NextResponse.json(
        { success: false, message: '섹션 데이터를 조회할 수 없습니다' },
        { status: 500 }
      )
    }

    // 5. 간단한 텍스트 기반 DOCX 생성 (실제로는 docx 라이브러리 사용)
    const docxContent = generateDocxContent(plan, sections || [])

    // 6. 응답 헤더 설정
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(plan.title || '사업계획서')}.docx"`)

    // 실제로는 여기서 docx 바이너리를 생성해야 하지만,
    // 지금은 텍스트 파일로 대체 (추후 docx 라이브러리 적용)
    const textBuffer = Buffer.from(docxContent, 'utf-8')

    return new NextResponse(textBuffer, { headers })

  } catch (error) {
    console.error('DOCX export error:', error)
    return NextResponse.json(
      { success: false, message: '내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DOCX 컨텐츠 생성 (실제로는 docx 라이브러리 사용)
function generateDocxContent(plan: any, sections: any[]): string {
  const title = plan.title || `${plan.template_key} 사업계획서`
  const createdAt = new Date(plan.created_at).toLocaleDateString('ko-KR')

  let content = `
${title}

생성일: ${createdAt}
템플릿: ${plan.template_key}

==================================================

`

  sections.forEach((section, index) => {
    content += `
${section.section_index}. ${section.heading}

${section.status === 'completed' && section.content ? 
  section.content : 
  '[이 섹션은 아직 생성되지 않았습니다]'
}

--------------------------------------------------

`
  })

  content += `

이 문서는 AI 사업계획서 생성 시스템에 의해 자동으로 생성되었습니다.
생성일시: ${new Date().toLocaleString('ko-KR')}
`

  return content
}