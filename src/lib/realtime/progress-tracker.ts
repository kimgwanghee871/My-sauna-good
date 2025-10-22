'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

// === Supabase 'business_plans' row 타입 ===
type PlanRow = {
  id: string
  status: 'initializing' | 'analyzing' | 'generating' | 'completing' | 'completed' | 'failed' | 'cancelled'
  current_step?: string | null
  total_steps?: number | null
  completed_steps?: number | null
  total_api_calls?: number | null
  quality_score?: number | null
  created_at: string
  completed_at?: string | null
  error?: string | null
}

// === Supabase 'business_plan_sections' row 타입 ===
type SectionRow = {
  id: string
  title: string
  section_order: number
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'regenerating'
  word_count?: number | null
  has_visualization: boolean
  created_at: string
  updated_at: string
  error?: string | null
}

// === Supabase 'generation_logs' row 타입 ===
type LogRow = {
  id: string
  plan_id: string
  step_order?: number | null
  step_name?: string | null
  status?: 'running' | 'completed' | 'failed' | null
  model?: string | null
  duration?: number | null
  created_at: string
  error?: string | null
}

// Types for progress tracking
export interface SectionProgress {
  sectionId: string
  sectionTitle: string
  sectionOrder: number
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'regenerating'
  wordCount?: number
  hasVisualization: boolean
  startedAt?: string
  completedAt?: string
  error?: string
}

export interface GenerationLog {
  id: string
  planId: string
  stepOrder: number
  stepName: string
  status: 'running' | 'completed' | 'failed'
  model: string
  duration?: number
  createdAt: string
  error?: string
}

export interface GenerationProgress {
  planId: string
  status: 'initializing' | 'analyzing' | 'generating' | 'completing' | 'completed' | 'failed' | 'cancelled'
  currentStep: string
  totalSteps: number
  completedSteps: number
  totalApiCalls: number
  sections: SectionProgress[]
  logs: GenerationLog[]
  qualityScore?: number
  startedAt: string
  completedAt?: string
  error?: string
}

export interface ProgressSummary {
  isCompleted: boolean
  isFailed: boolean
  percentage: number
  currentStep: string
  sectionsCompleted: number
  totalSections: number
  estimatedMinutes: number
}

/**
 * 실시간 생성 진행률 추적 훅
 */
