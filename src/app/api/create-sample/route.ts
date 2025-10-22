// 인증 없이 샘플 계획서 생성하는 API
import { NextRequest, NextResponse } from 'next/server'
import { admin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const planId = `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const testEmail = 'test@example.com' // 테스트용 이메일
    
    console.log('🔍 Creating sample plan:', planId)
    
    const supabase = admin()
    
    // 계획서 메타데이터 생성
    const { error: planError } = await supabase
      .from('plans')
      .insert({
        id: planId,
        user_id: testEmail,
        template_key: 'investment',
        status: 'completed',
        title: '테스트 사업계획서',
        quality_score: 85,
        form_data: {
          companyName: 'AI 테크 스타트업',
          problem: '시장의 문제점을 해결하는 혁신적인 솔루션이 필요합니다.',
          solution: 'AI 기반 솔루션으로 효율성을 크게 개선합니다.',
          targetCustomer: '중소기업 및 스타트업',
          competition: '기존 솔루션 대비 30% 성능 향상',
          bizModel: '구독 기반 SaaS 모델'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (planError) {
      console.error('Plan creation error:', planError)
      return NextResponse.json({
        success: false,
        message: '계획서 생성 실패',
        error: planError.message
      }, { status: 500 })
    }

    // 샘플 섹션 생성
    const { error: sectionsError } = await supabase
      .from('business_plan_sections')
      .insert([
        {
          plan_id: planId,
          section_index: 1,
          heading: '사업 개요',
          content: '# 사업 개요\n\n테스트용 사업계획서입니다.\n\n## 주요 특징\n- AI 기반 솔루션\n- 혁신적인 접근법\n- 확장 가능한 비즈니스 모델',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          plan_id: planId,
          section_index: 2,
          heading: '시장 분석',
          content: '# 시장 분석\n\n## 시장 규모\n- 국내 AI 솔루션 시장: 5조원\n- 연평균 성장률: 25%\n\n## 경쟁사 분석\n기존 경쟁사 대비 차별화된 기술력을 보유하고 있습니다.',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (sectionsError) {
      console.error('Sections creation error:', sectionsError)
    }

    console.log('✅ Sample plan created successfully:', planId)

    return NextResponse.json({
      success: true,
      message: '샘플 계획서가 생성되었습니다!',
      planId: planId,
      viewUrl: `/plans/${planId}`,
      testUrl: `https://my-sauna-good.vercel.app/plans/${planId}`
    })

  } catch (error) {
    console.error('Sample creation error:', error)
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}