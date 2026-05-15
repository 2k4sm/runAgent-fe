import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/constants'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/** Gates authenticated routes; redirects to login once auth state resolves. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingSpinner fullPage />
  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <>{children}</>
}

/** Inverse guard for login/signup — sends signed-in users to the chat. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') return <LoadingSpinner fullPage />
  if (status === 'authenticated') return <Navigate to={ROUTES.CHAT} replace />
  return <>{children}</>
}
