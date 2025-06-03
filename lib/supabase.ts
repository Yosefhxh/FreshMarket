import { createClient } from "@supabase/supabase-js"

// URL y claves de Supabase
const supabaseUrl = "https://cmpzenqukvfpsgmozjag.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcHplbnF1a3ZmcHNnbW96amFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDkyMTksImV4cCI6MjA2MjM4NTIxOX0.Y52TnjcT4LEiLMztyYlzawUPG2W2ikGJgoyRu2z7h4I"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcHplbnF1a3ZmcHNnbW96amFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwOTIxOSwiZXhwIjoyMDYyMzg1MjE5fQ.gl27WGtylNZH4tkuiCYW-vu0dm2hcre_TD716tRg85k"

// Crear un cliente de Supabase para el lado del cliente
export const createSupabaseClient = () => {
  try {
    console.log("Creating Supabase client...")
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Deshabilitar persistencia de sesión temporalmente
        autoRefreshToken: false, // Deshabilitar auto-refresh
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return null
  }
}

// Singleton para el cliente del lado del cliente
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

// Obtener el cliente de Supabase (singleton para el cliente)
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}

// Crear un cliente de Supabase para el lado del servidor
export const createServerSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    return null
  }
}
