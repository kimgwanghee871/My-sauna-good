// src/lib/pdf/extractor.ts
import OpenAI from 'openai'

export type AttachmentFile = {
  name: string
  url: string
  mime: string
  size?: number
}

export type PdfSummary = {
  name: string
  summary: string
}

export type DocumentContext = {
  attachmentsSummary: string   // 첨부 요약
  extraNotes?: string
}

/**
 * PDF/DOCX를 요약하는 함수 (스텁)
 * - 2단계에서 실제 PDF 텍스트 추출/요약 로직으로 교체 가능
 */
export async function extractPdfSummary(att: AttachmentFile): Promise<PdfSummary> {
  // 간단 스텁: 파일명과 MIME만 노출 (필요 시 OpenAI 4o-mini로 실제 요약)
  return {
    name: att.name,
    summary: `첨부파일: ${att.name} (${att.mime}). 내용 요약은 2단계에서 실제 PDF 파싱으로 대체 예정.`
  }
}

/** 첨부 요약/메모를 문맥 컨텍스트로 구성 */
export async function createDocumentContext(
  attachments?: AttachmentFile[],
  extraNotes?: string
): Promise<DocumentContext> {
  let lines: string[] = []
  if (attachments && attachments.length > 0) {
    const summaries = await Promise.all(attachments.map(extractPdfSummary))
    lines = summaries.map(s => `- ${s.name}: ${s.summary}`)
  } else {
    lines = ['첨부자료 없음']
  }
  return {
    attachmentsSummary: lines.join('\n'),
    extraNotes: extraNotes?.trim() || undefined
  }
}

/** 프롬프트 삽입용 문자열 포맷터 */
export function formatDocumentContextForPrompt(ctx: DocumentContext): string {
  const parts = [
    `[첨부자료 요약]`,
    ctx.attachmentsSummary
  ]
  if (ctx.extraNotes) {
    parts.push(`[추가 설명]`)
    parts.push(ctx.extraNotes)
  }
  return parts.join('\n')
}