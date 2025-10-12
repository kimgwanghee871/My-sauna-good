// AI 사업계획서 생성 오케스트레이터
import { v4 as uuidv4 } from 'uuid'
import { TemplateType, UserInputs, BusinessPlan, PlanSection } from '@/types/template'
import { getTemplate, sectionOrder } from '@/lib/templates'
import { generateText, generateJSON, AIResponse } from '@/lib/openai'
import { generateSectionPrompt, generateConsistencyCheckPrompt, generateQualityAssessmentPrompt } from '@/lib/prompts'

export interface GenerationProgress {
  jobId: string
  status: 'queued' | 'running' | 'completed' | 'error'
  progress: number
  currentStep: string
  estimatedTimeRemaining: number
  sections: Array<{
    code: string
    status: 'pending' | 'generating' | 'completed' | 'error'
    wordCount?: number
  }>
}

export interface GenerationResult {
  success: boolean
  businessPlan?: BusinessPlan
  error?: string
  totalCost: number
  usage: {
    totalTokens: number
    totalRequests: number
    generationTime: number
  }
}

// 생성 작업 저장소 (실제로는 Redis 등 사용)
const generationJobs = new Map<string, GenerationProgress>()

export class BusinessPlanOrchestrator {
  private jobId: string
  private template: TemplateType
  private userInputs: UserInputs
  private userId: string
  
  constructor(template: TemplateType, userInputs: UserInputs, userId: string) {
    this.jobId = uuidv4()
    this.template = template
    this.userInputs = userInputs
    this.userId = userId
  }

  // 생성 작업 시작
  async startGeneration(): Promise<string> {
    const templateConfig = getTemplate(this.template)
    const sections = sectionOrder[this.template]

    // 초기 진행상황 설정
    const progress: GenerationProgress = {
      jobId: this.jobId,
      status: 'queued',
      progress: 0,
      currentStep: '작업 준비 중...',
      estimatedTimeRemaining: sections.length * 30, // 섹션당 30초 추정
      sections: sections.map(code => ({
        code,
        status: 'pending'
      }))
    }

    generationJobs.set(this.jobId, progress)

    // 백그라운드에서 실제 생성 작업 실행
    this.executeGeneration().catch(error => {
      console.error('Generation failed:', error)
      this.updateProgress({
        status: 'error',
        currentStep: `생성 실패: ${error.message}`,
      })
    })

    return this.jobId
  }

  // 진행상황 조회
  static getProgress(jobId: string): GenerationProgress | null {
    return generationJobs.get(jobId) || null
  }

  // 진행상황 업데이트
  private updateProgress(updates: Partial<GenerationProgress>) {
    const current = generationJobs.get(this.jobId)
    if (current) {
      const updated = { ...current, ...updates }
      generationJobs.set(this.jobId, updated)
    }
  }

