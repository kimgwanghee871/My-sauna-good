'use client'

import { useState } from 'react'
import { PricingPlan } from '@/lib/config'
import { formatPrice } from '@/lib/config'

interface PlanComparisonProps {
  plans: PricingPlan[]
  isAnnual: boolean
  annualDiscount: number
}

export default function PlanComparison({ 
  plans, 
  isAnnual, 
  annualDiscount 
}: PlanComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const features = [
    { key: 'credits', label: '월 생성 횟수', getValue: (plan: PricingPlan) => `${plan.credits}회` },
    { key: 'overage', label: '초과 생성', getValue: () => '1회 9,900원' },
    { key: 'rollover', label: '크레딧 이월', getValue: (plan: PricingPlan) => plan.id === 'free' ? '미지원' : '50%' },
    { key: 'viz', label: '시각화 종류', getValue: (plan: PricingPlan) => `${plan.viz}종` },
    { key: 'verify', label: '인용/검증', getValue: (plan: PricingPlan) => {
      const verifyLabels = {
        basic: '기본',
        link: '링크검증',
        link404: '링크+404검증', 
        alt: '대체출처검증'
      }
      return verifyLabels[plan.verify as keyof typeof verifyLabels] || plan.verify
    }},
    { key: 'watermark', label: '워터마크', getValue: (plan: PricingPlan) => plan.watermark ? '포함' : '없음' },
    { key: 'export', label: 'Export', getValue: () => 'DOCX/PDF' },
    { key: 'support', label: '지원', getValue: (plan: PricingPlan) => {
      if (plan.id === 'free') return '커뮤니티'
      if (plan.id === 'pro') return '우선 지원'
      return '이메일 지원'
    }}
  ]

  return (
    <div className="mt-12">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-900">상세 기능 비교</span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b">
                  기능
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 border-b border-l">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPrice(plan.price)}{plan.price > 0 && '/월'}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 border-b">
                    {feature.label}
                  </td>
                  {plans.map((plan) => (
                    <td key={`${plan.id}-${feature.key}`} className="px-6 py-4 text-center text-sm text-gray-600 border-b border-l">
                      {feature.getValue(plan)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}