import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import PlanViewer from './PlanViewer'
import { supabaseServer } from '@/lib/supabase-server'

// SSR 강제 설정 (실시간 데이터 반영)
export const dynamic = 'force-dynamic'

interface PlanPageProps {
  params: Promise<{ planId: string }>
}

export default async function PlanPage({ params }: PlanPageProps) {
  // 1. 세션 확인
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login?reason=auth&redirect=/plans/' + encodeURIComponent((await params).planId))
  }

  const { planId } = await params

  // 2. 서버에서 소유권 1차 확인 (없으면 404로 숨김)
  const supabase = supabaseServer()
  const { data: plan, error } = await supabase
    .from('business_plans')
    .select('id,user_id,status,template_key,quality_score,title,created_at,updated_at')
    .eq('id', planId)
    .maybeSingle()

  if (error) {
    console.error('Plan fetch error:', error)
    redirect('/404')
  }

  if (!plan || plan.user_id !== session.user.email) {
    redirect('/404')
  }

  // 3. 계획서가 아직 생성 중이면 result 페이지로 리다이렉트
  if (plan.status === 'generating' || plan.status === 'pending') {
    redirect(`/generate/result?planId=${planId}&template=${plan.template_key}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {plan.title || `${plan.template_key} 사업계획서`}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>생성일: {new Date(plan.created_at).toLocaleDateString('ko-KR')}</span>
                  {plan.quality_score && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      품질: {plan.quality_score}/100
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                    plan.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status === 'completed' ? '완료' :
                     plan.status === 'error' ? '오류' : '진행중'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.history.back()}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PlanViewer 
          planId={planId} 
          templateKey={plan.template_key as 'government' | 'investment' | 'loan'}
          initialPlan={plan}
        />
      </div>
    </div>
  )
}