export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import TemplateSelector from './TemplateSelector'

export default async function TemplatePage() {
  // SSR 세션 가드
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                사업계획서 템플릿 선택
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                목적에 맞는 사업계획서 템플릿을 선택해주세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center">
            <li className="relative">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">1</span>
                </div>
                <span className="ml-3 text-sm font-medium text-blue-600">템플릿 선택</span>
              </div>
            </li>
            <li className="relative">
              <div className="flex items-center ml-8">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">2</span>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500">질문 입력</span>
              </div>
            </li>
            <li className="relative">
              <div className="flex items-center ml-8">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">3</span>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500">사업계획서 생성</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 템플릿 선택기 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TemplateSelector />
      </div>
    </div>
  )
}