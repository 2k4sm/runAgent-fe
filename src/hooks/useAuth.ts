import { useAuthStore } from '@/stores/authStore'

/** Convenience selector hook over the auth store. */
export function useAuth() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signOut = useAuthStore((s) => s.signOut)

  return {
    status,
    user,
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signIn,
    signUp,
    signOut,
  }
}
