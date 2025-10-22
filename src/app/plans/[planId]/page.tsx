// src/app/plans/[planId]/page.tsx
export default async function PlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  return (
    <pre style={{ padding: 16 }}>
      PLAN ROUTE OK
      {"\n"}planId = {planId}
    </pre>
  )
}