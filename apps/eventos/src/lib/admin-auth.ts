import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function getAdminSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAdminAuthChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function loginAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error?.message ?? null }
}

export async function logoutAdmin() {
  await supabase.auth.signOut()
}
