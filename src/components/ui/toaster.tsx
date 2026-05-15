import { Toaster as SonnerToaster } from 'sonner'
import { useUIStore } from '@/stores/uiStore'

/** App-wide toast host; mirrors the current theme. */
export function Toaster() {
  const theme = useUIStore((s) => s.theme)
  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'border border-border bg-popover text-popover-foreground rounded-none',
        },
      }}
    />
  )
}
