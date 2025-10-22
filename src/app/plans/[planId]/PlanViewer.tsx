'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

// Types
interface SectionRow {
  id: number
  plan_id: string
  section_index: number
  heading: string
  content: string | null
  status: 'pending' | 'generating' | 'completed' | 'error'
  updated_at: string
}

interface ChartSpec {
  id: string
  type: string
  title: string
  data: any[]
  config?: Record<string, any>
  meta?: any
}

interface PlanData {
  id: string
  user_id: string
  status: string
  template_key: string
  quality_score?: number
  title?: string
  created_at: string
  updated_at: string
}

interface PlanViewerProps {
  planId: string
  templateKey: 'government' | 'investment' | 'loan'
  initialPlan: PlanData
}

export default function PlanViewer({ planId, templateKey, initialPlan }: PlanViewerProps) {
  const [sections, setSections] = useState<SectionRow[]>([])
  const [charts, setCharts] = useState<ChartSpec[]>([])
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client for browser
  const supabase = useMemo(() => supabaseBrowser(), [])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('business_plan_sections')
          .select('id,plan_id,section_index,heading,content,status,updated_at')
          .eq('plan_id', planId)
          .order('section_index')

        if (sectionsError) {
          console.error('Sections fetch error:', sectionsError)
          setError('섹션 데이터를 불러올 수 없습니다.')
          return
        }

        setSections(sectionsData || [])

        // Load charts if available
        const { data: chartSpec, error: chartError } = await supabase
          .from('market_specs')
          .select('json_spec')
          .eq('plan_id', planId)
          .maybeSingle()

        if (!chartError && chartSpec?.json_spec?.charts) {
          const rawCharts = chartSpec.json_spec.charts as any[]
          setCharts(rawCharts.map(normalizeChart))
        }

        setError(null)
      } catch (err) {
        console.error('Data loading error:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [planId, supabase])

  // Real-time subscription for sections
  useEffect(() => {
    const channel = supabase
      .channel(`plan_sections_${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_plan_sections',
          filter: `plan_id=eq.${planId}`
        },
        (payload: any) => {
          console.log('Section updated:', payload)
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newSection = payload.new as SectionRow
            setSections(prev => {
              const updated = [...prev]
              const existingIndex = updated.findIndex(s => s.id === newSection.id)
              
              if (existingIndex >= 0) {
                updated[existingIndex] = newSection
              } else {
                updated.push(newSection)
              }
              
              return updated.sort((a, b) => a.section_index - b.section_index)
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [planId, supabase])

  // Scroll to active section
  const scrollToSection = useCallback((sectionIndex: number) => {
    const element = document.getElementById(`section-${sectionIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSectionIndex(sectionIndex)
    }
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

  const completedSections = sections.filter(s => s.status === 'completed').length

  return (
    <main className="grid lg:grid-cols-[300px_1fr] gap-6">
      {/* 좌측 목차 */}
      <AsideOutline 
        sections={sections}
        activeSectionIndex={activeSectionIndex}
        onSectionSelect={scrollToSection}
        completedCount={completedSections}
        totalCount={sections.length}
      />
      
      {/* 메인 컨텐츠 */}
      <div className="flex flex-col min-h-0">
        <ArticleBody 
          sections={sections}
          charts={charts}
          planId={planId}
          onSectionVisible={setActiveSectionIndex}
        />
        <ExportBar planId={planId} />
      </div>
    </main>
  )
}

// Normalize chart data to consistent format
function normalizeChart(c: any): ChartSpec {
  return {
    id: c.id || Math.random().toString(36).substr(2, 9),
    type: c.type ?? c.chartType ?? 'bar',
    title: c.title ?? c.chartTitle ?? c.id ?? '차트',
    data: Array.isArray(c.data) ? c.data : [],
    config: c.config ?? {},
    meta: c.meta ?? {},
  }
}

// 좌측 목차 컴포넌트
function AsideOutline({ 
  sections, 
  activeSectionIndex, 
  onSectionSelect, 
  completedCount, 
  totalCount 
}: {
  sections: SectionRow[]
  activeSectionIndex: number | null
  onSectionSelect: (index: number) => void
  completedCount: number
  totalCount: number
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto bg-white rounded-xl border border-gray-200 p-4">
      {/* 진행률 요약 */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>완료 진행률</span>
          <span className="font-medium">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 섹션 목록 */}
      <nav>
        <ul className="space-y-1">
          {sections.map(section => (
            <li key={section.id}>
              <button
                className={`w-full text-left flex items-start gap-3 p-2 rounded-lg text-sm transition-colors ${
                  activeSectionIndex === section.section_index
                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => onSectionSelect(section.section_index)}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {section.status === 'completed' ? '✅' :
                   section.status === 'error' ? '⚠️' :
                   section.status === 'generating' ? (
                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                   ) : '⏳'}
                </span>
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {section.section_index}. {section.heading}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {section.status === 'completed' ? '완료' :
                     section.status === 'generating' ? '생성 중...' :
                     section.status === 'error' ? '오류 발생' :
                     '대기 중'}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

// 메인 본문 컴포넌트
function ArticleBody({ 
  sections, 
  charts, 
  planId, 
  onSectionVisible 
}: {
  sections: SectionRow[]
  charts: ChartSpec[]
  planId: string
  onSectionVisible: (index: number) => void
}) {
  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = parseInt(entry.target.getAttribute('data-section-index') || '0')
            onSectionVisible(sectionIndex)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    const sectionElements = document.querySelectorAll('[data-section-index]')
    sectionElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [sections, onSectionVisible])

  return (
    <article id="plan-content" className="bg-white rounded-xl border border-gray-200 p-6 prose max-w-none">
      {/* 차트 요약 영역 */}
      {charts.length > 0 && (
        <section className="mb-8 not-prose">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 시각화 요약</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {charts.map((chart) => (
              <div key={chart.id} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">{chart.title}</div>
                <ChartRenderer spec={chart} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 섹션들 */}
      {sections.map(section => (
        <section 
          key={section.id} 
          id={`section-${section.section_index}`}
          data-section-index={section.section_index}
          className="mb-8 scroll-mt-4 not-prose"
        >
          <header className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {section.section_index}. {section.heading}
            </h2>
            <div className="flex items-center gap-2">
              <EditButton section={section} />
              <RegenerateButton section={section} planId={planId} />
            </div>
          </header>
          
          <div className="prose prose-gray max-w-none">
            {section.status === 'generating' ? (
              <div className="flex items-center gap-3 py-8 text-gray-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>AI가 이 섹션을 생성하고 있습니다...</span>
              </div>
            ) : section.content ? (
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: section.content.replace(/\n/g, '<br>') 
                }}
              />
            ) : (
              <div className="py-8 text-center text-gray-500">
                <span>이 섹션은 아직 생성되지 않았습니다.</span>
              </div>
            )}
          </div>
        </section>
      ))}
    </article>
  )
}

// 간단한 차트 렌더러 (실제 구현시 Chart.js/Recharts 등 사용)
function ChartRenderer({ spec }: { spec: ChartSpec }) {
  return (
    <div className="w-full h-48 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-lg font-medium">{spec.title}</div>
        <div className="text-sm">Type: {spec.type}</div>
        <div className="text-xs">{spec.data.length} data points</div>
      </div>
    </div>
  )
}

// 편집 버튼 (모달 추후 구현)
function EditButton({ section }: { section: SectionRow }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button 
        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        onClick={() => setIsOpen(true)}
        disabled={section.status !== 'completed'}
      >
        ✏️ 편집
      </button>
      {isOpen && (
        <EditModal 
          section={section} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}

// 재생성 버튼
function RegenerateButton({ section, planId }: { section: SectionRow; planId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleRegenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sections/${section.id}/regenerate`, {
        method: 'POST'
      })
      
      if (response.status === 402) {
        // 업셀 모달 열기 (추후 구현)
        alert('크레딧이 부족합니다. 업그레이드가 필요합니다.')
        return
      }
      
      if (!response.ok) {
        throw new Error('재생성 요청 실패')
      }
      
      // 성공시 자동으로 realtime으로 업데이트됨
    } catch (error) {
      console.error('Regeneration error:', error)
      alert('재생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
      disabled={isLoading || section.status === 'generating'}
      onClick={handleRegenerate}
    >
      {isLoading ? (
        <>
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
          재생성 중...
        </>
      ) : (
        <>🔄 재생성</>
      )}
    </button>
  )
}

// Export 바
function ExportBar({ planId }: { planId: string }) {
  const exportToPdf = () => {
    // PDF 생성 로직 (추후 구현)
    alert('PDF 내보내기 기능은 곧 추가됩니다.')
  }

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-6 p-4 rounded-b-xl">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          내보내기 옵션
        </div>
        <div className="flex gap-2">
          <a 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            href={`/api/export/docx?planId=${encodeURIComponent(planId)}`}
            download
          >
            📄 DOCX 다운로드
          </a>
          <button 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={exportToPdf}
          >
            📑 PDF 다운로드
          </button>
        </div>
      </div>
    </div>
  )
}

// 편집 모달 (기본 구현)
function EditModal({ section, onClose }: { section: SectionRow; onClose: () => void }) {
  const [content, setContent] = useState(section.content || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('저장 실패')
      }

      onClose()
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">섹션 편집</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {section.section_index}. {section.heading}
          </label>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="섹션 내용을 입력하세요..."
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={isSaving}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 로딩 스켈레톤
function LoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 에러 디스플레이
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
      <p className="text-gray-600 mb-4 text-center">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}