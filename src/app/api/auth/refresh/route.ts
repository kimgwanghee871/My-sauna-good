import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateToken } from '@/lib/auth'
import { getUserById } from '@/lib/db/users'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '인증 토큰이 없습니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // "Bearer " 제거
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 사용자 존재 확인
    const user = getUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 새 토큰 발급
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      message: '토큰이 갱신되었습니다',
      token: newToken,
    })

  } catch (error) {
    console.error('Token refresh error:', error)

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}