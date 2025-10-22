// 실시간 진행률 및 결과 페이지
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import GenerationResultClient from './GenerationResultClient'

// SSR 강제 설정
export const dynamic = 'force-dynamic'

interface SearchParams {
  template?: string
  plan?: string
}

export default async function GenerationResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // 1. 세션 확인
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  // 2. 검색 파라미터 해제
  const sp = await searchParams
  const { template, plan } = sp

  // 3. 파라미터 검증
  if (!template || !plan) {
    redirect('/generate/template')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  사업계획서 생성
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  AI가 전문적인 사업계획서를 생성하고 있습니다
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template} 템플릿
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GenerationResultClient planId={plan} templateKey={template as any} />
      </div>
    </div>
  )
}