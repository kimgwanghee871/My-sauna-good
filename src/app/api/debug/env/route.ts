// src/app/api/debug/env/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  return NextResponse.json({
    vercel_env: process.env.VERCEL_ENV,
    node_env: process.env.NODE_ENV,
    runtime: 'nodejs',
    url_len: url.length,
    anon_len: anon.length,
    service_len: service.length,
    timestamp: new Date().toISOString()
  })
}