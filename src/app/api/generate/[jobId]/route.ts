import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getGenerationProgress } from '@/lib/generator/orchestrator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization')
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

    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: '작업 ID가 필요합니다' },
        { status: 400 }
      )
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