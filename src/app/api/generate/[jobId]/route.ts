import { NextResponse } from 'next/server'

export async function GET(_req: Request, ctx: any) {
  const p = ctx?.params?.jobId
  const jobId = Array.isArray(p) ? p[0] : p
  if (!jobId) return NextResponse.json({ error: 'missing jobId' }, { status: 400 })
  return NextResponse.json({ ok: true, jobId, status: 'running' })
}