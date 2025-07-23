import { createClient } from '@supabase/supabase-js'

// Projeto Questera - Credenciais corretas
const SUPABASE_URL = 'https://gstpypfsndxmzydprcfr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdHB5cGZzbmR4bXp5ZHByY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzYyMDksImV4cCI6MjA2ODcxMjIwOX0.0YGBJJk5evG06eFbfkNodYw-9ddyM0dg8KOSgv-_Bp4'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

// Configurar cliente Supabase com autoRefreshToken e persistSession
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Desabilitar confirmação de email
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})

// Adicionar trigger de debug para desenvolvimento
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event)
  if (session) {
    console.log('User authenticated:', session.user.id)
  }
})