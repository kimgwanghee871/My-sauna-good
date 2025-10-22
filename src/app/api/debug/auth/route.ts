// Debug endpoint to check OAuth configuration
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  try {
    // Test Google provider configuration
    const googleProvider = authOptions.providers?.find(p => (p as any).id === 'google')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      nextauth_config: {
        providers_count: authOptions.providers?.length || 0,
        google_provider: googleProvider ? {
          id: (googleProvider as any).id,
          name: (googleProvider as any).name,
          type: (googleProvider as any).type,
          clientId_set: !!(googleProvider as any).options?.clientId,
          clientSecret_set: !!(googleProvider as any).options?.clientSecret
        } : '❌ MISSING',
        session_strategy: authOptions.session?.strategy,
        pages: authOptions.pages,
        debug: authOptions.debug,
        secret_set: !!authOptions.secret
      },
      environment: {
        nextauth_url: process.env.NEXTAUTH_URL || '❌ MISSING',
        nextauth_secret_length: process.env.NEXTAUTH_SECRET?.length || 0,
        google_client_id_length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        google_client_secret_length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        nextauth_debug: process.env.NEXTAUTH_DEBUG || 'false',
        node_env: process.env.NODE_ENV
      },
      expected_urls: {
        signin: `${process.env.NEXTAUTH_URL}/api/auth/signin/google`,
        callback: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        signout: `${process.env.NEXTAUTH_URL}/api/auth/signout`,
        providers: `${process.env.NEXTAUTH_URL}/api/auth/providers`
      },
      google_cloud_required: {
        authorized_origins: [process.env.NEXTAUTH_URL],
        authorized_redirect_uris: [`${process.env.NEXTAUTH_URL}/api/auth/callback/google`]
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