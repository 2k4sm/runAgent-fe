import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  /** Center within a full-height flex container. */
  fullPage?: boolean
}

export function LoadingSpinner({ className, fullPage }: LoadingSpinnerProps) {
  const spinner = <Loader2 className={cn('text-muted-foreground size-5 animate-spin', className)} />
  if (!fullPage) return spinner
  return <div className="flex h-full w-full items-center justify-center">{spinner}</div>
}
