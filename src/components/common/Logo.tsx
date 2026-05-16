import { cn } from '@/lib/utils'

interface LogoProps {
  /** Tailwind size classes for the square mark, e.g. `size-8`. */
  className?: string
}

/**
 * The runAgent brand mark — a teal square with a forward "run" chevron and an
 * agent node. Sharp-edged to match the app's design language.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="runAgent"
      className={cn('size-8 shrink-0', className)}
    >
      <rect width="32" height="32" className="fill-primary" />
      {/* Forward chevron — the "run" action. */}
      <path
        d="M9 9l7 7-7 7"
        fill="none"
        strokeWidth={3}
        strokeLinecap="square"
        strokeLinejoin="miter"
        className="stroke-primary-foreground"
      />
      {/* Agent node. */}
      <rect x="19" y="20" width="6" height="3" className="fill-primary-foreground" />
    </svg>
  )
}

interface LogoWordmarkProps {
  className?: string
  /** Size classes applied to the mark. */
  markClassName?: string
  /** Hide the "runAgent" text, showing only the mark. */
  hideText?: boolean
}

/** The brand mark paired with the "runAgent" wordmark. */
export function LogoWordmark({ className, markClassName, hideText }: LogoWordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Logo className={markClassName} />
      {hideText ? null : <span className="text-sm font-semibold tracking-tight">runAgent</span>}
    </span>
  )
}
