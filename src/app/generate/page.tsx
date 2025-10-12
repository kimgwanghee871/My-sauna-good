'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TemplateSelector } from '@/components/generate/TemplateSelector'
import { QuestionWizard } from '@/components/generate/QuestionWizard'
import { TemplateType, UserInputs } from '@/types/template'
import { useAuthStore } from '@/stores/authStore'

export default function GeneratePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  
  const [step, setStep] = useState<'template' | 'questions' | 'generating'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [userInputs, setUserInputs] = useState<UserInputs | null>(null)

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template)
  }

  const handleTemplateNext = () => {
    if (selectedTemplate) {
      setStep('questions')
    }
  }

  const handleQuestionsBack = () => {
    setStep('template')
  }

  const handleQuestionsSubmit = (inputs: UserInputs) => {
    setUserInputs(inputs)
    setStep('generating')
    
    // 실제로는 여기서 AI 생성 API를 호출
    // 현재는 대시보드로 리다이렉트
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
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
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* 사용자 정보 및 크레딧 표시 */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-600">안녕하세요, <span className="font-semibold">{user?.name}님</span>!</p>
                <p className="text-sm text-gray-500">AI가 도와드리는 전문 사업계획서 작성을 시작해볼까요?</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">보유 크레딧</p>
                <p className="text-2xl font-bold text-blue-600">{user?.credits || 0}회</p>
              </div>
            </div>
          </div>

          {/* 단계별 콘텐츠 */}
          {step === 'template' && (
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={handleTemplateSelect}
              onNext={handleTemplateNext}
            />
          )}

          {step === 'questions' && selectedTemplate && (
            <QuestionWizard
              template={selectedTemplate}
              onSubmit={handleQuestionsSubmit}
              onBack={handleQuestionsBack}
            />
          )}

          {step === 'generating' && (
            <GeneratingView userInputs={userInputs} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

// 생성 중 화면 컴포넌트
function GeneratingView({ userInputs }: { userInputs: UserInputs | null }) {
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState('입력 데이터 분석 중...')

  useEffect(() => {
    const tasks = [
      '입력 데이터 분석 중...',
      '시장 정보 수집 중...',
      '경쟁사 분석 중...',
      '재무 계획 수립 중...',
      '사업계획서 작성 중...',
      '검토 및 마무리 중...',
    ]

    let currentTaskIndex = 0
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15
        
        if (newProgress > (currentTaskIndex + 1) * 16.67 && currentTaskIndex < tasks.length - 1) {
          currentTaskIndex++
          setCurrentTask(tasks[currentTaskIndex])
        }
        
        return Math.min(newProgress, 95)
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-lg p-12">
        {/* 애니메이션 아이콘 */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🤖</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI가 사업계획서를 생성하고 있습니다
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          입력하신 정보를 바탕으로 전문적인 사업계획서를 작성 중입니다.<br />
          잠시만 기다려주세요!
        </p>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentTask}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 선택한 템플릿 정보 */}
        {userInputs && (
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-gray-700 mb-2">생성 중인 계획서</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">템플릿:</span> {userInputs.template === 'government' ? '정부지원용' : userInputs.template === 'investment' ? '투자유치용' : '대출용'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">제목:</span> {userInputs.title}
            </p>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500">
          예상 완성 시간: 3-5분 • 잠시만 기다려주세요
        </div>
      </div>
    </div>
  )
}