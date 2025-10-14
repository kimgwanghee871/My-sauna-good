import { useMemo } from 'react'
import type { QnaInput } from '@/lib/schemas/qset.schema'
import { getEncourageMessage } from '@/lib/i18n'

export function useProgress(data: Partial<QnaInput>) {
  const fields: (keyof QnaInput)[] = [
    'companyName', 'problem', 'solution', 'targetCustomer', 'competition',
    'bizModel', 'fundingNeed', 'financeSnapshot', 'roadmap', 'team'
  ]
  
  return useMemo(() => {
    const filled = fields.filter(field => {
      const value = data[field]
      return typeof value === 'string' && value.trim().length >= 2 // 최소 2자 가드
    }).length
    
    const ratio = Math.round((filled / fields.length) * 100)
    const encourageMessage = getEncourageMessage(filled)
    
    return {
      filled,
      total: fields.length,
      ratio,
      encourageMessage
    }
  }, [data, fields])
}