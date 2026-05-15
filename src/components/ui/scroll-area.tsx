import * as React from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cn } from '@/lib/utils'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
  viewportClassName?: string
  viewportRef?: React.Ref<HTMLDivElement>
  onViewportScroll?: React.UIEventHandler<HTMLDivElement>
}

/** Styled scroll container with an overlay scrollbar. */
export function ScrollArea({
  children,
  className,
  viewportClassName,
  viewportRef,
  onViewportScroll,
}: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={cn('relative overflow-hidden', className)}>
      <BaseScrollArea.Viewport
        ref={viewportRef}
        onScroll={onViewportScroll}
        className={cn('size-full overscroll-contain', viewportClassName)}
      >
        <BaseScrollArea.Content>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        orientation="vertical"
        className={cn(
          'flex w-2 touch-none p-0.5 transition-opacity select-none',
          'data-[scrolling]:opacity-100',
        )}
      >
        <BaseScrollArea.Thumb className="bg-border flex-1" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  )
}
