// src/app/plans/[planId]/page.tsx
import { admin } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

export default async function PlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  
  // 🔍 SERVER LOGGING: Route entry
  console.log('🔍 [PlanPage] Route accessed:', {
    planId,
    timestamp: new Date().toISOString(),
    userAgent: 'server-side'
  })
  
  try {
    // 🔍 SERVER LOGGING: Admin client check
    console.log('🔍 [PlanPage] Creating admin client...')
    const supabase = admin()
    console.log('✅ [PlanPage] Admin client created successfully')
    
    // 🔍 SERVER LOGGING: Database query attempt
    console.log('🔍 [PlanPage] Querying business_plans table...', { planId })
    const { data: plan, error } = await supabase
      .from('business_plans')
      .select('*')
      .eq('id', planId)
      .single()
    
    if (error) {
      console.error('❌ [PlanPage] Database query error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        planId
      })
      return notFound()
    }
    
    if (!plan) {
      console.warn('⚠️ [PlanPage] Plan not found in database:', { planId })
      return notFound()
    }
    
    console.log('✅ [PlanPage] Plan found successfully:', {
      planId,
      title: plan.title,
      status: plan.status,
      created_at: plan.created_at
    })
    
    // 🔍 SUCCESS: Return test UI
    return (
      <pre style={{ padding: 16, background: '#f0f0f0', margin: 16 }}>
        ✅ PLAN ROUTE SUCCESS
        {"\n"}planId = {planId}
        {"\n"}title = {plan.title}
        {"\n"}status = {plan.status}
        {"\n"}created_at = {plan.created_at}
      </pre>
    )
    
  } catch (error) {
    console.error('💥 [PlanPage] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      planId
    })
    return notFound()
  }
}