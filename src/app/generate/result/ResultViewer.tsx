'use client'

import { useState, useEffect } from 'react'
import { useGenerationProgress, getProgressSummary, type GenerationProgress } from '@/lib/realtime/progress-tracker'
import { getChartsByPlanId, type ChartSpec } from '@/lib/visualization/chart-generator'

interface ResultViewerProps {
  planId: string
  templateKey: string
}

export default function ResultViewer({ planId, templateKey }: ResultViewerProps) {
  const { progress, isConnected, error, refresh } = useGenerationProgress(planId)
  const [charts, setCharts] = useState<ChartSpec[]>([])
  const [showCharts, setShowCharts] = useState(false)

  const summary = getProgressSummary(progress)

  // 차트 데이터 로드 (생성 완료 시)
  useEffect(() => {
    if (summary.isCompleted && charts.length === 0) {
      loadCharts()
    }
  }, [summary.isCompleted])

  const loadCharts = async () => {
    try {
      const chartData = await getChartsByPlanId(planId)
      setCharts(chartData)
    } catch (error) {
      console.error('차트 로드 실패:', error)
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
            <h3 className="text-sm font-medium text-red-800">데이터 로드 오류</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={refresh}
              className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 연결 상태 표시 */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? '실시간 연결됨' : '연결 끊김'}
          </span>
        </div>
        <button
          onClick={refresh}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          새로고침
        </button>
      </div>

      {/* 메인 진행률 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">생성 진행 상황</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            summary.isCompleted ? 'bg-green-100 text-green-800' :
            summary.isFailed ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {summary.isCompleted ? '완료' : summary.isFailed ? '실패' : '진행 중'}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{summary.currentStep}</span>
            <span>{summary.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                summary.isCompleted ? 'bg-green-500' : 
                summary.isFailed ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">섹션 진행:</span>
            <span className="ml-2 font-medium">{summary.sectionsCompleted}/{summary.totalSections}</span>
          </div>
          <div>
            <span className="text-gray-500">API 호출:</span>
            <span className="ml-2 font-medium">{progress?.totalApiCalls || 0}/40</span>
          </div>
          <div>
            <span className="text-gray-500">예상 시간:</span>
            <span className="ml-2 font-medium">
              {summary.estimatedMinutes > 0 ? `${summary.estimatedMinutes}분 남음` : '완료'}
            </span>
          </div>
        </div>

        {/* 품질 점수 (완료 시) */}
        {summary.isCompleted && progress?.qualityScore && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">품질 점수</span>
              <span className="text-lg font-bold text-green-600">{progress.qualityScore}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* 섹션별 진행 상황 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">섹션별 진행 상황</h3>
        
        <div className="space-y-3">
          {progress?.sections.map((section, index) => (
            <div key={section.sectionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    section.status === 'completed' ? 'bg-green-100 text-green-800' :
                    section.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                    section.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {section.status === 'completed' ? '✓' : 
                     section.status === 'failed' ? '✗' :
                     index + 1}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{section.sectionTitle}</h4>
                  <p className="text-xs text-gray-500">
                    {section.wordCount ? `${section.wordCount.toLocaleString()}자` : '대기 중'}
                    {section.hasVisualization && ' • 시각화 포함'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {section.status === 'completed' && (
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                    재생성
                  </button>
                )}
                {section.status === 'failed' && (
                  <button className="text-red-600 hover:text-red-700 text-xs font-medium">
                    재시도
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시각화 미리보기 (완료 시) */}
      {summary.isCompleted && charts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">시각화 자료</h3>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showCharts ? '숨기기' : '보기'}
            </button>
          </div>
          
          {showCharts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map((chart, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{chart.chartTitle}</h4>
                  <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">{chart.chartType} 차트</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 생성 로그 (개발자용) */}
      {progress?.logs && progress.logs.length > 0 && (
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <summary className="text-lg font-semibold text-gray-900 cursor-pointer">
            생성 로그 ({progress.logs.length})
          </summary>
          
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {progress.logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded ${
                    log.status === 'completed' ? 'bg-green-100 text-green-800' :
                    log.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.status}
                  </span>
                  <span className="font-medium">{log.stepName}</span>
                  <span className="text-gray-500">{log.model}</span>
                </div>
                <div className="text-gray-500">
                  {log.duration ? `${log.duration}ms` : ''} • {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 완료 액션 버튼들 */}
      {summary.isCompleted && (
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            사업계획서 보기
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
            PDF 다운로드
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
            편집하기
          </button>
        </div>
      )}

      {/* 실패 시 재시도 버튼 */}
      {summary.isFailed && (
        <div className="text-center">
          <button 
            onClick={() => window.location.href = `/generate/questions?template=${templateKey}`}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            다시 생성하기
          </button>
        </div>
      )}
    </div>
  )
}