import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
}

/** Controlled confirmation modal built on Base UI's AlertDialog. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            'transition-opacity duration-150',
          )}
        />
        <AlertDialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2',
            'border-border bg-card text-card-foreground -translate-y-1/2 border p-6 shadow-lg',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            'transition-opacity duration-150 outline-none',
          )}
        >
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
              {description}
            </AlertDialog.Description>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="outline" size="sm" />}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              size="sm"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
