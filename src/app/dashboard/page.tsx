import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  대시보드
                </h1>
                <p className="text-sm text-gray-600">
                  안녕하세요, {user.email}님!
                </p>
              </div>
              <div className="flex space-x-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 사업계획서 목록 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                내 사업계획서
              </h2>
              <div className="text-center py-8">
                <p className="text-gray-500">아직 생성된 사업계획서가 없습니다.</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  새 사업계획서 생성
                </button>
              </div>
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                계정 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">가입일</label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">플랜</label>
                  <p className="text-sm text-gray-900">Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 로그아웃 버튼 컴포넌트
function LogoutButton() {
  return (
    <form action="/auth/logout" method="post">
      <button
        type="submit"
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
      >
        로그아웃
      </button>
    </form>
  )
}