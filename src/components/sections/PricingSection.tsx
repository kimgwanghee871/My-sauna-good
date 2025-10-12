'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const pricingPlans = [
  {
    name: 'Free',
    price: '무료',
    period: '',
    description: '서비스를 체험해보고 싶은 분들을 위한 플랜',
    features: [
      '월 1회 생성',
      '모든 템플릿 이용 가능',
      'PDF/DOCX 다운로드',
      '워터마크 포함',
      '기본 고객지원',
    ],
    limitations: [
      '월 1회 제한',
      '워터마크 포함',
      '우선순위 낮은 큐',
    ],
    cta: '무료 체험하기',
    popular: false,
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '29,000',
    period: '월',
    description: '개인 창업자와 소규모 팀을 위한 플랜',
    features: [
      '월 20회 생성',
      '모든 템플릿 이용 가능',
      'PDF/DOCX 다운로드 (워터마크 없음)',
      '섹션별 재생성',
      '우선 처리 큐',
      '이메일 지원',
      '템플릿 커스터마이징',
    ],
    limitations: [],
    cta: '지금 시작하기',
    popular: true,
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Business',
    price: '89,000',
    period: '월',
    description: '중소기업과 전문가를 위한 플랜',
    features: [
      '월 100회 생성',
      '모든 템플릿 이용 가능',
      '팀 계정 (최대 5명)',
      '고급 분석 및 인사이트',
      '전담 고객 성공 매니저',
      '우선 지원 (24시간 내 응답)',
      '사용자 정의 브랜딩',
      '고급 내보내기 옵션',
    ],
    limitations: [],
    cta: '팀으로 시작하기',
    popular: false,
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Enterprise',
    price: '맞춤',
    period: '상담',
    description: '대기업과 기관을 위한 맞춤형 솔루션',
    features: [
      '무제한 생성',
      '전용 서버 구축',
      '맞춤형 템플릿 개발',
      'API 연동',
      '온프레미스 배포',
      '전담 기술 지원',
      '맞춤형 교육 및 컨설팅',
      'SLA 보장',
    ],
    limitations: [],
    cta: '상담 문의',
    popular: false,
    ctaVariant: 'outline' as const,
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            합리적인 요금제
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            생성 횟수 기준의 명확한 요금제로 필요한 만큼만 사용하세요. <br className="hidden sm:block" />
            언제든지 업그레이드하거나 취소할 수 있습니다.
          </p>

          {/* 연간/월간 토글 */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              월간 결제
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              연간 결제 <span className="text-green-600 font-semibold">(20% 할인)</span>
            </span>
          </div>
        </div>

        {/* 요금제 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    가장 인기
                  </span>
                </div>
              )}

              {/* 플랜 헤더 */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">
                      /{plan.period}
                      {isAnnual && plan.price !== '무료' && plan.price !== '맞춤' && (
                        <span className="block text-sm text-green-600">
                          연간 결제시 {Math.floor(parseInt(plan.price.replace(',', '')) * 0.8).toLocaleString()}원
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {plan.limitations.map((limitation, limitIndex) => (
                  <li key={`limit-${limitIndex}`} className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    {limitation}
                  </li>
                ))}
              </ul>

              {/* CTA 버튼 */}
              <Button
                variant={plan.ctaVariant}
                fullWidth
                className={plan.popular ? 'text-lg' : ''}
              >
                {plan.cta}
              </Button>

              {/* 무료 체험 안내 */}
              {plan.name !== 'Free' && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  7일 무료 체험 가능
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            자주 묻는 질문
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                생성 횟수는 어떻게 계산되나요?
              </h4>
              <p className="text-gray-600 text-sm">
                완전한 사업계획서 1개 생성시 1회로 계산됩니다. 섹션별 재생성은 0.2회씩 차감됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                요금제는 언제든 변경할 수 있나요?
              </h4>
              <p className="text-gray-600 text-sm">
                네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경사항은 다음 결제일부터 적용됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                환불 정책은 어떻게 되나요?
              </h4>
              <p className="text-gray-600 text-sm">
                7일 무료 체험 기간 내에 취소하면 전액 환불됩니다. 이후에는 사용하지 않은 기간에 대해 부분 환불 가능합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                기업용 맞춤 서비스도 가능한가요?
              </h4>
              <p className="text-gray-600 text-sm">
                Enterprise 플랜으로 전용 서버, 맞춤 템플릿, API 연동 등 다양한 맞춤 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 보장 */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
            ✅ 7일 무료 체험 보장 | 🔒 안전한 결제 | 📞 24/7 고객지원
          </div>
        </div>
      </div>
    </section>
  )
}