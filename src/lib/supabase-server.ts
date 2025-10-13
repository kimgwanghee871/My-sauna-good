import { cookies } from 'next/headers'
import { 
  createServerComponentClient, 
  createRouteHandlerClient 
} from '@supabase/auth-helpers-nextjs'

export const supabaseServer = () =>
  createServerComponentClient({ cookies })

export const supabaseRoute = (c: ReturnType<typeof cookies>) =>
  createRouteHandlerClient({ cookies: () => c })