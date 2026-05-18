import * as React from 'react'
import { Button } from '@/components/ui/button'

interface State {
  error: Error | null
}

/** Catches render-time errors so a crash in one view doesn't blank the whole app. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled UI error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-base font-semibold">Something went wrong</p>
          <p className="text-muted-foreground max-w-md text-sm">{this.state.error.message}</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      )
    }
    return this.props.children
  }
}
