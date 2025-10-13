import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      })
      
      await supabase.auth.exchangeCodeForSession(code)
    }

    // 로그인 성공 후 대시보드로 리다이렉트
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error('Auth callback error:', error)
    // 오류 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=auth_callback_error`)
  }
}