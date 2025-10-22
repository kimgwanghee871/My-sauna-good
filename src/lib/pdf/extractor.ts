// PDF 텍스트 추출 및 요약 시스템
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import OpenAI from 'openai'

// PDF.js worker 설정
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
}

export interface PdfSummary {
  fileName: string
  pageCount: number
  textLength: number
  summary: string
  keyPoints: string[]
  extractedText?: string
}

export interface DocumentContext {
  uploadsSummary: string
  attachments: Array<{
    name: string
    url: string
    summary: PdfSummary
  }>
}

/**
 * PDF 파일에서 텍스트를 추출합니다
 */
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages
    let fullText = ''

    // 모든 페이지에서 텍스트 추출
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // 텍스트 아이템들을 결합
        const pageText = textContent.items
          .filter((item: any) => item.str)
          .map((item: any) => item.str)
          .join(' ')
        
        fullText += pageText + '\n\n'
      } catch (pageError) {
        console.warn(`Page ${pageNum} extraction failed:`, pageError)
        // 페이지 추출 실패시 계속 진행
      }
    }

    return fullText.trim()
  } catch (error) {
    console.error('PDF text extraction failed:', error)
    throw new Error('PDF 텍스트 추출에 실패했습니다')
  }
}

/**
 * 추출된 텍스트를 AI로 요약합니다
 */
async function summarizeText(
  text: string, 
  fileName: string, 
  openaiClient: OpenAI
): Promise<{ summary: string; keyPoints: string[] }> {
  try {
    // 텍스트가 너무 길면 앞부분만 사용 (OpenAI 토큰 제한)
    const truncatedText = text.slice(0, 8000)
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `첨부된 문서의 주요 내용을 사업계획서 생성에 유용하도록 요약하세요.

응답 형식:
{
  "summary": "문서 전체 요약 (500자 이내)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3", "핵심 포인트 4", "핵심 포인트 5"]
}

요약 시 다음 정보에 집중하세요:
- 기업/제품 정보
- 재무 현황 및 계획
- 시장 분석 및 경쟁사 정보
- 기술적 특징 및 차별점
- 사업 전략 및 로드맵`
        },
        {
          role: 'user',
          content: `파일명: ${fileName}\n\n내용:\n${truncatedText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 응답이 비어있습니다')
    }

    try {
      const parsed = JSON.parse(content)
      return {
        summary: parsed.summary || '요약 생성에 실패했습니다',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : []
      }
    } catch (parseError) {
      console.warn('AI 응답 파싱 실패, fallback 사용:', parseError)
      // JSON 파싱 실패시 텍스트를 직접 요약으로 사용
      return {
        summary: content.slice(0, 500),
        keyPoints: []
      }
    }

  } catch (error) {
    console.error('Text summarization failed:', error)
    throw new Error('문서 요약에 실패했습니다')
  }
}

/**
 * PDF 파일 URL에서 요약을 추출합니다
 */
export async function extractPdfSummary(fileUrl: string, fileName: string): Promise<PdfSummary> {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다')
  }

  try {
    // PDF 파일 다운로드
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    
    // 텍스트 추출
    const extractedText = await extractTextFromPdf(arrayBuffer)
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('유효한 텍스트를 추출할 수 없습니다')
    }

    // AI 요약
    const { summary, keyPoints } = await summarizeText(extractedText, fileName, openaiClient)

    return {
      fileName,
      pageCount: 0, // PDF.js에서 페이지 수를 별도로 가져올 수 있지만 간소화
      textLength: extractedText.length,
      summary,
      keyPoints,
      extractedText: extractedText.slice(0, 2000) // 디버깅용으로 일부만 저장
    }

  } catch (error) {
    console.error(`PDF summary extraction failed for ${fileName}:`, error)
    
    // 에러 시 기본 요약 반환
    return {
      fileName,
      pageCount: 0,
      textLength: 0,
      summary: `${fileName} - 자동 요약에 실패했습니다. 수동으로 파일을 확인해주세요.`,
      keyPoints: ['파일 처리 중 오류 발생'],
      extractedText: ''
    }
  }
}

/**
 * 여러 첨부파일을 처리하여 통합된 문서 컨텍스트를 생성합니다
 */
export async function createDocumentContext(
  attachments: Array<{ name: string; url: string; mime: string }>
): Promise<DocumentContext> {
  if (!attachments || attachments.length === 0) {
    return {
      uploadsSummary: '첨부자료 없음',
      attachments: []
    }
  }

  const processedAttachments = await Promise.all(
    attachments
      .filter(att => att.mime === 'application/pdf') // PDF만 처리
      .map(async (att) => {
        try {
          const summary = await extractPdfSummary(att.url, att.name)
          return {
            name: att.name,
            url: att.url,
            summary
          }
        } catch (error) {
          console.error(`Failed to process ${att.name}:`, error)
          // 처리 실패한 파일도 기본 정보로 포함
          return {
            name: att.name,
            url: att.url,
            summary: {
              fileName: att.name,
              pageCount: 0,
              textLength: 0,
              summary: `${att.name} - 처리 중 오류가 발생했습니다`,
              keyPoints: [],
              extractedText: ''
            }
          }
        }
      })
  )

  // 통합 요약 생성
  const uploadsSummary = processedAttachments.length > 0 
    ? processedAttachments.map(att => 
        `${att.summary.fileName}: ${att.summary.summary}`
      ).join('\n\n')
    : '첨부자료 없음'

  return {
    uploadsSummary,
    attachments: processedAttachments
  }
}

/**
 * 문서 컨텍스트를 AI 프롬프트에 포함할 수 있는 형태로 포맷팅합니다
 */
export function formatDocumentContextForPrompt(context: DocumentContext): string {
  if (context.attachments.length === 0) {
    return '첨부자료: 없음'
  }

  const formattedAttachments = context.attachments.map(att => {
    const keyPointsText = att.summary.keyPoints.length > 0 
      ? `\n주요 포인트: ${att.summary.keyPoints.join(', ')}`
      : ''
    
    return `📄 ${att.summary.fileName}
${att.summary.summary}${keyPointsText}`
  }).join('\n\n')

  return `첨부자료 요약:
${formattedAttachments}`
}