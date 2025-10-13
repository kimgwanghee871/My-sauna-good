import jwt from 'jsonwebtoken'

const KEY = process.env.JWT_SIGNING_KEY || process.env.JWT_SECRET!
const ISS = process.env.JWT_ISS || 'gwon.ai'
const AUD = process.env.JWT_AUD || 'internal'

export interface InternalJWTPayload {
  sub: string
  scopes: string[]
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

export const signInternal = (
  sub: string, 
  scopes: string[], 
  ttlSec: number = 600
): string => {
  return jwt.sign(
    { sub, scopes }, 
    KEY, 
    {
      issuer: ISS,
      audience: AUD,
      expiresIn: ttlSec
    }
  )
}

export const verifyInternal = (token: string): InternalJWTPayload => {
  return jwt.verify(token, KEY, {
    issuer: ISS,
    audience: AUD
  }) as InternalJWTPayload
}

// 스코프 검증 헬퍼
export const hasScope = (payload: InternalJWTPayload, requiredScope: string): boolean => {
  return payload.scopes?.includes(requiredScope) || false
}

// 내부 API 인증 미들웨어용
export const verifyInternalAuth = (authHeader: string | null): InternalJWTPayload | null => {
  if (!authHeader?.startsWith('Bearer ')) return null
  
  try {
    const token = authHeader.substring(7)
    return verifyInternal(token)
  } catch (error) {
    console.error('Internal JWT verification failed:', error)
    return null
  }
}