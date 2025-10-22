// src/lib/pdf/index.ts
export {
  extractPdfSummary,
  createDocumentContext,
  formatDocumentContextForPrompt,
} from './extractor'

export type { PdfSummary, AttachmentFile, DocumentContext } from './extractor'