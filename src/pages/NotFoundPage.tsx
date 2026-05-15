import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-semibold">404</p>
      <p className="text-muted-foreground text-sm">This page could not be found.</p>
      <Link to={ROUTES.CHAT}>
        <Button>Back to chat</Button>
      </Link>
    </div>
  )
}
