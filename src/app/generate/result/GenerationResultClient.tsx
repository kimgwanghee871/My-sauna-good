'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useGenerationProgress, 
  getProgressSummary, 
  cancelGeneration, 
  regenerateSection,
  type GenerationProgress,
  type SectionProgress
} from '@/lib/realtime/progress-tracker'
import type { TemplateKey } from '@/lib/generator/ai-orchestrator'

interface GenerationResultClientProps {
  planId: string
  templateKey: TemplateKey
}

export default function GenerationResultClient({ 
  planId, 
  templateKey 
}: GenerationResultClientProps) {
  const router = useRouter()
  const { progress, isConnected, error, refresh } = useGenerationProgress(planId)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const summary = getProgressSummary(progress)

  // 완료 시 자동 새로고침
  useEffect(() => {
    if (summary.isCompleted) {
      setTimeout(() => {
        refresh()
      }, 2000)
    }
  }, [summary.isCompleted, refresh])

  // 수동 새고침 핸들러
  const handleRefresh = async () => {
    setIsManualRefreshing(true)
    await refresh()
    setTimeout(() => setIsManualRefreshing(false), 1000)
  }

  // 생성 취소 핸들러
  const handleCancel = async () => {
    if (confirm('정말로 생성을 취소하시겠습니까?')) {
      const success = await cancelGeneration(planId)
      if (success) {
        router.push('/generate/template')
      } else {
        alert('취소 중 오류가 발생했습니다.')
      }
    }
  }

  // 섹션 재생성 핸들러
  const handleRegenerateSection = async (sectionId: string) => {
    const success = await regenerateSection(planId, sectionId)
    if (success) {
      refresh()
    } else {
      alert('재생성 요청 중 오류가 발생했습니다.')
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              진행률 조회 오류
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 진행률 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              생성 진행 상황
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {summary.currentStep}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* 연결 상태 표시 */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? '실시간 연결' : '연결 끊김'}
              </span>
            </div>
            
            {/* 새고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={isManualRefreshing}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isManualRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 취소 버튼 */}
            {!summary.isCompleted && !summary.isFailed && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                생성 취소
              </button>
            )}
          </div>
        </div>

        {/* 전체 진행률 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-900">
              전체 진행률
            </span>
            <span className="text-gray-600">
              {summary.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                summary.isFailed ? 'bg-red-500' : 
                summary.isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>

        {/* 상태별 메시지 */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            섹션: {summary.sectionsCompleted}/{summary.totalSections} 완료
            {progress && ` • API 호출: ${progress.totalApiCalls}/40`}
          </div>
          <div>
            {!summary.isCompleted && !summary.isFailed && (
              <span>예상 남은 시간: 약 {summary.estimatedMinutes}분</span>
            )}
            {summary.isCompleted && progress?.qualityScore && (
              <span className="text-green-600 font-medium">
                품질 점수: {progress.qualityScore}/100
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 섹션별 진행 상황 */}
      {progress && progress.sections.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              섹션별 진행 상황
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {progress.sections.map((section) => (
              <SectionProgressItem
                key={section.sectionId}
                section={section}
                onRegenerate={() => handleRegenerateSection(section.sectionId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 생성 로그 */}
      {progress && progress.logs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              생성 로그
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {progress.logs.slice(0, 10).map((log) => (
                <div key={log.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={log.status} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.stepName} (Step {log.stepOrder})
                        </p>
                        <p className="text-xs text-gray-500">
                          모델: {log.model}
                          {log.duration && ` • 소요시간: ${Math.round(log.duration / 1000)}초`}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 완료 시 액션 */}
      {summary.isCompleted && (
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
              onClick={() => router.push(`/plans/${planId}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              사업계획서 보기
            </button>
            <button 
              onClick={() => router.push(`/plans/${planId}/download`)}
              className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 개별 섹션 진행 아이템
 */
function SectionProgressItem({ 
  section, 
  onRegenerate 
}: { 
  section: SectionProgress
  onRegenerate: () => void 
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon status={section.status} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {section.sectionOrder}. {section.sectionTitle}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              {section.wordCount && (
                <span>{section.wordCount.toLocaleString()}자</span>
              )}
              {section.hasVisualization && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  차트
                </span>
              )}
            </div>
          </div>
        </div>
        
        {section.status === 'completed' && (
          <button
            onClick={onRegenerate}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            재생성
          </button>
        )}
        
        {section.status === 'failed' && (
          <button
            onClick={onRegenerate}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            재시도
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 상태 아이콘
 */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'generating':
    case 'running':
    case 'regenerating':
      return (
        <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    case 'failed':
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    case 'pending':
    default:
      return (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}