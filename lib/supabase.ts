import { createClient } from "@supabase/supabase-js"

// Use fallback values for development/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Check if we have real Supabase credentials
const hasValidCredentials =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"

let supabase: any

if (hasValidCredentials) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // Mock Supabase client for development/preview
  supabase = {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column: string, options?: any) => ({
          limit: (n: number) => Promise.resolve({
            data: [{
              type: "match_schedule",
              data: [],
              created_at: new Date().toISOString()
            }],
            error: null
          })
        }),
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => ({
            limit: (n: number) => Promise.resolve({
              data: [{
                type: "match_schedule",
                data: [],
                created_at: new Date().toISOString()
              }],
              error: null
            })
          })
        }),
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
      }),
      upsert: (data: any) => Promise.resolve({ data: null, error: null }),
    }),
  }
}

export { supabase, hasValidCredentials }
