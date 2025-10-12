import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 서버사이드에서는 JWT를 무효화할 방법이 없으므로
    // 클라이언트에서 토큰을 삭제하도록 응답만 보냄
    // 실제 운영에서는 Redis 등을 사용해 블랙리스트 관리 가능

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다',
    })

  } catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}