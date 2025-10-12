import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db/users'
import { isValidEmail, isValidPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // 입력 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식이 아닙니다' },
        { status: 400 }
      )
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: passwordValidation.errors.join(', ') 
        },
        { status: 400 }
      )
    }

    // 사용자 생성
    const user = await createUser({ email, password, name })

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof Error && error.message === '이미 존재하는 이메일입니다') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}