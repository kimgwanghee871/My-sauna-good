import { NextResponse } from 'next/server'

export async function GET(
  _req: Request, 
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  if (!jobId) return NextResponse.json({ error: 'missing jobId' }, { status: 400 })
  return NextResponse.json({ ok: true, jobId, status: 'running' })
}