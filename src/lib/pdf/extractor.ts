// src/lib/pdf/extractor.ts
export type AttachmentFile = {
  name: string
  url: string
  mime: string
  size?: number
}

export type DocumentContext = {
  attachmentsSummary: string  // 첨부 요약 텍스트(없으면 '첨부자료 없음')
  extraNotes?: string
}

/**
 * 첨부파일 요약을 받아 문맥 컨텍스트를 구성함.
 * 첨부가 없으면 '첨부자료 없음'을 기본으로 반환함.
 */
export async function createDocumentContext(
  attachments?: AttachmentFile[],
  extraNotes?: string
): Promise<DocumentContext> {
  // 2단계에서 PDF 요약 로직 붙일 예정 (지금은 안전한 스텁)
  const attachmentsSummary = attachments && attachments.length > 0
    ? attachments.map(a => `- ${a.name} (${a.mime})`).join('\n')
    : '첨부자료 없음'
  return { attachmentsSummary, extraNotes }
}

/**
 * 프롬프트에 삽입할 문자열 생성
 */
export function formatDocumentContextForPrompt(ctx: DocumentContext): string {
  const lines = [
    `[첨부자료 요약]`,
    ctx.attachmentsSummary,
  ]
  if (ctx.extraNotes && ctx.extraNotes.trim()) {
    lines.push(`[추가 설명]`)
    lines.push(ctx.extraNotes.trim())
  }
  return lines.join('\n')
}