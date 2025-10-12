'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

// 임시 데모 데이터
const demoPlans = [
  {
    id: 'plan-1',
    title: 'AI 사업계획서 생성 서비스',
    template: 'investment',
    templateName: '투자유치용',
    status: 'completed',
    createdAt: '2024-01-15',
    progress: 100,
  },
  {
    id: 'plan-2', 
    title: 'IoT 기반 스마트팜 솔루션',
    template: 'government',
    templateName: '정부지원용',
    status: 'completed',
    createdAt: '2024-01-12',
    progress: 100,
  },
  {
    id: 'plan-3',
    title: '친환경 포장재 제조업',
    template: 'loan',
    templateName: '대출용',
    status: 'generating',
    createdAt: '2024-01-16',
    progress: 65,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [plans, setPlans] = useState(demoPlans)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const getStatusBadge = (status: string, progress: number) => {
    if (status === 'completed') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">완료</span>
    } else if (status === 'generating') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">생성중 {progress}%</span>
    } else if (status === 'error') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">실패</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">대기중</span>
  }

  const getTemplateColor = (template: string) => {
    const colors = {
      government: 'bg-blue-500',
      investment: 'bg-green-500',  
      loan: 'bg-purple-500',
    }
    return colors[template as keyof typeof colors] || 'bg-gray-500'
  }

  const getTemplateIcon = (template: string) => {
    const icons = {
      government: '🏛️',
      investment: '💰',
      loan: '🏦',
    }
    return icons[template as keyof typeof icons] || '📄'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  안녕하세요, {user?.name}님! 👋
                </h1>
                <p className="text-gray-600">
                  AI 사업계획서 대시보드에서 생성한 계획서를 관리하세요.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button
                  onClick={() => router.push('/generate')}
                  size="lg"
                >
                  + 새 사업계획서 생성
                </Button>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  📊
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">총 생성 건수</p>
                  <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  ✅
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">완료된 계획서</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plans.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  💎
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">보유 크레딧</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  📈
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">이번 달 생성</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </div>
          </div>

          {/* 사업계획서 목록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">내 사업계획서</h2>
            </div>
            
            <div className="overflow-hidden">
              {plans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 생성한 사업계획서가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 AI 사업계획서를 생성해보세요!
                  </p>
                  <Button onClick={() => router.push('/generate')}>
                    지금 시작하기
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${getTemplateColor(plan.template)} rounded-lg flex items-center justify-center text-2xl`}>
                            {getTemplateIcon(plan.template)}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {plan.title}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-500">{plan.templateName}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{plan.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(plan.status, plan.progress)}
                          
                          <div className="flex space-x-2">
                            {plan.status === 'completed' && (
                              <>
                                <Button variant="outline" size="sm">
                                  미리보기
                                </Button>
                                <Button variant="outline" size="sm">
                                  📥 다운로드
                                </Button>
                              </>
                            )}
                            {plan.status === 'generating' && (
                              <Button variant="outline" size="sm" disabled>
                                생성중...
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              ⋮
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {plan.status === 'generating' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>진행률</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">새로운 템플릿이 추가되었어요!</h3>
              <p className="text-blue-100 mb-4">
                더욱 정교해진 AI 엔진으로 한층 업그레이드된 사업계획서를 만나보세요.
              </p>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                자세히 보기
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">도움이 필요하신가요?</h3>
              <p className="text-gray-600 mb-4">
                사업계획서 작성 가이드와 성공 사례를 확인해보세요.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  가이드 보기
                </Button>
                <Button variant="outline" size="sm">
                  문의하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}