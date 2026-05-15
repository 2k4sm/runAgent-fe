import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { cn } from '@/lib/utils'

export const Collapsible = BaseCollapsible.Root
export const CollapsibleTrigger = BaseCollapsible.Trigger

/** Animated collapsible panel using the Tailwind collapsible-* keyframes. */
export function CollapsibleContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <BaseCollapsible.Panel
      className={cn(
        'overflow-hidden',
        'data-[ending-style]:h-0 data-[starting-style]:h-0',
        'h-[var(--collapsible-panel-height)] transition-[height] duration-200 ease-out',
        className,
      )}
    >
      {children}
    </BaseCollapsible.Panel>
  )
}
