'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900">G-Won AI</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
              기능 소개
            </Link>
            <Link href="/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
              템플릿
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              요금제
            </Link>
            <Link href="/examples" className="text-gray-600 hover:text-gray-900 transition-colors">
              사례
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
              지원
            </Link>
          </nav>

          {/* CTA 버튼들 */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="primary" size="sm">
                무료 체험하기
              </Button>
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              <Link href="/features" className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                기능 소개
              </Link>
              <Link href="/templates" className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                템플릿
              </Link>
              <Link href="/pricing" className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                요금제
              </Link>
              <Link href="/examples" className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                사례
              </Link>
              <Link href="/support" className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                지원
              </Link>
              <div className="pt-2 flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" fullWidth>
                    로그인
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button variant="primary" size="sm" fullWidth>
                    무료 체험하기
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}