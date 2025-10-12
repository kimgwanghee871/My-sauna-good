// 사용자 인증 관련 타입 정의
export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
  
  // 구독 정보
  subscription?: Subscription
  
  // 크레딧 정보
  credits: number
}

export interface Subscription {
  id: string
  userId: string
  tier: 'free' | 'pro' | 'business' | 'enterprise'
  status: 'active' | 'canceled' | 'expired'
  quotaMonthly: number
  usedMonthly: number
  renewAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
  accessToken: string
  refreshToken?: string
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

// JWT 페이로드
export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}