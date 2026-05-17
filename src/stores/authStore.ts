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

    let fetchInFlight = false

    // Verify identity against the backend, deferred out of the auth callback
    // (running async Supabase calls inside it risks a lock deadlock) and deduped
    // so a token refresh or tab-focus re-emit never refetches /auth/me.
    const verifyUser = (session: Session) => {
      const userId = session.user.id
      if (get().user?.id === userId || fetchInFlight) return
      fetchInFlight = true
      setTimeout(async () => {
        try {
          const user = await authService.fetchMe()
          if (get().session?.user.id === userId) set({ user })
        } catch {
          // Backend rejected the token — treat as signed out.
          if (get().session?.user.id === userId) {
            set({ session: null, user: null, status: 'unauthenticated' })
          }
        } finally {
          fetchInFlight = false
        }
      }, 0)
    }

    // React to the resolved session and all future auth changes. /auth/me is
    // fetched only on a genuine sign-in — not on every TOKEN_REFRESHED.
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        set({ session: null, user: null, status: 'unauthenticated' })
        return
      }
      set({ session, status: 'authenticated' })
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') verifyUser(session)
    })

    // The API layer dispatches this when a 401 cannot be recovered.
    window.addEventListener(AUTH_LOGOUT_EVENT, () => {
      void supabase.auth.signOut()
      set({ session: null, user: null, status: 'unauthenticated' })
    })

    // Safety net: never trap the app on a blank loading screen if the auth
    // client fails to deliver an initial session.
    window.setTimeout(() => {
      if (get().status === 'loading') {
        set({ session: null, user: null, status: 'unauthenticated' })
      }
    }, 8000)
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
