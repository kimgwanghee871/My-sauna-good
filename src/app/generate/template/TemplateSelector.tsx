'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATE_CONFIGS, TemplateKey } from '../../../lib/schemas/template.schema'
import TemplateCard from '../_components/TemplateCard'

export default function TemplateSelector() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null)

  const handleTemplateSelect = (templateKey: TemplateKey) => {
    setSelectedTemplate(templateKey)
  }

  const handleNext = () => {
    if (selectedTemplate) {
      // Analytics tracking would go here
      router.push(`/generate/questions?template=${selectedTemplate}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* 템플릿 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(TEMPLATE_CONFIGS).map((template) => (
          <TemplateCard
            key={template.key}
            template={template}
            selected={selectedTemplate === template.key}
            onSelect={() => handleTemplateSelect(template.key)}
          />
        ))}
      </div>

      {/* 다음 단계 버튼 */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleNext}
          disabled={!selectedTemplate}
          className="px-8 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          다음 단계
        </button>
      </div>

      {selectedTemplate && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            선택된 템플릿: <span className="font-medium text-gray-900">
              {TEMPLATE_CONFIGS[selectedTemplate].title}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}