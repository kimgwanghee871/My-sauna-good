'use client'

import { useState } from 'react'
import { PricingPlan } from '@/lib/config'
import { formatPrice, getAnnualPrice } from '@/lib/config'

interface PlanCardProps {
  plan: PricingPlan
  isAnnual: boolean
  annualDiscount: number
  onSelect: (planId: string) => void
  isCurrentPlan?: boolean
}

export default function PlanCard({ 
  plan, 
  isAnnual, 
  annualDiscount, 
  onSelect, 
  isCurrentPlan = false 
}: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const displayPrice = isAnnual && plan.price > 0 
    ? getAnnualPrice(plan.price, annualDiscount) 
    : plan.price

  const handleSelect = async () => {
    if (isCurrentPlan || isLoading) return
    
    setIsLoading(true)
    try {
      await onSelect(plan.id)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    if (isCurrentPlan) return '현재 플랜'
    if (plan.id === 'free') return '무료로 시작'
    return '업그레이드'
  }

  const getVerifyBadge = () => {
    const badges = {
      basic: { label: '기본', color: 'bg-gray-100 text-gray-600' },
      link: { label: '링크검증', color: 'bg-blue-100 text-blue-600' },
      link404: { label: '링크+404', color: 'bg-indigo-100 text-indigo-600' },
      alt: { label: '대체출처', color: 'bg-purple-100 text-purple-600' }
    }
    
    const badge = badges[plan.verify as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className={`
      relative bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-lg
      ${plan.badge === 'most_popular'
        ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' 
        : 'border-gray-200 hover:border-gray-300'
      }
      ${isCurrentPlan ? 'ring-2 ring-green-100 border-green-500' : ''}
    `}>
      {/* Badge */}
      {plan.badge === 'most_popular' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
            가장 인기
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
          <p className="text-xs text-gray-500 mb-3">{plan.subtitle}</p>
          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
          
          <div className="mb-4">
            <div className="text-4xl font-bold text-gray-900">
              {formatPrice(displayPrice)}
              {plan.price > 0 && (
                <span className="text-lg font-normal text-gray-500">
                  /{isAnnual ? '년' : '월'}
                </span>
              )}
            </div>
            {isAnnual && plan.price > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                월 {formatPrice(plan.price)} → {annualDiscount}개월 무료
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-semibold text-gray-900">{plan.credits}회</div>
            <div className="text-gray-600">월 생성</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-semibold text-gray-900">{plan.viz}종</div>
            <div className="text-gray-600">시각화</div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="flex justify-center mb-6">
          {getVerifyBadge()}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2">
              <svg 
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-gray-600 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSelect}
          disabled={isCurrentPlan || isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold transition-colors
            ${isCurrentPlan
              ? 'bg-green-100 text-green-700 cursor-default'
              : plan.badge === 'most_popular'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>처리 중...</span>
            </div>
          ) : (
            getButtonText()
          )}
        </button>
      </div>
    </div>
  )
}