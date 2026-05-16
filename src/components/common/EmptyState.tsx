import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="relative">
          {/* Soft teal glow behind the icon badge. */}
          <div aria-hidden className="bg-primary/15 absolute inset-0 -z-10 blur-xl" />
          {/* Offset shadow box — leans into the sharp-edged design language. */}
          <div
            aria-hidden
            className="border-border absolute inset-0 translate-x-1.5 translate-y-1.5 border"
          />
          <div className="border-primary/30 bg-primary/10 text-primary relative flex size-14 items-center justify-center border">
            <Icon className="size-7" strokeWidth={1.75} />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold tracking-tight">{title}</p>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  )
}
