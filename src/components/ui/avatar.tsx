import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  fallback: string
  className?: string
}

/** Small circular avatar; renders initials when no image is available. */
export function Avatar({ src, fallback, className }: AvatarProps) {
  return (
    <BaseAvatar.Root
      className={cn(
        'inline-flex size-8 items-center justify-center overflow-hidden select-none',
        'bg-muted text-muted-foreground align-middle text-xs font-medium',
        className,
      )}
    >
      {src ? <BaseAvatar.Image src={src} className="size-full object-cover" /> : null}
      <BaseAvatar.Fallback>{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
}
