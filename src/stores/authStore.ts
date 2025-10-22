'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthSession } from '@/types/auth'

interface AuthState {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setSession: (session: AuthSession | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setSession: (session) => set({ 
        session, 
        user: session?.user ? {
          id: session.user.email, // Use email as user identifier
          email: session.user.email,
          name: session.user.name,
          role: session.user.role as 'user' | 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          credits: 0, // 실제로는 API에서 가져와야 함
        } : null,
        isAuthenticated: !!session 
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email, password) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            const session: AuthSession = {
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
              },
              accessToken: data.token,
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
            }
            
            get().setSession(session)
            return true
          }
          
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            // 회원가입 후 자동 로그인
            return await get().login(email, password)
          }
          
          return false
        } catch (error) {
          console.error('Register error:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        })
        
        // 서버에 로그아웃 요청
        fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
      },

      refreshToken: async () => {
        const { session } = get()
        if (!session?.accessToken) return false

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            get().setSession({
              ...session,
              accessToken: data.token,
            })
            return true
          }
          
          // 토큰 갱신 실패시 로그아웃
          get().logout()
          return false
        } catch (error) {
          console.error('Token refresh error:', error)
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        session: state.session,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)