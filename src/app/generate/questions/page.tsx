import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import QuestionsForm from './QuestionsForm'
import { TEMPLATE_CONFIGS } from '../../../lib/schemas/template.schema'

// SSR 강제 설정
export const dynamic = 'force-dynamic'

type TemplateKey = 'government' | 'investment' | 'loan'
type SearchParams = { template?: string }

// ✅ Next.js 15 규약: searchParams는 Promise로 수신
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // 1. 세션 가드 (SSR)
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  // 2. searchParams Promise 해제
  const sp = await searchParams
  const templateKey = sp.template as TemplateKey | undefined

  // 3. 템플릿 파라미터 검증
  const allowedTemplates: TemplateKey[] = ['government', 'investment', 'loan']
  if (!templateKey || !allowedTemplates.includes(templateKey)) {
    redirect('/generate/template')
  }

  const template = TEMPLATE_CONFIGS[templateKey]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  사업계획서 질문 입력
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {template.title} 템플릿을 위한 기본 정보를 입력해주세요
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${template.color}-100 text-${template.color}-800`}>
                  {template.icon} {template.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">2</span>
                </div>
                <span className="ml-3 text-sm font-medium text-blue-600">질문 입력</span>
              </div>
            </li>
            <li className="relative">
              <div className="flex items-center ml-6">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">3</span>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-500">사업계획서 생성</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                기본 정보 입력
              </h2>
              <p className="text-sm text-gray-600">
                총 10개 질문에 답변해주시면 {template.title} 사업계획서가 자동 생성됩니다.
                작성 중인 내용은 자동으로 저장됩니다.
              </p>
            </div>
            
            {/* 질문 폼 */}
            <QuestionsForm templateKey={templateKey} />
          </div>
        </div>
      </div>
    </div>
  )
}