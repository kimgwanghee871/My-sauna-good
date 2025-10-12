'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { templateMetadata } from '@/lib/templates'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-32">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 배지 */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 animate-fade-in">
            🚀 AI로 10분 만에 완성하는 전문 사업계획서
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
            <span className="block">AI가 만들어주는</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              사업계획서
            </span>
          </h1>

          {/* 서브 헤드라인 */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            정부지원, 투자유치, 대출용 템플릿으로 <br className="hidden sm:block" />
            <strong>10분 만에 30-50페이지</strong> 전문 사업계획서를 완성하세요
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link href="/generate">
              <Button size="xl" className="text-lg px-8 py-4">
                🎯 무료로 시작하기
              </Button>
            </Link>
            <Link href="/examples">
              <Button variant="outline" size="xl" className="text-lg px-8 py-4">
                📄 샘플 보기
              </Button>
            </Link>
          </div>

          {/* 템플릿 미리보기 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in">
            {templateMetadata.map((template) => (
              <div
                key={template.key}
                className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {template.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>
                <div className="text-xs text-gray-500">
                  {template.sampleUseCase}
                </div>
              </div>
            ))}
          </div>

          {/* 사용자 신뢰도 지표 */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              이미 <strong className="text-gray-900">1,000+</strong>개 기업이 선택한 AI 사업계획서
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">TIPS</div>
              <div className="text-2xl font-bold text-gray-400">K-Startup</div>
              <div className="text-2xl font-bold text-gray-400">신보</div>
              <div className="text-2xl font-bold text-gray-400">기보</div>
              <div className="text-2xl font-bold text-gray-400">VC협회</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}