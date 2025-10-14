'use client'

import { TemplateMeta } from '../../../lib/schemas/template.schema'

interface TemplateCardProps {
  template: TemplateMeta
  selected: boolean
  onSelect: () => void
}

export default function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full text-left border-2 rounded-xl p-6 transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* 아이콘과 제목 */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-3xl">{template.icon}</div>
        <div>
          <h3 className={`text-lg font-semibold ${
            selected ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {template.title}
          </h3>
        </div>
      </div>

      {/* 설명 */}
      <p className={`text-sm mb-4 leading-relaxed ${
        selected ? 'text-blue-800' : 'text-gray-600'
      }`}>
        {template.description}
      </p>

      {/* 특징 태그들 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          selected 
            ? 'bg-blue-200 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {template.sectionsCommon.length + template.sectionsExtra.length}개 섹션
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          selected 
            ? 'bg-blue-200 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {template.color} 테마
        </span>
      </div>

      {/* 선택 표시 */}
      {selected && (
        <div className="flex items-center space-x-2 text-blue-600">
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-sm font-medium">선택됨</span>
        </div>
      )}
    </button>
  )
}