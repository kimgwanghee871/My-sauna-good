import koMessages from './ko.json'
import type { TemplateKey } from '../schemas/template.schema'

export type MessageKey = keyof typeof koMessages
export type TemplateMessageKey = keyof typeof koMessages.template
export type QnaFieldKey = keyof typeof koMessages.qna.government

// i18n utility function
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: any = koMessages
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (typeof value !== 'string') {
    console.warn(`Missing translation for key: ${key}`)
    return key
  }
  
  // Simple parameter substitution
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match: string, param: string) => {
      return params[param]?.toString() ?? match
    })
  }
  
  return value
}

// Template-specific message getters
export function getTemplateMessages(templateKey: TemplateKey) {
  return {
    title: t(`template.${templateKey}.title`),
    subtitle: t(`template.${templateKey}.subtitle`),
    qna: koMessages.qna[templateKey]
  }
}

// Progress and encouragement helpers
export function getEncourageMessage(filledCount: number): string | null {
  if (filledCount === 3) return t('form.encourage.3')
  if (filledCount === 5) return t('form.encourage.5') 
  if (filledCount === 8) return t('form.encourage.8')
  return null
}

export function getStepInfo(stepIndex: number): string {
  const stepKey = (stepIndex + 1).toString() as '1' | '2' | '3'
  return t(`form.step_info.${stepKey}`)
}

export { koMessages }