'use client'

import { useState, useEffect } from 'react'
import { TemplateType, QuestionField, UserInputs } from '@/types/template'
import { getTemplate } from '@/lib/templates'
import { Button } from '@/components/ui/Button'

interface QuestionWizardProps {
  template: TemplateType
  onSubmit: (inputs: UserInputs) => void
  onBack: () => void
}

export function QuestionWizard({ template, onSubmit, onBack }: QuestionWizardProps) {
  const templateConfig = getTemplate(template)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = templateConfig.questions.length
  const currentQuestion = templateConfig.questions[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // 에러 메시지 제거
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }))
    }
  }

  const validateCurrentQuestion = (): boolean => {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setErrors({ [currentQuestion.id]: '이 항목은 필수입니다' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateCurrentQuestion()) return

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // 모든 필수 질문 검증
    const requiredErrors: Record<string, string> = {}
    
    templateConfig.questions.forEach(question => {
      if (question.required && !answers[question.id]) {
        requiredErrors[question.id] = '이 항목은 필수입니다'
      }
    })

    if (Object.keys(requiredErrors).length > 0) {
      setErrors(requiredErrors)
      // 첫 번째 에러가 있는 질문으로 이동
      const firstErrorIndex = templateConfig.questions.findIndex(q => requiredErrors[q.id])
      setCurrentStep(firstErrorIndex)
      return
    }

    // UserInputs 형태로 변환
    const userInputs: UserInputs = {
      template,
      title: answers['q1'] || `${templateConfig.name} 사업계획서`,
      company: {
        name: answers['q1'] || '',
        industry: answers['q2'] || '',
        employees: parseInt(answers['q4']) || undefined,
      },
      product: {
        name: answers['q2'] || '',
        category: '',
        description: answers['q3'] || '',
        uniqueValue: answers['q3'] || '',
        targetMarket: answers['q4'] || '',
        developmentStage: answers['q8'] || '',
      },
      market: {
        size: parseFloat(answers['q4']) || 0,
        growth: 0,
        competitors: answers['q5'] ? [answers['q5']] : [],
      },
      finance: {
        sales5y: answers['q7'] ? parseAnsweredFinancial(answers['q7']) : [0, 0, 0, 0, 0],
        capex5y: answers['q6'] ? parseAnsweredFinancial(answers['q6']) : undefined,
      },
    }

    // 추가 필드들 매핑
    templateConfig.questions.forEach(question => {
      if (answers[question.id]) {
        setNestedValue(userInputs, question.mapTo, answers[question.id])
      }
    })

    onSubmit(userInputs)
  }

  // 재무 데이터 파싱
  const parseAnsweredFinancial = (value: string): number[] => {
    try {
      return value.split(/[,\s]+/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    } catch {
      return [0, 0, 0, 0, 0]
    }
  }

  // 중첩 객체에 값 설정
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }

  const renderQuestionInput = (question: QuestionField) => {
    const value = answers[question.id] || ''
    const error = errors[question.id]

    switch (question.type) {
      case 'short':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )

      case 'long':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">{question.placeholder}</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'multi':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleAnswer(question.id, [...currentArray, option])
                    } else {
                      handleAnswer(question.id, currentArray.filter(v => v !== option))
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                {option}
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 진행률 표시 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {currentStep + 1} / {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% 완료</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQuestion.label}
          </h2>
          {currentQuestion.required && (
            <span className="text-red-500 text-sm">* 필수 항목</span>
          )}
        </div>

        <div className="mb-6">
          {renderQuestionInput(currentQuestion)}
          {errors[currentQuestion.id] && (
            <p className="mt-2 text-sm text-red-600">{errors[currentQuestion.id]}</p>
          )}
        </div>

        {/* 힌트 또는 예시 */}
        {currentQuestion.placeholder && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">💡 작성 팁:</span> {currentQuestion.placeholder}
            </p>
          </div>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <Button
          onClick={currentStep === 0 ? onBack : handlePrevious}
          variant="outline"
        >
          {currentStep === 0 ? '← 템플릿 선택으로' : '← 이전 질문'}
        </Button>

        <Button onClick={handleNext}>
          {currentStep === totalSteps - 1 ? '사업계획서 생성하기' : '다음 질문 →'}
        </Button>
      </div>

      {/* 질문 네비게이션 */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          {templateConfig.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-600'
                  : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}