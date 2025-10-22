import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getGenerationProgress } from '@/lib/generator/orchestrator'

// 반드시 'Request' + 인라인 타입의 ctx만 사용하세요.
// 별칭 타입/Record/Promise/overload/추가 인자는 모두 금지입니다.
export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // 인증 확인
    const authHeader = _req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    const jobId = params.jobId
    if (!jobId) {
      return NextResponse.json({ error: 'missing jobId' }, { status: 400 })
    }

    // 진행상황 조회
    const progress = getGenerationProgress(jobId)
    
    if (!progress) {
      return NextResponse.json(
        { success: false, message: '작업을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: progress,
    })

  } catch (error) {
    console.error('Progress API Error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}