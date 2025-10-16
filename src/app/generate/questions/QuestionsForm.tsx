'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QnaField from '../_components/QnaField'
import AutosaveBadge from '../_components/AutosaveBadge'
import ProgressBar from '../_components/ProgressBar'
import AttachmentSection from '../../../components/qna/AttachmentSection'
import ExtraNotes from '../../../components/qna/ExtraNotes'
import { useProgress } from './useProgress'
import { useAutosave } from './useAutosave'
import { getTemplateMessages } from '../../../lib/i18n'
import { type QnaInput, type AttachmentFile } from '../../../lib/schemas/qset.schema'
import { fetchQnaConfig, type QnaFormConfig } from '../../../lib/config'
import type { TemplateKey } from '../../../lib/schemas/template.schema'

// 기본 폼 데이터
const initialFormData: QnaInput = {
  companyName: '',
  problem: '',
  solution: '',
  targetCustomer: '',
  competition: '',
  bizModel: '',
  fundingNeed: '',
  financeSnapshot: '',
  roadmap: '',
  team: '',
  attachments: [],
  extraNotes: ''
}

export default function QuestionsForm({ templateKey }: { templateKey: TemplateKey }) {
  const router = useRouter()
  const formStartTime = useRef(Date.now())
  
  const [formData, setFormData] = useState<QnaInput>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof QnaInput, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qnaConfig, setQnaConfig] = useState<QnaFormConfig | null>(null)

  // Get template-specific messages
  const templateMessages = getTemplateMessages(templateKey)
  
  // Custom hooks
  const storageKey = `qna_form_${templateKey}`
  const { saved } = useAutosave(storageKey, formData)
  const { filled, total, ratio, encourageMessage } = useProgress(formData)

  // Load QNA config and saved data on mount
  useEffect(() => {
    const initializeForm = async () => {
      try {
        const config = await fetchQnaConfig()
        setQnaConfig(config)
      } catch (error) {
        console.warn('Failed to load QNA config:', error)
      }

      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setFormData({ ...initialFormData, ...parsedData })
        } catch (error) {
          console.warn('Failed to parse saved form data:', error)
        }
      }
    }

    initializeForm()
  }, [storageKey])

  // Field change handler
  const handleFieldChange = (field: keyof QnaInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Attachments change handler
  const handleAttachmentsChange = (attachments: AttachmentFile[]) => {
    setFormData(prev => ({ ...prev, attachments }))
  }

  // Extra notes change handler
  const handleExtraNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, extraNotes: notes }))
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QnaInput, string>> = {}
    let isValid = true

    // Required fields validation
    const requiredFields: (keyof QnaInput)[] = [
      'companyName', 'problem', 'solution', 'targetCustomer', 'competition',
      'bizModel', 'fundingNeed', 'financeSnapshot', 'roadmap', 'team'
    ]

    requiredFields.forEach(field => {
      // Safely handle potentially undefined formData values
      const fieldValue = formData[field] || ''
      const value = fieldValue.toString().trim()
      
      if (!value) {
        newErrors[field] = '이 항목은 꼭 필요해요. 한 줄만 적어도 괜찮아요.'
        isValid = false
      } else if (value.length < 2) {
        newErrors[field] = '조금만 더 알려 주세요. (한두 문장 추가)'
        isValid = false
      } else if (value.length > 1000) {
        newErrors[field] = '핵심만 남겨 볼까요? 3~4문장 정도면 충분해요.'
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Include attachment and extra notes in final data
      const finalData = {
        ...formData,
        attachments: formData.attachments || [],
        extraNotes: formData.extraNotes || ''
      }

      // Store final form data
      localStorage.setItem(`${storageKey}_final`, JSON.stringify(finalData))
      
      // Navigate to result page (when implemented)
      router.push(`/generate/result?template=${templateKey}`)
      
    } catch (error) {
      console.error('Submit failed:', error)
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get field configuration for current template
  const getFieldConfig = (field: keyof QnaInput) => {
    // Skip template config for attachment fields (they don't need QnaField config)
    if (field === 'attachments' || field === 'extraNotes') {
      return {
        label: field,
        why: '',
        how: '',
        example: '',
        placeholder: ''
      }
    }
    
    return templateMessages.qna[field as keyof typeof templateMessages.qna] || {
      label: field,
      why: '',
      how: '',
      example: '',
      placeholder: ''
    }
  }

  const fieldKeys: (keyof QnaInput)[] = [
    'companyName', 'problem', 'solution', 'targetCustomer', 'competition',
    'bizModel', 'fundingNeed', 'financeSnapshot', 'roadmap', 'team'
  ]

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gray-50 -m-6 mb-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">진행률</span>
            <span className="text-sm font-medium text-gray-900">{filled}/{total}</span>
            <AutosaveBadge saved={saved} />
          </div>
          <div className="text-sm text-gray-500">
            약 {Math.ceil((total - filled) * 0.5)} 분 남음
          </div>
        </div>
        
        <ProgressBar value={ratio} className="mb-2" />
        
        {encourageMessage && (
          <p className="text-sm text-blue-600 font-medium">
            {encourageMessage}
          </p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {fieldKeys.map((field, index) => {
          const config = getFieldConfig(field)
          const isRequired = true
          
          return (
            <div key={field} className="space-y-2">
              {/* Step indicator for groups of fields */}
              {(index === 0 || index === 3 || index === 6) && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                    {Math.floor(index / 3) + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {index === 0 && '이름·문제·해결'}
                    {index === 3 && '고객·경쟁·수익'}
                    {index === 6 && '예산·재무·계획·팀'}
                  </span>
                  <span className="text-xs text-gray-500">
                    (약 {index === 0 ? '2' : index === 3 ? '3' : '3'}분)
                  </span>
                </div>
              )}
              
              <QnaField
                id={field}
                label={config.label}
                placeholder={config.placeholder}
                why={config.why}
                how={config.how}
                example={config.example}
                type="textarea"
                required={isRequired}
                value={formData[field]}
                onChange={(value) => handleFieldChange(field, value)}
                error={errors[field]}
                maxLength={1000}
              />
            </div>
          )
        })}
      </div>

      {/* Attachment and Extra Notes Sections */}
      {qnaConfig && qnaConfig.attachments.enabled && (
        <div className="space-y-6 border-t border-gray-200 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">
              +
            </span>
            <span className="text-sm font-medium text-gray-700">
              정확성 향상을 위한 추가 정보
            </span>
            <span className="text-xs text-gray-500">(선택사항)</span>
          </div>

          {/* Attachment Section */}
          <AttachmentSection
            rc={qnaConfig.attachments}
            onChange={handleAttachmentsChange}
          />

          {/* Extra Notes Section */}
          <ExtraNotes
            rc={qnaConfig.attachments}
            onChange={handleExtraNotesChange}
            initialValue={formData.extraNotes || ''}
          />
        </div>
      )}

      {/* Submit Section */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filled}/{total}</span> 개 항목 완료
            {filled >= total && (
              <span className="ml-2 text-green-600 font-medium">
                ✅ 모든 항목이 완료되었습니다!
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => router.push('/generate/template')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              템플릿 다시 선택
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || filled < total}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  사업계획서 생성 중...
                </>
              ) : (
                '사업계획서 생성하기'
              )}
            </button>
          </div>
        </div>
        
        {filled < total && (
          <p className="text-xs text-gray-500 mt-2">
            모든 항목을 작성하시면 사업계획서를 생성할 수 있어요.
          </p>
        )}
      </div>
    </div>
  )
}