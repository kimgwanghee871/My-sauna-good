// API 라우트 헬퍼 함수들

/**
 * AI 생성 시작 요청
 */
export async function startGeneration(data: {
  templateKey: string
  answers: any
  attachments?: any[]
  extraNotes?: string
}) {
  const response = await fetch('/api/generate/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('생성 요청에 실패했습니다')
  }
  
  return await response.json()
}

/**
 * 생성 진행률 조회
 */
export async function getGenerationProgress() {
  const response = await fetch('/api/generate/start')
  
  if (!response.ok) {
    throw new Error('진행률 조회에 실패했습니다')
  }
  
  return await response.json()
}