  // 실제 생성 로직 실행
  private async executeGeneration(): Promise<void> {
    const startTime = Date.now()
    let totalCost = 0
    let totalTokens = 0
    let totalRequests = 0
    const sections: PlanSection[] = []

    try {
      this.updateProgress({ 
        status: 'running',
        currentStep: '생성 시작...',
        progress: 5 
      })

      const templateConfig = getTemplate(this.template)
      const sectionCodes = sectionOrder[this.template]
      
      // 1단계: 프리필 (미니모델로 키워드 추출)
      this.updateProgress({ 
        currentStep: '핵심 키워드 분석 중...',
        progress: 10 
      })

      const keywordsResponse = await this.generateKeywords()
      totalCost += keywordsResponse.cost
      totalTokens += keywordsResponse.usage.totalTokens
      totalRequests += 1

      // 2단계: 섹션별 병렬 생성 (동시성 제한)
      this.updateProgress({ 
        currentStep: '섹션별 내용 생성 중...',
        progress: 20 
      })

      const concurrencyLimit = 3
      for (let i = 0; i < sectionCodes.length; i += concurrencyLimit) {
        const batch = sectionCodes.slice(i, i + concurrencyLimit)
        const batchPromises = batch.map(async (sectionCode, batchIndex) => {
          const globalIndex = i + batchIndex
          
          // 섹션 상태 업데이트
          this.updateSectionStatus(sectionCode, 'generating')
          this.updateProgress({ 
            currentStep: `${this.getSectionTitle(sectionCode)} 생성 중...`,
            progress: 20 + (globalIndex / sectionCodes.length) * 60
          })

          try {
            const section = await this.generateSection(sectionCode)
            totalCost += section.cost
            totalTokens += section.usage.totalTokens
            totalRequests += 1
            
            const planSection: PlanSection = {
              code: sectionCode,
              title: this.getSectionTitle(sectionCode),
              content: section.content,
              wordCount: section.content.length,
              citations: [], // TODO: 인용 추출 로직
            }

            sections.push(planSection)
            this.updateSectionStatus(sectionCode, 'completed')

            return planSection
          } catch (error) {
            console.error(`Section ${sectionCode} generation failed:`, error)
            this.updateSectionStatus(sectionCode, 'error')
            throw error
          }
        })

        await Promise.all(batchPromises)
        
        // 배치 간 딜레이
        if (i + concurrencyLimit < sectionCodes.length) {
          await this.delay(2000)
        }
      }

      // 3단계: 일관성 검증 및 보정
      this.updateProgress({ 
        currentStep: '내용 일관성 검증 중...',
        progress: 85 
      })

      const consistencyCheck = await this.checkConsistency(sections)
      totalCost += consistencyCheck.cost
      totalTokens += consistencyCheck.usage.totalTokens
      totalRequests += 1

      // 4단계: 품질 평가
      this.updateProgress({ 
        currentStep: '품질 평가 및 마무리 중...',
        progress: 95 
      })

      const qualityAssessment = await this.assessQuality(sections)
      totalCost += qualityAssessment.cost
      totalTokens += qualityAssessment.usage.totalTokens
      totalRequests += 1

      // 5단계: 최종 BusinessPlan 객체 생성
      const businessPlan: BusinessPlan = {
        id: this.jobId,
        userId: this.userId,
        template: this.template,
        title: this.userInputs.title,
        inputs: this.userInputs,
        sections: sections.sort((a, b) => {
          const aIndex = sectionCodes.indexOf(a.code)
          const bIndex = sectionCodes.indexOf(b.code)
          return aIndex - bIndex
        }),
        status: 'completed',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        citations: [], // TODO: 전체 인용 목록
      }

      // 결과 저장 (실제로는 DB에 저장)
      this.savePlan(businessPlan)

      const generationTime = Date.now() - startTime

      this.updateProgress({
        status: 'completed',
        progress: 100,
        currentStep: '생성 완료!',
        estimatedTimeRemaining: 0,
      })

      console.log('Generation completed:', {
        jobId: this.jobId,
        totalCost: totalCost.toFixed(4),
        totalTokens,
        totalRequests,
        generationTime: `${generationTime}ms`,
      })

    } catch (error) {
      console.error('Generation error:', error)
      this.updateProgress({
        status: 'error',
        currentStep: `생성 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      throw error
    }
  }

  // 키워드 추출 (프리필)
  private async generateKeywords(): Promise<AIResponse> {
    const prompt = `다음 사업 정보에서 핵심 키워드를 추출해주세요:
    
${JSON.stringify(this.userInputs, null, 2)}

업계 키워드, 기술 키워드, 시장 키워드를 각각 5개씩 추출하여 JSON으로 응답:
{
  "industry": ["키워드1", "키워드2", ...],
  "technology": ["키워드1", "키워드2", ...],
  "market": ["키워드1", "키워드2", ...]
}`

    return generateText(prompt, { model: 'CHEAP', temperature: 0.3 })
  }

  // 섹션 생성
  private async generateSection(sectionCode: string): Promise<AIResponse> {
    const templateConfig = getTemplate(this.template)
    const sectionConfig = templateConfig.sections.find(s => s.code === sectionCode)
    
    if (!sectionConfig) {
      throw new Error(`Section ${sectionCode} not found in template`)
    }

    const prompt = generateSectionPrompt(
      this.template,
      sectionCode,
      this.userInputs,
      sectionConfig.title,
      sectionConfig.minChars
    )

    return generateText(prompt, { 
      model: 'MAIN',
      temperature: 0.7,
      maxTokens: Math.max(2000, Math.ceil(sectionConfig.maxChars / 2))
    })
  }

  // 일관성 검증
  private async checkConsistency(sections: PlanSection[]): Promise<AIResponse> {
    const prompt = generateConsistencyCheckPrompt(
      sections.map(s => ({ code: s.code, content: s.content }))
    )

    return generateText(prompt, { model: 'MAIN', temperature: 0.3 })
  }

  // 품질 평가
  private async assessQuality(sections: PlanSection[]): Promise<AIResponse> {
    const fullContent = sections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n')
    const prompt = generateQualityAssessmentPrompt(this.template, fullContent)

    return generateText(prompt, { model: 'MAIN', temperature: 0.3 })
  }

  // 유틸리티 메서드들
  private getSectionTitle(sectionCode: string): string {
    const templateConfig = getTemplate(this.template)
    const section = templateConfig.sections.find(s => s.code === sectionCode)
    return section?.title || sectionCode
  }

  private updateSectionStatus(sectionCode: string, status: 'pending' | 'generating' | 'completed' | 'error') {
    const current = generationJobs.get(this.jobId)
    if (current) {
      const sections = current.sections.map(s => 
        s.code === sectionCode ? { ...s, status } : s
      )
      this.updateProgress({ sections })
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private savePlan(businessPlan: BusinessPlan) {
    // TODO: 실제 데이터베이스에 저장
    console.log('Saving business plan:', businessPlan.id)
  }
}

// 정적 메서드들
export async function startBusinessPlanGeneration(
  template: TemplateType,
  userInputs: UserInputs,
  userId: string
): Promise<string> {
  const orchestrator = new BusinessPlanOrchestrator(template, userInputs, userId)
  return orchestrator.startGeneration()
}

export function getGenerationProgress(jobId: string): GenerationProgress | null {
  return BusinessPlanOrchestrator.getProgress(jobId)
}