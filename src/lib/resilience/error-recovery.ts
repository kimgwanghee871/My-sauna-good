// 에러 처리 및 복원 시스템 - 재시도 및 fallback 로직
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 에러 타입 정의
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  API_RATE_LIMIT = 'api_rate_limit',
  API_QUOTA_EXCEEDED = 'api_quota_exceeded',
  MODEL_UNAVAILABLE = 'model_unavailable',
  INVALID_RESPONSE = 'invalid_response',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  exponentialBackoff: boolean
  retryableErrors: ErrorType[]
}

export interface FallbackConfig {
  fallbackModel?: string
  simplifiedPrompt?: boolean
  skipOptionalSteps?: boolean
  emergencyContent?: string
}

export interface RecoveryResult {
  success: boolean
  data?: any
  error?: string
  retriesUsed: number
  fallbackUsed: boolean
  recoveryTime: number
}

/**
 * 복원력 있는 AI 호출 클래스
 */
export class ResilientAIClient {
  private openai: OpenAI
  private defaultRetryConfig: RetryConfig
  private defaultFallbackConfig: FallbackConfig

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 60000 // 60초 타임아웃
    })

    this.defaultRetryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      exponentialBackoff: true,
      retryableErrors: [
        ErrorType.NETWORK_ERROR,
        ErrorType.API_RATE_LIMIT,
        ErrorType.TIMEOUT_ERROR,
        ErrorType.MODEL_UNAVAILABLE
      ]
    }

    this.defaultFallbackConfig = {
      fallbackModel: 'gpt-4o-mini',
      simplifiedPrompt: true,
      skipOptionalSteps: false,
      emergencyContent: '임시 콘텐츠가 생성되었습니다. 나중에 재생성해주세요.'
    }
  }

  /**
   * 복원력 있는 AI 호출
   */
  async callWithRecovery(
    prompt: string,
    model: string = 'gpt-4o-mini',
    retryConfig?: Partial<RetryConfig>,
    fallbackConfig?: Partial<FallbackConfig>
  ): Promise<RecoveryResult> {
    const startTime = Date.now()
    const config = { ...this.defaultRetryConfig, ...retryConfig }
    const fallback = { ...this.defaultFallbackConfig, ...fallbackConfig }
    
    let lastError: Error | null = null
    let retriesUsed = 0
    let fallbackUsed = false

    // 메인 시도 + 재시도
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await this.makeAICall(prompt, model)
        
        return {
          success: true,
          data: response,
          retriesUsed: attempt,
          fallbackUsed: false,
          recoveryTime: Date.now() - startTime
        }

      } catch (error) {
        lastError = error as Error
        retriesUsed = attempt
        
        const errorType = this.classifyError(error)
        console.warn(`AI 호출 실패 (시도 ${attempt + 1}):`, errorType, error.message)

        // 재시도 불가능한 에러인지 확인
        if (!config.retryableErrors.includes(errorType)) {
          console.error('재시도 불가능한 에러:', errorType)
          break
        }

        // 마지막 시도가 아니면 대기 후 재시도
        if (attempt < config.maxRetries) {
          const delayMs = this.calculateDelay(attempt, config)
          console.log(`${delayMs}ms 후 재시도...`)
          await this.delay(delayMs)
        }
      }
    }

    // 모든 시도가 실패하면 fallback 시도
    console.log('메인 시도 실패, fallback 시도 중...')
    
    try {
      const fallbackResponse = await this.tryFallback(prompt, fallback)
      fallbackUsed = true
      
      return {
        success: true,
        data: fallbackResponse,
        retriesUsed,
        fallbackUsed: true,
        recoveryTime: Date.now() - startTime
      }

    } catch (fallbackError) {
      console.error('Fallback 시도도 실패:', fallbackError)
      
      return {
        success: false,
        error: `모든 복구 시도 실패. 원본 에러: ${lastError?.message}`,
        retriesUsed,
        fallbackUsed: true,
        recoveryTime: Date.now() - startTime
      }
    }
  }

  /**
   * 기본 AI 호출
   */
  private async makeAICall(prompt: string, model: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 응답이 비어있습니다')
    }

    return content
  }

  /**
   * Fallback 시도
   */
  private async tryFallback(prompt: string, config: FallbackConfig): Promise<string> {
    // 1. 모델 변경 시도
    if (config.fallbackModel) {
      try {
        console.log(`Fallback 모델 시도: ${config.fallbackModel}`)
        return await this.makeAICall(prompt, config.fallbackModel)
      } catch (error) {
        console.warn('Fallback 모델 실패:', error)
      }
    }

    // 2. 간소화된 프롬프트 시도
    if (config.simplifiedPrompt) {
      try {
        const simplifiedPrompt = this.simplifyPrompt(prompt)
        console.log('간소화된 프롬프트 시도')
        return await this.makeAICall(simplifiedPrompt, config.fallbackModel || 'gpt-4o-mini')
      } catch (error) {
        console.warn('간소화 프롬프트 실패:', error)
      }
    }

    // 3. 응급 콘텐츠 반환
    if (config.emergencyContent) {
      console.log('응급 콘텐츠 사용')
      return config.emergencyContent
    }

    throw new Error('모든 fallback 옵션 실패')
  }

  /**
   * 에러 분류
   */
  private classifyError(error: any): ErrorType {
    const message = error.message?.toLowerCase() || ''
    const status = error.status || error.response?.status

    if (status === 429) {
      return ErrorType.API_RATE_LIMIT
    }
    
    if (status === 403 && message.includes('quota')) {
      return ErrorType.API_QUOTA_EXCEEDED
    }
    
    if (status >= 500 || message.includes('model') && message.includes('unavailable')) {
      return ErrorType.MODEL_UNAVAILABLE
    }
    
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return ErrorType.TIMEOUT_ERROR
    }
    
    if (message.includes('network') || message.includes('ECONNREFUSED')) {
      return ErrorType.NETWORK_ERROR
    }
    
    if (message.includes('invalid') && message.includes('response')) {
      return ErrorType.INVALID_RESPONSE
    }

    return ErrorType.UNKNOWN_ERROR
  }

  /**
   * 재시도 지연 시간 계산
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    if (!config.exponentialBackoff) {
      return config.baseDelayMs
    }

    // 지수 백오프 + 지터
    const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
    const jitter = Math.random() * 1000 // 0-1초 랜덤 지연
    const totalDelay = exponentialDelay + jitter

    return Math.min(totalDelay, config.maxDelayMs)
  }

  /**
   * 프롬프트 간소화
   */
  private simplifyPrompt(prompt: string): string {
    // 복잡한 프롬프트를 간소화
    const lines = prompt.split('\n')
    const essentialLines = lines.slice(0, 10) // 첫 10줄만 유지
    
    return essentialLines.join('\n') + '\n\n간단히 요약해서 작성해주세요.'
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 오케스트레이션 단계별 복구 전략
 */
export class OrchestrationRecovery {
  private aiClient: ResilientAIClient
  
  constructor() {
    this.aiClient = new ResilientAIClient()
  }

  /**
   * 목차 생성 복구
   */
  async recoverOutlineGeneration(planId: string, prompt: string): Promise<RecoveryResult> {
    const retryConfig = {
      maxRetries: 5, // 목차 생성은 중요하므로 재시도 횟수 증가
      retryableErrors: [
        ErrorType.NETWORK_ERROR,
        ErrorType.API_RATE_LIMIT,
        ErrorType.TIMEOUT_ERROR
      ]
    }

    const fallbackConfig = {
      fallbackModel: 'gpt-4o-mini',
      emergencyContent: this.getEmergencyOutline(planId)
    }

    const result = await this.aiClient.callWithRecovery(
      prompt,
      'gpt-4o-mini',
      retryConfig,
      fallbackConfig
    )

    // 복구 로그 기록
    await this.logRecovery(planId, 'outline_generation', result)
    
    return result
  }

  /**
   * 섹션 생성 복구
   */
  async recoverSectionGeneration(
    planId: string, 
    sectionCode: string, 
    prompt: string
  ): Promise<RecoveryResult> {
    const retryConfig = {
      maxRetries: 3,
      baseDelayMs: 2000, // 섹션 생성은 지연 시간 증가
    }

    const fallbackConfig = {
      fallbackModel: 'gpt-4o-mini',
      simplifiedPrompt: true,
      emergencyContent: this.getEmergencySection(sectionCode)
    }

    const result = await this.aiClient.callWithRecovery(
      prompt,
      'gpt-4o-mini',
      retryConfig,
      fallbackConfig
    )

    await this.logRecovery(planId, `section_${sectionCode}`, result)
    
    // 섹션별 복구 상태 업데이트
    if (result.success) {
      await supabase
        .from('business_plan_sections')
        .update({ 
          status: 'completed',
          draft_content: result.data 
        })
        .eq('plan_id', planId)
        .eq('section_code', sectionCode)
    } else {
      await supabase
        .from('business_plan_sections')
        .update({ status: 'failed' })
        .eq('plan_id', planId)
        .eq('section_code', sectionCode)
    }
    
    return result
  }

  /**
   * 통합 보정 복구
   */
  async recoverContentRefinement(planId: string, prompt: string): Promise<RecoveryResult> {
    const retryConfig = {
      maxRetries: 2, // 보정은 비교적 덜 중요하므로 재시도 적게
    }

    const fallbackConfig = {
      skipOptionalSteps: true, // 보정 단계 건너뛰기 허용
      emergencyContent: '원본 내용을 그대로 사용합니다.'
    }

    const result = await this.aiClient.callWithRecovery(
      prompt,
      'gpt-4o',
      retryConfig,
      fallbackConfig
    )

    await this.logRecovery(planId, 'content_refinement', result)
    return result
  }

  /**
   * 품질 평가 복구
   */
  async recoverQualityAssessment(planId: string, prompt: string): Promise<RecoveryResult> {
    const retryConfig = {
      maxRetries: 2,
    }

    const fallbackConfig = {
      emergencyContent: JSON.stringify({
        score: 75, // 기본 점수
        strengths: ['기본 요구사항 충족', '구조적 완성도'],
        improvements: ['세부 내용 보완 필요']
      })
    }

    const result = await this.aiClient.callWithRecovery(
      prompt,
      'gpt-4o',
      retryConfig,
      fallbackConfig
    )

    await this.logRecovery(planId, 'quality_assessment', result)
    return result
  }

  /**
   * 복구 로그 기록
   */
  private async logRecovery(
    planId: string, 
    stepName: string, 
    result: RecoveryResult
  ): Promise<void> {
    try {
      await supabase
        .from('generation_logs')
        .insert({
          plan_id: planId,
          step_name: `recovery_${stepName}`,
          step_order: 999, // 복구 로그는 높은 순서
          model: 'recovery_system',
          status: result.success ? 'completed' : 'failed',
          response_text: result.success ? 'Recovery successful' : result.error,
          duration_ms: result.recoveryTime,
          retry_count: result.retriesUsed,
          error_message: result.success ? null : result.error
        })
    } catch (error) {
      console.error('복구 로그 저장 실패:', error)
    }
  }

  /**
   * 응급 목차 생성
   */
  private getEmergencyOutline(planId: string): string {
    return JSON.stringify({
      sections: [
        { order: 1, title: '사업 개요', description: '기본 사업 정보' },
        { order: 2, title: '시장 분석', description: '시장 현황 및 기회' },
        { order: 3, title: '제품·서비스', description: '제품 설명 및 특징' },
        { order: 4, title: '경쟁 분석', description: '경쟁사 현황 및 차별점' },
        { order: 5, title: '마케팅 전략', description: '고객 획득 및 판매 전략' },
        { order: 6, title: '운영 계획', description: '사업 운영 방안' },
        { order: 7, title: '재무 계획', description: '재무 현황 및 전망' },
        { order: 8, title: '위험 관리', description: '리스크 요소 및 대응' }
      ]
    })
  }

  /**
   * 응급 섹션 내용 생성
   */
  private getEmergencySection(sectionCode: string): string {
    const emergencyContents: Record<string, string> = {
      'executive_summary': '이 섹션은 임시로 생성된 내용입니다. 사업의 핵심 내용을 요약하여 작성해주세요.',
      'market_analysis': '시장 분석 내용을 보완해주세요. 시장 규모, 성장률, 주요 트렌드 등을 포함하세요.',
      'financial_projections': '재무 전망을 상세히 작성해주세요. 매출 계획, 비용 구조, 수익성 분석을 포함하세요.'
    }

    return emergencyContents[sectionCode] || 
           `${sectionCode} 섹션의 내용을 작성해주세요. 임시 콘텐츠입니다.`
  }
}

/**
 * 시스템 헬스 체크
 */
export class SystemHealthChecker {
  /**
   * OpenAI API 상태 확인
   */
  async checkOpenAIHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
      
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
      
      return {
        healthy: true,
        latency: Date.now() - startTime
      }
      
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Supabase 연결 확인
   */
  async checkSupabaseHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const { error } = await supabase
        .from('business_plans')
        .select('id')
        .limit(1)
      
      if (error) throw error
      
      return {
        healthy: true,
        latency: Date.now() - startTime
      }
      
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 전체 시스템 헬스 체크
   */
  async checkSystemHealth(): Promise<{
    overall: boolean
    services: {
      openai: { healthy: boolean; latency?: number; error?: string }
      supabase: { healthy: boolean; latency?: number; error?: string }
    }
  }> {
    const [openaiHealth, supabaseHealth] = await Promise.all([
      this.checkOpenAIHealth(),
      this.checkSupabaseHealth()
    ])

    return {
      overall: openaiHealth.healthy && supabaseHealth.healthy,
      services: {
        openai: openaiHealth,
        supabase: supabaseHealth
      }
    }
  }
}

// 전역 인스턴스들
export const resilientAI = new ResilientAIClient()
export const orchestrationRecovery = new OrchestrationRecovery()
export const healthChecker = new SystemHealthChecker()