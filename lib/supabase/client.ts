import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Check if Supabase environment variables are available
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

let client: ReturnType<typeof createBrowserClient> | null = null

const mockClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase no configurado" } }),
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase no configurado" } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  }),
}

export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase no está configurado. Usando cliente mock.")
    return mockClient as any
  }

  if (!client) {
    client = createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  }
  return client
}

export const supabase = createClient()
