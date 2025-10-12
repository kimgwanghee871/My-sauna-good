'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
          
          {/* 추가 정보 */}
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              G-Won AI를 선택하는 이유
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">⚡</div>
                <p><strong>10분 완성</strong><br />AI가 빠르게 작성</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🎯</div>
                <p><strong>95% 통과율</strong><br />검증된 템플릿</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🔒</div>
                <p><strong>안전보장</strong><br />데이터 암호화</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}