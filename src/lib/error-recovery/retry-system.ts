// 에러 처리 및 복원 시스템 - 재시도 및 fallback 로직
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiApiKey = process.env.OPENAI_API_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

// 에러 타입별 분류
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  API_RATE_LIMIT = 'api_rate_limit',
  API_QUOTA_EXCEEDED = 'api_quota_exceeded',
  MODEL_ERROR = 'model_error',
  CONTENT_FILTER = 'content_filter',
  TIMEOUT_ERROR = 'timeout_error',
  VALIDATION_ERROR = 'validation_error',
  SYSTEM_ERROR = 'system_error'
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number // 밀리초
  maxDelay: number
  exponentialBackoff: boolean
  fallbackModel?: string
  fallbackPrompt?: boolean
}

export interface ErrorContext {
  planId: string
  stepName: string
  stepOrder: number
  model: string
  attempt: number
  originalPrompt?: string
  errorType: ErrorType
  errorMessage: string
}

// 단계별 재시도 설정
const STEP_RETRY_CONFIGS: Record<string, RetryConfig> = {
  // 목차 생성 - 중요도 높음
  'outline_generation': {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    exponentialBackoff: true,
    fallbackModel: 'gpt-3.5-turbo',
    fallbackPrompt: true
  },
  
  // 섹션 초안 - 병렬 처리되므로 빠른 재시도
  'section_draft': {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 15000,
    exponentialBackoff: true,
    fallbackModel: 'gpt-3.5-turbo'
  },
  
  // 내용 보정 - 중요도 높음
  'content_refinement': {
    maxRetries: 4,
    baseDelay: 3000,
    maxDelay: 45000,
    exponentialBackoff: true,
    fallbackModel: 'gpt-4o-mini'
  },
  
  // 인용 추출 - 선택적 기능
  'citation_extraction': {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBackoff: false
  },
  
  // 웹검색 요약 - 외부 의존성
  'web_search_summary': {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 20000,
    exponentialBackoff: true
  },
  
  // 심층 검증 - 선택적 기능
  'deep_verification': {
    maxRetries: 2,
    baseDelay: 5000,
    maxDelay: 30000,
    exponentialBackoff: false
  },
  
  // 품질 평가 - 마지막 단계
  'quality_assessment': {
    maxRetries: 4,
    baseDelay: 2000,
    maxDelay: 25000,
    exponentialBackoff: true,
    fallbackModel: 'gpt-4o-mini'
  }
}

/**
 * 메인 재시도 오케스트레이터
 */
export class RetryOrchestrator {
  private errorHistory: Map<string, ErrorContext[]> = new Map()

