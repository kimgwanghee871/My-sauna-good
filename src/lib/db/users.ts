// 간단한 메모리 기반 사용자 데이터베이스 (실제 운영에서는 실제 DB 사용)
import { User } from '@/types/auth'
import { hashPassword } from '@/lib/auth'

// 메모리 저장소 (실제로는 PostgreSQL, MongoDB 등 사용)
const users: Map<string, User & { hashedPassword: string }> = new Map()

// 기본 사용자 생성 (데모용)
async function initDefaultUsers() {
  if (users.size === 0) {
    const demoUser = {
      id: 'demo-user-1',
      email: 'demo@gwon-ai.com',
      name: '데모 사용자',
      role: 'user' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      credits: 5, // 데모 계정은 5크레딧 제공
      hashedPassword: await hashPassword('demo123!'),
    }
    
    const adminUser = {
      id: 'admin-user-1', 
      email: 'admin@gwon-ai.com',
      name: '관리자',
      role: 'admin' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      credits: 999,
      hashedPassword: await hashPassword('admin123!'),
    }

    users.set(demoUser.email, demoUser)
    users.set(adminUser.email, adminUser)
  }
}

// 초기화 실행
initDefaultUsers()

export interface CreateUserData {
  email: string
  password: string
  name: string
}

// 사용자 생성
export async function createUser(data: CreateUserData): Promise<User> {
  const { email, password, name } = data

  if (users.has(email)) {
    throw new Error('이미 존재하는 이메일입니다')
  }

  const hashedPassword = await hashPassword(password)
  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    credits: 1, // 신규 사용자는 1회 무료 크레딧 제공
    hashedPassword,
  }

  users.set(email, user)

  // 비밀번호는 반환하지 않음
  const { hashedPassword: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// 사용자 조회 (이메일)
export function getUserByEmail(email: string): (User & { hashedPassword: string }) | null {
  return users.get(email) || null
}

// 사용자 조회 (ID)
export function getUserById(id: string): User | null {
  for (const user of users.values()) {
    if (user.id === id) {
      const { hashedPassword: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
  }
  return null
}

// 사용자 업데이트
export function updateUser(id: string, updates: Partial<User>): User | null {
  for (const [email, user] of users.entries()) {
    if (user.id === id) {
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date(),
      }
      users.set(email, updatedUser)
      
      const { hashedPassword: _, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    }
  }
  return null
}

// 크레딧 차감
export function deductCredits(userId: string, amount: number): boolean {
  const user = getUserById(userId)
  if (!user || user.credits < amount) {
    return false
  }

  const updatedUser = updateUser(userId, { credits: user.credits - amount })
  return !!updatedUser
}

// 크레딧 추가
export function addCredits(userId: string, amount: number): boolean {
  const user = getUserById(userId)
  if (!user) {
    return false
  }

  const updatedUser = updateUser(userId, { credits: user.credits + amount })
  return !!updatedUser
}

// 모든 사용자 조회 (관리자용)
export function getAllUsers(): User[] {
  return Array.from(users.values()).map(user => {
    const { hashedPassword: _, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

// 사용자 삭제
export function deleteUser(id: string): boolean {
  for (const [email, user] of users.entries()) {
    if (user.id === id) {
      users.delete(email)
      return true
    }
  }
  return false
}

// 사용자 수 조회
export function getUserCount(): number {
  return users.size
}