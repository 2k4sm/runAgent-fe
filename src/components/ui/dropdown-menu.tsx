import * as React from 'react'
import { Menu } from '@base-ui/react/menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

interface ContentProps {
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

/** Portalled, positioned menu surface. */
export function DropdownMenuContent({
  children,
  className,
  side = 'bottom',
  align = 'end',
}: ContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner side={side} align={align} sideOffset={6}>
        <Menu.Popup
          className={cn(
            'border-border bg-popover text-popover-foreground z-50 min-w-[10rem] border p-1 shadow-md',
            'outline-none',
            className,
          )}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

interface ItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  destructive?: boolean
  disabled?: boolean
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  destructive,
  disabled,
}: ItemProps) {
  return (
    <Menu.Item
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex cursor-default items-center gap-2 px-2 py-1.5 text-sm outline-none select-none',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive && 'text-destructive data-[highlighted]:bg-destructive/10',
        className,
      )}
    >
      {children}
    </Menu.Item>
  )
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className="bg-border my-1 h-px" />
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">{children}</div>
}
