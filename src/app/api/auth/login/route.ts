import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/users'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '등록되지 않은 이메일입니다' },
        { status: 401 }
      )
    }

    // 비밀번호 확인
    const isValidPassword = await comparePassword(password, user.hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: '비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // 응답
    return NextResponse.json({
      success: true,
      message: '로그인되었습니다',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
      },
      token,
    })

  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}