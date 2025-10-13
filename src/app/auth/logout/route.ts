import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    await supabase.auth.signOut()
    
    return NextResponse.redirect(`${new URL(request.url).origin}/login`)
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/`)
  }
}