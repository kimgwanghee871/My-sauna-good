// src/app/api/generate/[jobId]/route.ts
import { NextResponse } from 'next/server'

// Next.js 15 Route Handler 정석 형식:
// - 첫 인자: Request (웹 표준)
// - 두 번째 인자: 인라인 타입의 { params: { ... } } 딱 1개만
// - default export 금지 (GET/POST 등 named export만)
export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const jobId = params?.jobId
  if (!jobId) {
    return NextResponse.json({ error: 'missing jobId' }, { status: 400 })
  }

  // TODO: 여기서 job 상태 조회 로직
  // const sb = admin()
  // const { data } = await sb.from('generation_jobs').select(...).eq('id', jobId).maybeSingle()

  return NextResponse.json({ ok: true, jobId, status: 'running' })
}