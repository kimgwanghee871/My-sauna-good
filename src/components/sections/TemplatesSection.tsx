'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { templateMetadata } from '@/lib/templates'

export function TemplatesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            목적에 맞는 전문 템플릿
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            각 분야 전문가와 함께 개발한 검증된 템플릿으로 <br className="hidden sm:block" />
            심사관이 원하는 정확한 양식을 제공합니다.
          </p>
        </div>

        {/* 템플릿 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {templateMetadata.map((template, index) => (
            <div 
              key={template.key}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* 카드 헤더 */}
              <div className={`${template.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className="text-8xl">{template.icon}</div>
                </div>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                  <p className="text-lg opacity-90">{template.description}</p>
                </div>
              </div>

              {/* 카드 바디 */}
              <div className="p-6">
                {/* 주요 기능 */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">주요 기능</h4>
                  <ul className="space-y-2">
                    {template.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 적용 사례 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    적용 사례
                  </h4>
                  <p className="text-sm text-gray-600">{template.sampleUseCase}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <Link href={`/generate?template=${template.key}`} className="flex-1">
                    <Button fullWidth>
                      이 템플릿으로 시작
                    </Button>
                  </Link>
                  <Link href={`/templates/${template.key}`}>
                    <Button variant="outline" size="md" className="px-3">
                      상세보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 비교 표 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <h3 className="text-2xl font-bold text-center">템플릿 비교</h3>
            <p className="text-center text-gray-300 mt-2">어떤 템플릿을 선택해야 할지 모르겠다면?</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">구분</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">정부지원용</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">투자유치용</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">대출용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">주요 대상</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">정부기관, 공공기관</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">VC, PE, 엔젤투자자</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">은행, 보증기금</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">핵심 포인트</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">기술력, 사회적 가치</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">성장성, 수익성</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">안정성, 상환능력</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">페이지 수</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">30-40페이지</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">40-50페이지</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">25-35페이지</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">소요 시간</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">8-12분</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">10-15분</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">6-10분</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            어떤 템플릿이 적합한지 확실하지 않나요?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              📞 전문가 상담 (무료)
            </Button>
            <Link href="/generate">
              <Button size="lg">
                🎯 일단 체험해보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}