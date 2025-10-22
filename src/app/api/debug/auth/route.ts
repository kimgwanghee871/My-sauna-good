// Debug endpoint to check OAuth configuration
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      nextauth_config: {
        providers: authOptions.providers?.map(p => ({
          id: (p as any).id || 'google',
          name: (p as any).name || 'Google',
          type: (p as any).type || 'oauth'
        })),
        session_strategy: authOptions.session?.strategy,
        pages: authOptions.pages,
        debug: authOptions.debug
      },
      environment: {
        nextauth_url: process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING',
        nextauth_secret: process.env.NEXTAUTH_SECRET ? `✅ SET (${process.env.NEXTAUTH_SECRET?.substring(0, 8)}...)` : '❌ MISSING',
        google_client_id: process.env.GOOGLE_CLIENT_ID ? `✅ SET (${process.env.GOOGLE_CLIENT_ID?.substring(0, 12)}...)` : '❌ MISSING',
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? `✅ SET (${process.env.GOOGLE_CLIENT_SECRET?.substring(0, 8)}...)` : '❌ MISSING',
        nextauth_debug: process.env.NEXTAUTH_DEBUG || '❌ NOT SET',
        node_env: process.env.NODE_ENV
      },
      urls: {
        signin: `${process.env.NEXTAUTH_URL}/api/auth/signin/google`,
        callback: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        signout: `${process.env.NEXTAUTH_URL}/api/auth/signout`
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}