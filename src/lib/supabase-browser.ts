import { createClient } from '@supabase/supabase-js'

// 싱글톤 패턴으로 클라이언트 중복 생성 방지
let supabaseClient: ReturnType<typeof createClient> | null = null

export const supabaseBrowser = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    )
  }
  return supabaseClient
}