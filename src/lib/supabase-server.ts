import { cookies } from 'next/headers'
import { 
  createServerComponentClient, 
  createRouteHandlerClient 
} from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabaseServer = () =>
  createServerComponentClient({ cookies })

export const supabaseRoute = (c: ReturnType<typeof cookies>) =>
  createRouteHandlerClient({ cookies: () => c })

// Admin client for server-side operations that bypass RLS
export const admin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials for admin client')
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}