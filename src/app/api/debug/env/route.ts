// src/app/api/debug/env/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY_V2 || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  return NextResponse.json({
    vercel_env: process.env.VERCEL_ENV,
    node_env: process.env.NODE_ENV,
    runtime: 'nodejs',
    timestamp: new Date().toISOString(),
    url_len: url.length,
    anon_len: anon.length,
    service_len: service.length,
    service_key_used: process.env.SUPABASE_SERVICE_ROLE_KEY_V2 ? 'V2' : (process.env.SUPABASE_SERVICE_ROLE_KEY ? 'V1' : 'none'),
    // 디버깅용: 처음/끝 3글자만 표시
    service_preview: service.length > 6 ? `${service.slice(0,3)}...${service.slice(-3)}` : 'empty'
  })
}