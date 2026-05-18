import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  /** Extra classes for the popup (e.g. a wider max-width). */
  className?: string
}

/** Controlled, non-alert modal dialog built on Base UI's Dialog. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            'transition-opacity duration-150',
          )}
        />
        <BaseDialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)]',
            'max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col',
            'border-border bg-card text-card-foreground border shadow-lg outline-none',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            'transition-opacity duration-150',
            className,
          )}
        >
          <div className="border-border flex items-start justify-between gap-4 border-b p-4">
            <div className="min-w-0">
              <BaseDialog.Title className="text-base font-semibold">{title}</BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="text-muted-foreground mt-1 text-sm">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </BaseDialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
