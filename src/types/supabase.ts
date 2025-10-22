// Basic Supabase Database types for TypeScript inference
export interface Database {
  public: {
    Tables: {
      business_plans: {
        Row: {
          id: string
          user_id: string
          status: string
          template_key: string
          quality_score?: number
          title?: string
          form_data?: any
          user_inputs?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          template_key: string
          quality_score?: number
          title?: string
          form_data?: any
          user_inputs?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          template_key?: string
          quality_score?: number
          title?: string
          form_data?: any
          user_inputs?: any
          created_at?: string
          updated_at?: string
        }
      }
      business_plan_sections: {
        Row: {
          id: number
          plan_id: string
          section_index: number
          heading: string
          content: string | null
          status: 'pending' | 'generating' | 'completed' | 'error'
          updated_at: string
        }
        Insert: {
          id?: number
          plan_id: string
          section_index: number
          heading: string
          content?: string | null
          status?: 'pending' | 'generating' | 'completed' | 'error'
          updated_at?: string
        }
        Update: {
          id?: number
          plan_id?: string
          section_index?: number
          heading?: string
          content?: string | null
          status?: 'pending' | 'generating' | 'completed' | 'error'
          updated_at?: string
        }
      }
      market_specs: {
        Row: {
          plan_id: string
          json_spec: {
            charts?: Array<{
              id: string
              type: string
              title: string
              data: any[]
              config?: Record<string, any>
              meta?: any
            }>
          } | null
        }
        Insert: {
          plan_id: string
          json_spec?: {
            charts?: Array<{
              id: string
              type: string
              title: string
              data: any[]
              config?: Record<string, any>
              meta?: any
            }>
          } | null
        }
        Update: {
          plan_id?: string
          json_spec?: {
            charts?: Array<{
              id: string
              type: string
              title: string
              data: any[]
              config?: Record<string, any>
              meta?: any
            }>
          } | null
        }
      }
    }
  }
}