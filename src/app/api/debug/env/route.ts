// src/app/api/debug/env/route.ts
import { NextResponse } from 'next/server'

// ⚡ CRITICAL: Force Node.js runtime (not Edge)
export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || null
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    node_env: process.env.NODE_ENV || 'unknown',
    runtime: 'nodejs', // Confirmed this is running on Node.js
    
    // Environment variable lengths (safe to expose)
    env_status: {
      url_exists: !!url,
      url_length: url ? url.length : 0,
      anon_exists: !!anon, 
      anon_length: anon ? anon.length : 0,
      service_exists: !!service,
      service_length: service ? service.length : 0
    },
    
    // URL domains for verification (safe parts only)
    url_domain: url ? new URL(url).hostname : null,
    
    // Debug info
    all_env_keys_count: Object.keys(process.env).length,
    supabase_keys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.includes('NEXT_PUBLIC')
    )
    
    // 🚨 NEVER EXPOSE ACTUAL VALUES IN PRODUCTION
    // Uncomment below ONLY for local debugging:
    // url, anon, service
  })
}