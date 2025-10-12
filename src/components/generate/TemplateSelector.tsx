'use client'

import { useState } from 'react'
import { TemplateType } from '@/types/template'
import { templateMetadata } from '@/lib/templates'
import { Button } from '@/components/ui/Button'

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null
  onSelect: (template: TemplateType) => void
  onNext: () => void
}

export function TemplateSelector({ selectedTemplate, onSelect, onNext }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateType | null>(null)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          어떤 사업계획서를 만들까요?
        </h1>
        <p className="text-xl text-gray-600">
          목적에 맞는 템플릿을 선택하면 최적화된 사업계획서를 생성해드립니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {templateMetadata.map((template) => (
          <div
            key={template.key}
            className={`relative cursor-pointer transition-all duration-300 ${
              selectedTemplate === template.key 
                ? 'scale-105 shadow-2xl' 
                : hoveredTemplate === template.key 
                  ? 'scale-102 shadow-lg' 
                  : 'hover:scale-102 hover:shadow-lg'
            }`}
            onClick={() => onSelect(template.key)}
            onMouseEnter={() => setHoveredTemplate(template.key)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* 선택됨 표시 */}
            {selectedTemplate === template.key && (
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <div className={`bg-white rounded-2xl border-2 p-8 h-full ${
              selectedTemplate === template.key ? 'border-blue-500' : 'border-gray-200'
            }`}>
              {/* 아이콘 및 헤더 */}
              <div className={`w-16 h-16 ${template.color} rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto transition-transform ${
                hoveredTemplate === template.key ? 'scale-110' : ''
              }`}>
                {template.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                {template.name}
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                {template.description}
              </p>

              {/* 주요 기능 */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">주요 특징</h4>
                <ul className="space-y-2">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 적용 사례 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">적용 사례</h5>
                <p className="text-sm text-gray-600">{template.sampleUseCase}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 비교 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          아직도 고민되시나요? 간단 비교표를 확인해보세요
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">구분</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">정부지원용</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">투자유치용</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">대출용</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">주요 심사 기준</td>
                <td className="py-3 px-4 text-center text-gray-600">기술력, 혁신성</td>
                <td className="py-3 px-4 text-center text-gray-600">성장성, 수익성</td>
                <td className="py-3 px-4 text-center text-gray-600">안정성, 상환능력</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">예상 완성 시간</td>
                <td className="py-3 px-4 text-center text-gray-600">8-12분</td>
                <td className="py-3 px-4 text-center text-gray-600">10-15분</td>
                <td className="py-3 px-4 text-center text-gray-600">6-10분</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-gray-700">분량</td>
                <td className="py-3 px-4 text-center text-gray-600">30-40페이지</td>
                <td className="py-3 px-4 text-center text-gray-600">40-50페이지</td>
                <td className="py-3 px-4 text-center text-gray-600">25-35페이지</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 다음 단계 버튼 */}
      <div className="text-center">
        <Button
          onClick={onNext}
          size="lg"
          disabled={!selectedTemplate}
          className="px-8"
        >
          {selectedTemplate ? '질문 단계로 이동 →' : '템플릿을 먼저 선택해주세요'}
        </Button>
        
        {selectedTemplate && (
          <p className="mt-4 text-sm text-gray-600">
            선택한 템플릿: <span className="font-semibold">{templateMetadata.find(t => t.key === selectedTemplate)?.name}</span>
          </p>
        )}
      </div>
    </div>
  )
}