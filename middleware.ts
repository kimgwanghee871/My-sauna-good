// middleware.ts - DISABLED VERSION
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 🚨 NUCLEAR OPTION: DISABLE ALL MIDDLEWARE
  console.log('🚨 [Middleware] DISABLED - Allowing all requests:', request.nextUrl.pathname)
  
  // Always allow all requests to pass through
  return NextResponse.next()
}

// Only apply to /plans/* for surgical precision
export const config = {
  matcher: '/plans/:path*'
}