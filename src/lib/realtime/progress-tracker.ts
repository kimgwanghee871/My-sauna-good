// 실시간 진행률 추적 시스템 - Supabase Realtime 연동
'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState, useCallback } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 진행률 상태 인터페이스
export interface GenerationProgress {
  planId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  currentStep: string
  totalSteps: number
  completedSteps: number
  progressPercentage: number
  estimatedTimeRemaining: number // 분 단위
  sections: SectionProgress[]
  logs: GenerationLog[]
  startedAt?: string
  completedAt?: string
  totalApiCalls: number
  qualityScore?: number
}

export interface SectionProgress {
  sectionId: string
  sectionCode: string
  sectionTitle: string
  sectionOrder: number
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'regenerating'
  wordCount?: number
  hasVisualization?: boolean
}

export interface GenerationLog {
  id: string
  stepName: string
  stepOrder: number
  model: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying'
  duration?: number
  createdAt: string
}

/**
 * 실시간 진행률 추적 훅
 */
export function useGenerationProgress(planId: string | null) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 초기 데이터 로드
  const loadInitialProgress = useCallback(async (id: string) => {
    try {
      setError(null)
      
      // 플랜 기본 정보 조회
      const { data: planData, error: planError } = await supabase
        .from('business_plans')
        .select(`
          id,
          title,
          status,
          total_api_calls,
          quality_score,
          created_at,
          updated_at,
          completed_at
        `)
        .eq('id', id)
        .single()

      if (planError) throw planError

      // 섹션별 진행 상황 조회
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('business_plan_sections')
        .select('*')
        .eq('plan_id', id)
        .order('section_order')

      if (sectionsError) throw sectionsError

      // 생성 로그 조회 (최근 20개)
      const { data: logsData, error: logsError } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('plan_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsError) throw logsError

      // 진행률 계산
      const sections: SectionProgress[] = (sectionsData || []).map(section => ({
        sectionId: section.id,
        sectionCode: section.section_code,
        sectionTitle: section.section_title,
        sectionOrder: section.section_order,
        status: section.status,
        wordCount: section.final_content?.length || section.refined_content?.length || section.draft_content?.length,
        hasVisualization: !!section.viz_spec
      }))

      const completedSections = sections.filter(s => s.status === 'completed').length
      const totalSections = sections.length || 18 // 기본 18개 섹션
      const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

      // 현재 단계 결정
      const currentStep = determineCurrentStep(planData.status, sections, logsData || [])
      
      // 예상 소요 시간 계산
      const estimatedTime = calculateEstimatedTime(planData.status, completedSections, totalSections, planData.created_at)

      const progressData: GenerationProgress = {
        planId: id,
        status: planData.status,
        currentStep,
        totalSteps: 40, // 40콜 파이프라인
        completedSteps: planData.total_api_calls || 0,
        progressPercentage,
        estimatedTimeRemaining: estimatedTime,
        sections,
        logs: (logsData || []).map(log => ({
          id: log.id,
          stepName: log.step_name,
          stepOrder: log.step_order,
          model: log.model,
          status: log.status,
          duration: log.duration_ms,
          createdAt: log.created_at
        })),
        startedAt: planData.created_at,
        completedAt: planData.completed_at,
        totalApiCalls: planData.total_api_calls || 0,
        qualityScore: planData.quality_score
      }

      setProgress(progressData)

    } catch (err) {
      console.error('진행률 로드 오류:', err)
      setError(err instanceof Error ? err.message : '데이터 로드에 실패했습니다')
    }
  }, [])

  // Realtime 구독 설정
  useEffect(() => {
    if (!planId) {
      setProgress(null)
      return
    }

    // 초기 데이터 로드
    loadInitialProgress(planId)

    // Realtime 채널 구독
    const channel = supabase
      .channel(`plan_progress_${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_plans',
          filter: `id=eq.${planId}`
        },
        (payload) => {
          console.log('플랜 상태 변경:', payload)
          loadInitialProgress(planId) // 변경 시 전체 데이터 다시 로드
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_plan_sections',
          filter: `plan_id=eq.${planId}`
        },
        (payload) => {
          console.log('섹션 상태 변경:', payload)
          loadInitialProgress(planId)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generation_logs',
          filter: `plan_id=eq.${planId}`
        },
        (payload) => {
          console.log('새 로그 추가:', payload)
          loadInitialProgress(planId)
        }
      )
      .subscribe((status) => {
        console.log('Realtime 연결 상태:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // 정리
    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [planId, loadInitialProgress])

  // 수동 새고침
  const refresh = useCallback(() => {
    if (planId) {
      loadInitialProgress(planId)
    }
  }, [planId, loadInitialProgress])

  return {
    progress,
    isConnected,
    error,
    refresh
  }
}

/**
 * 현재 진행 단계 결정
 */
function determineCurrentStep(
  planStatus: string, 
  sections: SectionProgress[], 
  logs: any[]
): string {
  if (planStatus === 'pending') {
    return '생성 대기 중...'
  }
  
  if (planStatus === 'failed') {
    return '생성 실패'
  }
  
  if (planStatus === 'completed') {
    return '생성 완료!'
  }

  // processing 상태에서 세부 단계 판단
  const latestLog = logs[0]
  if (latestLog) {
    const stepNames: Record<string, string> = {
      'initialization': '초기화 중',
      'outline_generation': '목차 생성 중',
      'section_draft': '섹션 초안 생성 중',
      'content_refinement': '내용 보정 중',
      'citation_extraction': '인용 추출 중',
      'web_search_summary': '웹검색 각주 추가 중',
      'deep_verification': '심층 검증 중',
      'quality_assessment': '품질 평가 중'
    }
    
    return stepNames[latestLog.step_name] || '처리 중...'
  }

  // 섹션 상태로 판단
  const generatingSections = sections.filter(s => s.status === 'generating')
  if (generatingSections.length > 0) {
    return `${generatingSections[0].sectionTitle} 생성 중...`
  }

  const completedSections = sections.filter(s => s.status === 'completed').length
  const totalSections = sections.length

  if (completedSections === 0) {
    return '생성 준비 중...'
  } else if (completedSections < totalSections) {
    return `섹션 생성 중 (${completedSections}/${totalSections})`
  } else {
    return '최종 검토 중...'
  }
}

/**
 * 예상 소요 시간 계산
 */
function calculateEstimatedTime(
  status: string,
  completedSections: number,
  totalSections: number,
  startedAt: string
): number {
  if (status === 'completed' || status === 'failed') {
    return 0
  }

  // 기본 추정 시간: 9-11분 (40콜 기준)
  const totalEstimatedMinutes = 10
  
  if (completedSections === 0) {
    return totalEstimatedMinutes
  }

  // 경과 시간 계산
  const elapsed = Date.now() - new Date(startedAt).getTime()
  const elapsedMinutes = elapsed / (1000 * 60)

  // 남은 섹션 비율로 계산
  const remainingRatio = (totalSections - completedSections) / totalSections
  const estimatedRemaining = Math.max(1, totalEstimatedMinutes * remainingRatio)

  return Math.round(estimatedRemaining)
}

/**
 * 진행률 요약 정보
 */
export interface ProgressSummary {
  percentage: number
  status: string
  currentStep: string
  sectionsCompleted: number
  totalSections: number
  estimatedMinutes: number
  isCompleted: boolean
  isFailed: boolean
}

/**
 * 진행률 요약 생성 유틸리티
 */
export function getProgressSummary(progress: GenerationProgress | null): ProgressSummary {
  if (!progress) {
    return {
      percentage: 0,
      status: 'unknown',
      currentStep: '데이터 로드 중...',
      sectionsCompleted: 0,
      totalSections: 18,
      estimatedMinutes: 10,
      isCompleted: false,
      isFailed: false
    }
  }

  const sectionsCompleted = progress.sections.filter(s => s.status === 'completed').length
  
  return {
    percentage: progress.progressPercentage,
    status: progress.status,
    currentStep: progress.currentStep,
    sectionsCompleted,
    totalSections: progress.sections.length || 18,
    estimatedMinutes: progress.estimatedTimeRemaining,
    isCompleted: progress.status === 'completed',
    isFailed: progress.status === 'failed'
  }
}

/**
 * 실시간 연결 상태 훅
 */
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected')

  useEffect(() => {
    // 간단한 연결 테스트 채널
    const channel = supabase
      .channel('connection_test')
      .subscribe((status) => {
        setConnectionStatus(status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    isConnected,
    connectionStatus
  }
}

/**
 * 생성 취소 요청
 */
export async function cancelGeneration(planId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('business_plans')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)

    return !error
  } catch (error) {
    console.error('생성 취소 오류:', error)
    return false
  }
}

/**
 * 섹션 재생성 요청
 */
export async function regenerateSection(planId: string, sectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('business_plan_sections')
      .update({ 
        status: 'regenerating',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)
      .eq('plan_id', planId)

    return !error
  } catch (error) {
    console.error('섹션 재생성 오류:', error)
    return false
  }
}

/**
 * 다중 플랜 진행률 조회 (대시보드용)
 */
export async function getMultiplePlanProgress(planIds: string[]): Promise<ProgressSummary[]> {
  if (planIds.length === 0) return []

  try {
    const { data: plansData, error } = await supabase
      .from('business_plans')
      .select(`
        id,
        title,
        status,
        total_api_calls,
        quality_score,
        created_at,
        completed_at,
        business_plan_sections (
          status,
          section_order
        )
      `)
      .in('id', planIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (plansData || []).map(plan => {
      const sections = plan.business_plan_sections || []
      const completedSections = sections.filter((s: any) => s.status === 'completed').length
      const totalSections = sections.length || 18
      const percentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

      return {
        percentage,
        status: plan.status,
        currentStep: determineCurrentStep(plan.status, sections, []),
        sectionsCompleted: completedSections,
        totalSections,
        estimatedMinutes: calculateEstimatedTime(plan.status, completedSections, totalSections, plan.created_at),
        isCompleted: plan.status === 'completed',
        isFailed: plan.status === 'failed'
      }
    })

  } catch (error) {
    console.error('다중 플랜 진행률 조회 오류:', error)
    return []
  }
}