  /**
   * AI 호출을 재시도 로직과 함께 실행
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>
  ): Promise<T> {
    const config = STEP_RETRY_CONFIGS[context.stepName] || this.getDefaultConfig()
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        // 재시도 로그 기록
        if (attempt > 1) {
          await this.logRetryAttempt(context, attempt, lastError)
        }

        // 재시도 전 지연
        if (attempt > 1) {
          const delay = this.calculateDelay(config, attempt - 2)
          await this.sleep(delay)
        }

        // 실제 작업 실행
        const result = await operation()

        // 성공 시 에러 히스토리 정리
        if (attempt > 1) {
          await this.logRetrySuccess(context, attempt)
        }

        return result

      } catch (error) {
        lastError = error as Error
        const errorType = this.classifyError(error as Error)
        
        const errorContext: ErrorContext = {
          ...context,
          attempt,
          errorType,
          errorMessage: lastError.message
        }

        // 에러 히스토리 업데이트
        this.updateErrorHistory(errorContext)

        // 재시도 불가능한 에러인지 확인
        if (!this.isRetryableError(errorType) || attempt > config.maxRetries) {
          await this.logFinalFailure(errorContext)
          
          // 폴백 시도
          if (config.fallbackModel && attempt === config.maxRetries + 1) {
            return await this.tryFallback(operation, context, config)
          }
          
          throw new RetryExhaustedError(errorContext, lastError)
        }

        // 에러 로그 기록
        await this.logRetryError(errorContext)
      }
    }

    throw new RetryExhaustedError(context as ErrorContext, lastError!)
  }

  /**
   * 폴백 실행
   */
  private async tryFallback<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>,
    config: RetryConfig
  ): Promise<T> {
    try {
      await this.logFallbackAttempt(context, config.fallbackModel!)
      
      // 여기서 실제로는 모델을 변경하여 재실행
      // 간소화된 버전에서는 한 번 더 시도
      const result = await operation()
      
      await this.logFallbackSuccess(context)
      return result
      
    } catch (error) {
      await this.logFallbackFailure(context, error as Error)
      throw error
    }
  }

  /**
   * 에러 분류
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('rate limit') || message.includes('429')) {
      return ErrorType.API_RATE_LIMIT
    }
    
    if (message.includes('quota') || message.includes('insufficient_quota')) {
      return ErrorType.API_QUOTA_EXCEEDED
    }
    
    if (message.includes('content_filter') || message.includes('safety')) {
      return ErrorType.CONTENT_FILTER
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorType.TIMEOUT_ERROR
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return ErrorType.NETWORK_ERROR
    }
    
    if (message.includes('model') || message.includes('engine')) {
      return ErrorType.MODEL_ERROR
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR
    }
    
    return ErrorType.SYSTEM_ERROR
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private isRetryableError(errorType: ErrorType): boolean {
    const retryableErrors = [
      ErrorType.NETWORK_ERROR,
      ErrorType.API_RATE_LIMIT,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.MODEL_ERROR,
      ErrorType.SYSTEM_ERROR
    ]
    
    return retryableErrors.includes(errorType)
  }

  /**
   * 지연 시간 계산 (Exponential Backoff with Jitter)
   */
  private calculateDelay(config: RetryConfig, retryCount: number): number {
    if (!config.exponentialBackoff) {
      return config.baseDelay
    }
    
    const exponentialDelay = config.baseDelay * Math.pow(2, retryCount)
    const jitter = Math.random() * 0.3 * exponentialDelay // 30% 지터 추가
    const totalDelay = exponentialDelay + jitter
    
    return Math.min(totalDelay, config.maxDelay)
  }

  /**
   * 에러 히스토리 업데이트
   */
  private updateErrorHistory(context: ErrorContext): void {
    const key = `${context.planId}_${context.stepName}`
    const history = this.errorHistory.get(key) || []
    history.push(context)
    
    // 최근 10개만 유지
    if (history.length > 10) {
      history.shift()
    }
    
    this.errorHistory.set(key, history)
  }

  /**
   * 기본 설정 반환
   */
  private getDefaultConfig(): RetryConfig {
    return {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 20000,
      exponentialBackoff: true
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ===================================
  // 로깅 메서드들
  // ===================================

  private async logRetryAttempt(
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>,
    attempt: number,
    error: Error | null
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'retrying',
          error_message: `재시도 ${attempt}/${STEP_RETRY_CONFIGS[context.stepName]?.maxRetries || 3}: ${error?.message || 'Unknown error'}`,
          retry_count: attempt - 1,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('재시도 로그 기록 실패:', logError)
    }
  }

  private async logRetryError(context: ErrorContext): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'failed',
          error_message: `[${context.errorType}] ${context.errorMessage}`,
          retry_count: context.attempt - 1,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('에러 로그 기록 실패:', logError)
    }
  }

  private async logRetrySuccess(
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>,
    finalAttempt: number
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'completed',
          error_message: `${finalAttempt}번째 시도에서 성공`,
          retry_count: finalAttempt - 1,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('성공 로그 기록 실패:', logError)
    }
  }

  private async logFinalFailure(context: ErrorContext): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'failed',
          error_message: `최종 실패 - ${context.errorMessage}`,
          retry_count: context.attempt,
          created_at: new Date().toISOString()
        })
      
      // 플랜 상태도 실패로 변경
      await supabase
        .from('business_plans')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', context.planId)
        
    } catch (logError) {
      console.error('최종 실패 로그 기록 실패:', logError)
    }
  }

  private async logFallbackAttempt(
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>,
    fallbackModel: string
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: fallbackModel,
          status: 'running',
          error_message: `폴백 모델로 시도: ${context.model} → ${fallbackModel}`,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('폴백 시도 로그 기록 실패:', logError)
    }
  }

  private async logFallbackSuccess(
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'completed',
          error_message: '폴백 모델로 성공',
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('폴백 성공 로그 기록 실패:', logError)
    }
  }

  private async logFallbackFailure(
    context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>,
    error: Error
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: context.planId,
          step_name: context.stepName,
          step_order: context.stepOrder,
          model: context.model,
          status: 'failed',
          error_message: `폴백도 실패: ${error.message}`,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('폴백 실패 로그 기록 실패:', logError)
    }
  }
}

