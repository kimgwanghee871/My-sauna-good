// Test endpoint to verify NextAuth configuration
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: session || null,
      env_check: {
        nextauth_url: process.env.NEXTAUTH_URL ? '✅ SET' : '❌ MISSING',
        nextauth_secret: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING', 
        google_client_id: process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ MISSING',
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ MISSING',
        nextauth_debug: process.env.NEXTAUTH_DEBUG ? '✅ ENABLED' : '❌ DISABLED'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}