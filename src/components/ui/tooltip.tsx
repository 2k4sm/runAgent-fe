import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '@/lib/utils'

/** Wrap the app once so tooltips share open-delay timing. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <BaseTooltip.Provider delay={300}>{children}</BaseTooltip.Provider>
}

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/** Simple tooltip: pass the trigger as children and the label as `content`. */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  if (!content) return <>{children}</>
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={(props) => <span {...props}>{children}</span>} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6}>
          <BaseTooltip.Popup
            className={cn(
              'border-border bg-popover z-50 max-w-xs border px-2 py-1 text-xs',
              'text-popover-foreground shadow-md',
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