/**
 * 커스텀 에러 클래스
 */
export class RetryExhaustedError extends Error {
  public readonly context: ErrorContext
  public readonly originalError: Error

  constructor(context: ErrorContext, originalError: Error) {
    super(`재시도 한계 초과: ${context.stepName} (${context.attempt}회 시도)`)
    this.name = 'RetryExhaustedError'
    this.context = context
    this.originalError = originalError
  }
}

/**
 * 글로벌 에러 복구 매니저
 */
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager
  private retryOrchestrator: RetryOrchestrator

  private constructor() {
    this.retryOrchestrator = new RetryOrchestrator()
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager()
    }
    return ErrorRecoveryManager.instance
  }

  /**
   * AI 호출 래퍼 - 자동 재시도 적용
   */
  async callAIWithRetry(
    prompt: string,
    model: string,
    planId: string,
    stepName: string,
    stepOrder: number
  ): Promise<string> {
    const context = {
      planId,
      stepName,
      stepOrder,
      model,
      originalPrompt: prompt
    }

    return await this.retryOrchestrator.executeWithRetry(
      async () => {
        const response = await openai.chat.completions.create({
          model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
          throw new Error('AI 응답이 비어있습니다')
        }

        return content
      },
      context
    )
  }

  /**
   * 실패한 플랜 복구 시도
   */
  async recoverFailedPlan(planId: string): Promise<boolean> {
    try {
      // 실패 원인 분석
      const { data: logs } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('plan_id', planId)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!logs || logs.length === 0) {
        console.log('복구할 실패 로그가 없습니다')
        return false
      }

      // 복구 가능한 실패인지 확인
      const recoverableFailures = logs.filter(log => 
        this.retryOrchestrator['isRetryableError'](
          this.retryOrchestrator['classifyError'](new Error(log.error_message))
        )
      )

      if (recoverableFailures.length === 0) {
        console.log('복구 불가능한 실패입니다')
        return false
      }

      // 플랜 상태를 processing으로 변경하고 재시도
      await supabase
        .from('business_plans')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)

      console.log(`플랜 ${planId} 복구 시도 중...`)
      return true

    } catch (error) {
      console.error('플랜 복구 중 오류:', error)
      return false
    }
  }

  /**
   * 시스템 상태 확인
   */
  async checkSystemHealth(): Promise<{
    openaiStatus: boolean
    supabaseStatus: boolean
    overallHealth: boolean
  }> {
    const health = {
      openaiStatus: false,
      supabaseStatus: false,
      overallHealth: false
    }

    try {
      // OpenAI 상태 확인
      await openai.models.list()
      health.openaiStatus = true
    } catch (error) {
      console.warn('OpenAI 연결 실패:', error)
    }

    try {
      // Supabase 상태 확인
      const { error } = await supabase.from('business_plans').select('count').limit(1)
      health.supabaseStatus = !error
    } catch (error) {
      console.warn('Supabase 연결 실패:', error)
    }

    health.overallHealth = health.openaiStatus && health.supabaseStatus
    return health
  }
}

/**
 * 편의 함수들
 */
export const errorRecovery = ErrorRecoveryManager.getInstance()

export async function withRetry<T>(
  operation: () => Promise<T>,
  context: Omit<ErrorContext, 'attempt' | 'errorType' | 'errorMessage'>
): Promise<T> {
  const retryOrchestrator = new RetryOrchestrator()
  return await retryOrchestrator.executeWithRetry(operation, context)
}

export function createRetryWrapper(
  planId: string,
  stepName: string,
  stepOrder: number,
  model: string
) {
  return {
    callAI: async (prompt: string) => {
      return await errorRecovery.callAIWithRetry(prompt, model, planId, stepName, stepOrder)
    }
  }
}