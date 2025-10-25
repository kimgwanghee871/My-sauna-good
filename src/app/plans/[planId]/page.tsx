// src/app/plans/[planId]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { admin } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function PlanPage({ params }: { params: { planId: string } }) {
  const { planId } = params
  
  // 인증 확인
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=' + encodeURIComponent(`/plans/${planId}`))
  }
  
  console.log('🔍 [PlanPage] Route accessed:', {
    planId,
    user: session.user.email,
    timestamp: new Date().toISOString()
  })
  
  try {
    const { data: plan, error } = await admin()
      .from('plans')
      .select('id,user_id,template_key,title,status,created_at,quality_score')
      .eq('id', planId)
      .maybeSingle()

    console.log('[plans] planId=', planId, 'email=', session.user.email, 'dbError=', error, 'plan=', plan)

    if (!plan) return notFound()

    // 소유권 확인: email 또는 uid 매칭 허용 (임시 완화)
    const email = session.user.email
    const uid = (session.user as any)?.id
    const ownerOk = plan.user_id === email || (uid && plan.user_id === uid)
    
    if (!ownerOk) {
      console.warn('[plans] owner mismatch', { 
        plan_user_id: plan.user_id, 
        email, 
        uid,
        plan_title: plan.title 
      })
      return notFound()
    }
    
    console.log('✅ [PlanPage] Plan found successfully:', {
      planId,
      title: plan.title,
      status: plan.status
    })
    
    // 실제 사업계획서 뷰어 UI
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-gray-600 mt-1">사업계획서 ID: {planId}</p>
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {plan.status === 'completed' ? '완료됨' : '진행중'}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  생성일: {new Date(plan.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">템플릿 유형</h3>
                <p className="text-gray-700">{plan.template_key}</p>
              </div>
              
              {plan.quality_score && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">품질 점수</h3>
                  <p className="text-blue-700">{plan.quality_score}점</p>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  편집하기
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  PDF 다운로드
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  공유하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('💥 [PlanPage] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      planId
    })
    return notFound()
  }
}