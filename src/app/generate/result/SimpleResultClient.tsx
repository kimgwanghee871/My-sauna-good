'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TemplateKey } from '@/lib/schemas/template.schema'

interface SimpleResultClientProps {
  planId: string
  templateKey: TemplateKey
}

interface GenerationState {
  progress: number
  step: string
  status: 'generating' | 'completed' | 'error'
}

export default function SimpleResultClient({ 
  planId, 
  templateKey 
}: SimpleResultClientProps) {
  const router = useRouter()
  const [state, setState] = useState<GenerationState>({
    progress: 0,
    step: 'AI 분석 시작 중...',
    status: 'generating'
  })

  // Simulate generation progress
  useEffect(() => {
    const steps = [
      { progress: 10, step: 'AI 분석 시작' },
      { progress: 25, step: '시장 분석 중' },
      { progress: 50, step: '사업계획 초안 작성' },
      { progress: 75, step: '세부 내용 보완' },
      { progress: 90, step: '최종 검토' },
      { progress: 100, step: '완료' }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setState({
          progress: steps[currentStep].progress,
          step: steps[currentStep].step,
          status: steps[currentStep].progress === 100 ? 'completed' : 'generating'
        })
        currentStep++
      } else {
        clearInterval(interval)
      }
    }, 3000) // 3초마다 업데이트

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* 진행률 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              사업계획서 생성 중
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {state.step}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {templateKey} 템플릿
            </span>
          </div>
        </div>

        {/* 전체 진행률 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-900">
              전체 진행률
            </span>
            <span className="text-gray-600">
              {state.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                state.status === 'error' ? 'bg-red-500' : 
                state.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>

        {/* 상태별 메시지 */}
        <div className="text-sm text-gray-600">
          Plan ID: {planId}
        </div>
      </div>

      {/* 생성 단계 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          생성 단계
        </h3>
        <div className="space-y-4">
          {[
            { name: 'AI 분석 시작', progress: 10 },
            { name: '시장 분석', progress: 25 },
            { name: '사업계획 초안 작성', progress: 50 },
            { name: '세부 내용 보완', progress: 75 },
            { name: '최종 검토', progress: 90 },
            { name: '완료', progress: 100 }
          ].map((step, index) => (
            <div key={step.name} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                state.progress >= step.progress
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {state.progress >= step.progress ? '✓' : index + 1}
              </div>
              <span className={`text-sm ${
                state.progress >= step.progress ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 완료 시 액션 */}
      {state.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-800">
                사업계획서 생성 완료!
              </h3>
              <p className="text-sm text-green-600 mt-1">
                전문적인 사업계획서가 성공적으로 생성되었습니다.
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => alert(`사업계획서 보기 기능은 아직 구현 중입니다. Plan ID: ${planId}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              사업계획서 보기
            </button>
            <button 
              onClick={() => router.push('/generate/template')}
              className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              새 계획서 작성
            </button>
          </div>
        </div>
      )}
    </div>
  )
}