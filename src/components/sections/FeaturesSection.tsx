'use client'

import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: '🤖',
    title: 'AI 자동 생성',
    description: '10문항만 답하면 AI가 30-50페이지 전문 사업계획서를 자동으로 생성합니다.',
    details: ['GPT-4 기반 고품질 내용', '업계 표준 양식 준수', '사실 기반 데이터 인용'],
  },
  {
    icon: '📋',
    title: '3종 전문 템플릿',
    description: '정부지원, 투자유치, 대출용으로 특화된 템플릿으로 목적에 맞는 계획서를 작성하세요.',
    details: ['정부과제 맞춤 양식', 'VC 투자심사 기준', '금융기관 대출심사 기준'],
  },
  {
    icon: '⚡',
    title: '10분 초고속 완성',
    description: '복잡한 사업계획서 작성이 이제 10분이면 충분합니다.',
    details: ['실시간 진행상황 확인', '섹션별 즉시 미리보기', '원클릭 PDF/DOCX 다운로드'],
  },
  {
    icon: '📊',
    title: '자동 차트 생성',
    description: '재무계획, 시장분석 등 필요한 차트와 표를 자동으로 생성합니다.',
    details: ['5개년 재무계획 차트', '시장규모 분석 그래프', '경쟁사 비교 표'],
  },
  {
    icon: '📚',
    title: '신뢰할 수 있는 출처',
    description: '모든 데이터와 주장에 대한 근거와 출처를 자동으로 인용합니다.',
    details: ['정부통계 자동 인용', '산업리포트 참조', '실시간 데이터 업데이트'],
  },
  {
    icon: '🔄',
    title: '유연한 수정',
    description: '섹션별 재생성과 실시간 편집으로 완벽한 사업계획서를 완성하세요.',
    details: ['섹션별 재생성 (0.2회 차감)', '실시간 편집기', '버전 관리 시스템'],
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            왜 G-Won AI를 선택해야 할까요?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            기존 방식으로는 몇 주가 걸리던 사업계획서 작성, 이제 AI가 해결해드립니다.
          </p>
        </div>

        {/* 기능 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 작업 프로세스 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              간단한 3단계로 완성
            </h3>
            <p className="text-gray-600">
              복잡한 과정 없이 누구나 쉽게 전문 사업계획서를 만들 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                템플릿 선택
              </h4>
              <p className="text-gray-600">
                정부지원, 투자유치, 대출 중 목적에 맞는 템플릿을 선택하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                정보 입력
              </h4>
              <p className="text-gray-600">
                10개 핵심 질문에 답하면 AI가 이를 바탕으로 분석을 시작합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                즉시 완성
              </h4>
              <p className="text-gray-600">
                10분 후 전문적인 사업계획서가 완성됩니다. PDF/DOCX로 다운로드하세요.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8">
              지금 바로 체험해보기 →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}