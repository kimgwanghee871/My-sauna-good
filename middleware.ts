import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/plans/')) return NextResponse.next() // Plan Viewer 우회
  // ...기존 로직
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth|login|register).*)'],
}