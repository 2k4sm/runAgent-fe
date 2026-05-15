import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { AUTH_LOGOUT_EVENT } from '@/lib/constants'
import type { CurrentUser } from '@/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  session: Session | null
  user: CurrentUser | null
  initialized: boolean
  initialize: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  user: null,
  initialized: false,

  initialize: () => {
    if (get().initialized) return
    set({ initialized: true })

    // React to the resolved session and all future auth changes.
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        set({ session, status: 'authenticated' })
        try {
          const user = await authService.fetchMe()
          set({ user })
        } catch {
          // Backend rejected the token — treat as signed out.
          set({ session: null, user: null, status: 'unauthenticated' })
        }
      } else {
        set({ session: null, user: null, status: 'unauthenticated' })
      }
    })

    // The API layer dispatches this when a 401 cannot be recovered.
    window.addEventListener(AUTH_LOGOUT_EVENT, () => {
      void supabase.auth.signOut()
      set({ session: null, user: null, status: 'unauthenticated' })
    })
  },

  signIn: async (email, password) => {
    await authService.signIn(email, password)
  },

  signUp: async (email, password) => {
    await authService.signUp(email, password)
  },

  signOut: async () => {
    await authService.signOut()
    set({ session: null, user: null, status: 'unauthenticated' })
  },
}))
