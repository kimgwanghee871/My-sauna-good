import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { planId, interval } = await request.json()

    // 임시로 토스트 메시지만 표시하고 결제 페이지로 리디렉션 대신 성공 응답
    // 실제 구현에서는 Stripe, Portone 등의 결제 API와 연동
    
    // 결제 준비 중 시뮬레이션 (실제로는 결제 서비스 호출)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 임시 체크아웃 URL (실제로는 결제 서비스에서 받은 URL)
    const checkoutUrl = `/pricing?selected=${planId}&interval=${interval}&checkout=true`
    
    return NextResponse.json({ 
      success: true, 
      checkoutUrl,
      message: '결제 페이지로 이동합니다.' 
    })
    
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: '결제 페이지 연결에 실패했습니다.' },
      { status: 500 }
    )
  }
}