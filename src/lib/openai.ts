import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

// 모델 설정
export const MODELS = {
  CHEAP: 'gpt-3.5-turbo',      // 빠르고 저렴한 모델 (프리필용)
  MAIN: 'gpt-4',               // 메인 생성 모델
  PREMIUM: 'gpt-4-turbo',      // 고품질 모델
} as const

// 토큰 제한 설정
export const TOKEN_LIMITS = {
  [MODELS.CHEAP]: 4096,
  [MODELS.MAIN]: 8192,
  [MODELS.PREMIUM]: 32768,
} as const

// 비용 계산 (토큰당 비용, USD)
export const TOKEN_COSTS = {
  [MODELS.CHEAP]: { input: 0.0005 / 1000, output: 0.0015 / 1000 },
  [MODELS.MAIN]: { input: 0.03 / 1000, output: 0.06 / 1000 },
  [MODELS.PREMIUM]: { input: 0.01 / 1000, output: 0.03 / 1000 },
} as const

export interface AIRequestOptions {
  model?: keyof typeof MODELS
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
  model: string
}

// 메인 AI 요청 함수
export async function generateText(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<AIResponse> {
  const {
    model = 'MAIN',
    temperature = 0.7,
    maxTokens = 2000,
    stream = false,
  } = options

  const modelName = MODELS[model]
  const maxModelTokens = TOKEN_LIMITS[modelName]
  const actualMaxTokens = Math.min(maxTokens, maxModelTokens - 500) // 프롬프트 여유분

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: actualMaxTokens,
      stream,
    })

    if (stream) {
      throw new Error('Streaming not implemented in this function')
    }

    // 타입 가드: Stream 타입이 아닌 ChatCompletion 타입임을 확인
    if ('choices' in response) {
      const completion = response.choices[0]
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      
      // 비용 계산
      const costs = TOKEN_COSTS[modelName]
      const cost = (usage.prompt_tokens * costs.input) + (usage.completion_tokens * costs.output)

      return {
        content: completion.message?.content || '',
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        cost,
        model: modelName,
      }
    } else {
      throw new Error('Invalid response type from OpenAI')
    }

  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error(`AI 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// JSON 모드 생성 함수
export async function generateJSON<T>(
  prompt: string,
  schema: any,
  options: AIRequestOptions = {}
): Promise<AIResponse & { data: T }> {
  const {
    model = 'MAIN',
    temperature = 0.3,
    maxTokens = 2000,
  } = options

  const modelName = MODELS[model]
  const jsonPrompt = `${prompt}

출력은 반드시 다음 JSON 스키마를 따라주세요:
${JSON.stringify(schema, null, 2)}

JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.`

  try {
    const response = await generateText(jsonPrompt, {
      model,
      temperature,
      maxTokens,
    })

    // JSON 파싱 시도
    let data: T
    try {
      data = JSON.parse(response.content)
    } catch (parseError) {
      // JSON 파싱 실패시 재시도
      console.warn('JSON parsing failed, retrying with stricter prompt')
      
      const retryResponse = await generateText(
        `${jsonPrompt}\n\n중요: 응답은 반드시 유효한 JSON 형식이어야 합니다. 주석이나 설명 없이 JSON만 출력하세요.`,
        { model, temperature: 0.1, maxTokens }
      )
      
      try {
        data = JSON.parse(retryResponse.content)
      } catch (secondParseError) {
        throw new Error('AI가 올바른 JSON 형식을 생성하지 못했습니다')
      }
      
      return { ...retryResponse, data }
    }

    return { ...response, data }

  } catch (error) {
    console.error('JSON Generation Error:', error)
    throw error
  }
}

// 배치 요청 처리 함수
export async function generateBatch(
  prompts: string[],
  options: AIRequestOptions = {}
): Promise<AIResponse[]> {
  const maxConcurrent = 3 // 동시 요청 제한
  const results: AIResponse[] = []
  
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    const batch = prompts.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(prompt => generateText(prompt, options))
    
    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    } catch (error) {
      console.error(`Batch ${Math.floor(i / maxConcurrent) + 1} failed:`, error)
      throw error
    }
    
    // 요청 간 딜레이 (API 제한 방지)
    if (i + maxConcurrent < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// 비용 추정 함수
export function estimateCost(
  promptLength: number,
  expectedOutputLength: number,
  model: keyof typeof MODELS = 'MAIN'
): number {
  const modelName = MODELS[model]
  const costs = TOKEN_COSTS[modelName]
  
  // 대략적인 토큰 수 계산 (영어 기준 4글자 = 1토큰, 한글은 더 많이 소모)
  const estimatedPromptTokens = Math.ceil(promptLength / 3) 
  const estimatedOutputTokens = Math.ceil(expectedOutputLength / 3)
  
  return (estimatedPromptTokens * costs.input) + (estimatedOutputTokens * costs.output)
}

// 사용량 로깅 함수
export function logUsage(response: AIResponse, userId: string, context: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    userId,
    context,
    model: response.model,
    usage: response.usage,
    cost: response.cost,
  }
  
  // 실제로는 데이터베이스나 로그 시스템에 저장
  console.log('AI Usage Log:', logData)
  
  // TODO: 실제 로깅 시스템 연동
  // await saveUsageLog(logData)
}