import { supabase } from '@/lib/supabase'
import { apiGet } from './api'
import type { CurrentUser } from '@/types'
import type { Session } from '@supabase/supabase-js'

/** Thin wrapper around Supabase auth + the backend's /auth/me verification. */
export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  async signUp(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  /** Verifies the current JWT against the backend and returns the user identity. */
  fetchMe(): Promise<CurrentUser> {
    return apiGet<CurrentUser>('/auth/me')
  },
}
