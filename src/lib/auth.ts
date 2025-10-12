import jwt from 'jsonwebtoken'
import type { SignOptions, Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload, User } from '@/types/auth'

// 환경변수 타입 확정
const JWT_SECRET: Secret = process.env.JWT_SECRET!
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = 
  (process.env.JWT_EXPIRES_IN as any) ?? '7d'

// JWT 토큰 생성
export function generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is missing')
  
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  
  const opts: SignOptions = { expiresIn: JWT_EXPIRES_IN }
  return jwt.sign(payload, JWT_SECRET, opts)
}

// JWT 토큰 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is missing')
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// 비밀번호 해시화
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// 비밀번호 검증
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 사용자 역할 검증
export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false
  
  const roleHierarchy = ['user', 'admin']
  const userRoleIndex = roleHierarchy.indexOf(user.role)
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole)
  
  return userRoleIndex >= requiredRoleIndex
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 비밀번호 강도 검사
export function isValidPassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다')
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('비밀번호에는 영문자가 포함되어야 합니다')
  }
  
  if (!/\d/.test(password)) {
    errors.push('비밀번호에는 숫자가 포함되어야 합니다')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// NextAuth.js 세션에서 사용자 정보 추출
export function getUserFromSession(session: any): User | null {
  if (!session?.user) return null
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    credits: session.user.credits || 0,
  }
}