// AI 생성 결과 페이지 - 실시간 진행률과 최종 결과 표시
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import ResultViewer from './ResultViewer'

// SSR 강제 설정
export const dynamic = 'force-dynamic'

type SearchParams = { template?: string; plan?: string }

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // 1. 세션 확인
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  // 2. searchParams Promise 해제
  const sp = await searchParams
  const templateKey = sp.template
  const planId = sp.plan

  // 3. 필수 파라미터 검증
  if (!templateKey || !planId) {
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
                  AI 사업계획서 생성
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  고품질 사업계획서가 생성되고 있습니다
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {templateKey} 템플릿
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            <li className="relative">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">템플릿 선택</span>
              </div>
            </li>
            <li className="relative">
              <div className="flex items-center ml-6">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">질문 입력</span>
              </div>
            </li>
            <li className="relative">
              <div className="flex items-center ml-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">3</span>
                </div>
                <span className="ml-3 text-sm font-medium text-blue-600">사업계획서 생성</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <ResultViewer planId={planId} templateKey={templateKey} />
      </div>
    </div>
  )
}