export function useGenerationProgress(planId: string) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = supabaseBrowser()

  // 진행률 데이터 조회
  const fetchProgress = useCallback(async () => {
    try {
      setError(null)
      
      // ✅ 제네릭 타입 + maybeSingle() 사용
      const { data: planData, error: planError } = await supabase
        .from('business_plans')
        .select(`
          id,
          status,
          current_step,
          total_steps,
          completed_steps,
          total_api_calls,
          quality_score,
          created_at,
          completed_at,
          error
        `)
        .eq('id', planId)
        .maybeSingle<PlanRow>()

      if (planError) {
        throw new Error(`진행률 조회 실패: ${planError.message}`)
      }

      if (!planData) {
        throw new Error('사업계획서를 찾을 수 없습니다.')
      }

      // 섹션 진행률 조회
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('business_plan_sections')
        .select(`
          id,
          title,
          section_order,
          status,
          word_count,
          has_visualization,
          created_at,
          updated_at,
          error
        `)
        .eq('plan_id', planId)
        .order('section_order')

      if (sectionsError) {
        console.warn('섹션 조회 오류:', sectionsError.message)
      }

      // ✅ 생성 로그 조회 (제네릭 타입 + 명시적 컬럼)
      const { data: logsData, error: logsError } = await supabase
        .from('generation_logs')
        .select('id,plan_id,step_order,step_name,status,model,duration,created_at,error')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsError) {
        console.warn('로그 조회 오류:', logsError.message)
      }

      // ✅ 타입 안전한 진행률 데이터 구성
      const progressData: GenerationProgress = {
        planId: planData.id,
        status: planData.status,
        currentStep: planData.current_step ?? '초기화 중...',
        totalSteps: planData.total_steps ?? 40,
        completedSteps: planData.completed_steps ?? 0,
        totalApiCalls: planData.total_api_calls ?? 0,
        sections: (sectionsData || []).map((section: SectionRow) => ({
          sectionId: section.id,
          sectionTitle: section.title,
          sectionOrder: section.section_order,
          status: section.status,
          wordCount: section.word_count ?? undefined,
          hasVisualization: section.has_visualization || false,
          startedAt: section.created_at,
          completedAt: section.updated_at,
          error: section.error ?? undefined
        })),
        logs: (logsData || []).map((log: LogRow) => ({
          id: log.id,
          planId: log.plan_id,
          stepOrder: log.step_order ?? 0,
          stepName: log.step_name ?? '',
          status: log.status ?? 'running',
          model: log.model ?? '',
          duration: log.duration ?? undefined,
          createdAt: log.created_at,
          error: log.error ?? undefined
        })),
        qualityScore: planData.quality_score ?? undefined,
        startedAt: planData.created_at,
        completedAt: planData.completed_at ?? undefined,
        error: planData.error ?? undefined
      }

      setProgress(progressData)
      setIsConnected(true)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
      setIsConnected(false)
      console.error('진행률 조회 오류:', err)
    }
  }, [planId, supabase])

  // 실시간 업데이트 구독
  useEffect(() => {
    // 초기 데이터 로드
    fetchProgress()

    // 실시간 구독 설정
    const channel = supabase
      .channel(`generation-progress-${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_plans',
          filter: `id=eq.${planId}`
        },
        () => {
          fetchProgress()
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
        () => {
          fetchProgress()
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
        () => {
          fetchProgress()
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [planId, fetchProgress, supabase])

  return {
    progress,
    isConnected,
    error,
    refresh: fetchProgress
  }
}

/**
 * 진행률 요약 정보 생성
 */
export function getProgressSummary(progress: GenerationProgress | null): ProgressSummary {
  if (!progress) {
    return {
      isCompleted: false,
      isFailed: false,
      percentage: 0,
      currentStep: '로딩 중...',
      sectionsCompleted: 0,
      totalSections: 0,
      estimatedMinutes: 0
    }
  }

  const isCompleted = progress.status === 'completed'
  const isFailed = progress.status === 'failed'
  
  // 전체 진행률 계산 (API 호출 기준)
  const percentage = Math.min(100, Math.round((progress.completedSteps / progress.totalSteps) * 100))
  
  // 섹션 완료 개수
  const sectionsCompleted = progress.sections.filter(s => s.status === 'completed').length
  const totalSections = progress.sections.length
  
  // 남은 시간 추정 (분)
  const remainingSteps = progress.totalSteps - progress.completedSteps
  const estimatedMinutes = Math.max(1, Math.ceil(remainingSteps * 0.5)) // 스텝당 30초 추정

  return {
    isCompleted,
    isFailed,
    percentage,
    currentStep: progress.currentStep,
    sectionsCompleted,
    totalSections,
    estimatedMinutes: isCompleted || isFailed ? 0 : estimatedMinutes
  }
}

/**
 * 생성 취소
 */
export async function cancelGeneration(planId: string): Promise<boolean> {
  try {
    const supabase = supabaseBrowser()
    
    // ✅ 타입 우회: any 사용으로 Supabase 타입 충돌 완전 제거
    const { error } = await (supabase as any)
      .from('business_plans')
      .update({
        status: 'cancelled',
        current_step: '생성이 취소되었습니다.',
        completed_at: new Date().toISOString()
      })
      .eq('id', planId)

    if (error) {
      console.error('생성 취소 오류:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('생성 취소 오류:', err)
    return false
  }
}

/**
 * 섹션 재생성 요청
 */
export async function regenerateSection(planId: string, sectionId: string): Promise<boolean> {
  try {
    const supabase = supabaseBrowser()
    
    // ✅ 타입 우회: 섹션 업데이트
    const { error } = await (supabase as any)
      .from('business_plan_sections')
      .update({
        status: 'regenerating',
        error: null
      })
      .eq('id', sectionId)
      .eq('plan_id', planId)

    if (error) {
      console.error('섹션 재생성 요청 오류:', error)
      return false
    }
    
    // ✅ 타입 우회: 로그 추가
    await (supabase as any)
      .from('generation_logs')
      .insert({
        plan_id: planId,
        step_order: 999, // 재생성은 별도 순서
        step_name: `섹션 재생성 요청`,
        status: 'running',
        model: 'manual',
        created_at: new Date().toISOString()
      })

    return true
  } catch (err) {
    console.error('섹션 재생성 요청 오류:', err)
    return false
  }
}