'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QnaField from '../_components/QnaField'
import AutosaveBadge from '../_components/AutosaveBadge'
import { 
  type QnaInput, 
  QnaSchemaDefinition, 
  FIELD_CONFIGS 
} from '../../../lib/schemas/qset.schema'

type TemplateKey = 'government' | 'investment' | 'loan'
type FieldKey = keyof QnaInput

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
  team: ''
}

// 기본 라벨 정의
const DEFAULT_LABELS: Record<FieldKey, string> = {
  companyName: '회사/프로젝트명',
  problem: '해결하려는 문제',
  solution: '해결책/제품 설명',
  targetCustomer: '목표 고객',
  competition: '경쟁 현황 및 차별점',
  bizModel: '수익 모델',
  fundingNeed: '필요 자금 및 용도',
  financeSnapshot: '재무 현황 요약',
  roadmap: '추진 계획',
  team: '팀 구성'
}

export default function QuestionsForm({ templateKey }: { templateKey: TemplateKey }) {
  const router = useRouter()
  const formStartTime = useRef(Date.now())
  
  const [formData, setFormData] = useState<QnaInput>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 로컬스토리지 키
  const storageKey = `qna_form_${templateKey}`

  // Fallback analytics functions
  const analytics = {
    trackFormFieldChanged: () => {},
    trackFormAutoSaved: () => {},
    trackFormSubmitted: () => {},
    trackValidationError: () => {}
  }

  // 필드 라벨 가져오기 함수
  const getFieldLabel = (field: FieldKey): string => {
    const templateConfig = FIELD_CONFIGS[templateKey]
    if (templateConfig && templateConfig[field]) {
      return templateConfig[field]!.label
    }
    return DEFAULT_LABELS[field]
  }

  // 검증 메시지 함수
  const getValidationMessage = (type: string, params?: any): string => {
    if (type === 'required') return `${params?.field}은(는) 필수입니다`
    if (type === 'minLength') return `최소 ${params?.min}자 이상 입력해주세요`
    if (type === 'maxLength') return `최대 ${params?.max}자까지 입력 가능합니다`
    return '올바른 형식으로 입력해주세요'
  }

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        setFormData({ ...initialFormData, ...parsedData })
        setLastSaved(new Date(parsedData._lastSaved || Date.now()))
      } catch (error) {
        console.warn('Failed to parse saved form data:', error)
      }
    }
  }, [storageKey])

  // 자동 저장 (디바운싱)
  const autoSave = useCallback(async (data: QnaInput) => {
    setIsAutoSaving(true)
    
    try {
      // 로컬스토리지에 저장
      const saveData = {
        ...data,
        _lastSaved: Date.now(),
        _templateKey: templateKey
      }
      localStorage.setItem(storageKey, JSON.stringify(saveData))
      setLastSaved(new Date())
      
      // Analytics tracking
      const completedFields = Object.values(data).filter(v => v.trim() !== '').length
      analytics.trackFormAutoSaved(templateKey, completedFields, 10)
      
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [storageKey, templateKey])

  // 디바운싱된 자동저장
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formData).some(value => value.trim() !== '')) {
        autoSave(formData)
      }
    }, 2000) // 2초 디바운싱

    return () => clearTimeout(timer)
  }, [formData, autoSave])

  // 폼 데이터 변경 핸들러
  const handleFieldChange = (field: FieldKey, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 실시간 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Analytics tracking
    analytics.trackFormFieldChanged(field, value, templateKey)
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<FieldKey, string>> = {}
    
    Object.entries(QnaSchemaDefinition).forEach(([field, config]) => {
      const fieldKey = field as FieldKey
      const value = formData[fieldKey]?.trim() || ''
      
      if (config.required && !value) {
        const errorMessage = getValidationMessage('required', { field: getFieldLabel(fieldKey) })
        newErrors[fieldKey] = errorMessage
        analytics.trackValidationError(field, 'required', errorMessage, templateKey)
      } else if (value && value.length < config.min) {
        const errorMessage = getValidationMessage('minLength', { min: config.min })
        newErrors[fieldKey] = errorMessage
        analytics.trackValidationError(field, 'minLength', errorMessage, templateKey)
      } else if (value && value.length > config.max) {
        const errorMessage = getValidationMessage('maxLength', { max: config.max })
        newErrors[fieldKey] = errorMessage
        analytics.trackValidationError(field, 'maxLength', errorMessage, templateKey)
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 필드 설정 가져오기
  const getFieldConfig = (field: FieldKey) => {
    const templateConfig = FIELD_CONFIGS[templateKey]
    const fieldConfig = templateConfig?.[field]
    const schemaConfig = QnaSchemaDefinition[field]
    
    return {
      label: fieldConfig?.label || DEFAULT_LABELS[field],
      placeholder: fieldConfig?.placeholder || `${DEFAULT_LABELS[field]}을(를) 입력해주세요...`,
      hint: fieldConfig?.hint,
      maxLength: schemaConfig.max,
      required: schemaConfig.required
    }
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 최종 저장
      await autoSave(formData)

      // Analytics tracking
      const completedFields = Object.values(formData).filter(v => v.trim() !== '').length
      analytics.trackFormSubmitted(templateKey, completedFields, 10, formStartTime.current)
      
      // 생성 페이지로 이동
      router.push(`/generate/result?template=${templateKey}`)
      
    } catch (error) {
      console.error('Form submission failed:', error)
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 이전 단계로 이동
  const handleBack = () => {
    router.push('/generate/template')
  }

  // 폼 초기화
  const handleReset = () => {
    if (confirm('작성중인 내용을 모두 삭제하시겠습니까?')) {
      setFormData(initialFormData)
      setErrors({})
      localStorage.removeItem(storageKey)
      setLastSaved(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 자동저장 상태 표시 */}
      <div className="flex items-center justify-between">
        <AutosaveBadge isAutoSaving={isAutoSaving} lastSaved={lastSaved} />
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          초기화
        </button>
      </div>

      {/* 질문 필드들 */}
      <div className="grid gap-6">
        {Object.keys(initialFormData).map((field) => {
          const fieldKey = field as FieldKey
          const config = getFieldConfig(fieldKey)
          
          return (
            <QnaField
              key={fieldKey}
              id={fieldKey}
              label={config.label}
              placeholder={config.placeholder}
              hint={config.hint}
              type={fieldKey === 'companyName' ? 'text' : 'textarea'}
              required={config.required}
              value={formData[fieldKey]}
              onChange={(value) => handleFieldChange(fieldKey, value)}
              error={errors[fieldKey]}
              maxLength={config.maxLength}
            />
          )
        })}
      </div>

      {/* 버튼들 */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          이전 단계
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {Object.values(formData).filter(v => v.trim()).length}/10 완료
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '생성 중...' : '사업계획서 생성'}
          </button>
        </div>
      </div>
    </form>
  )
}