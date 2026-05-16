import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'runagent.theme'
const REASONING_KEY = 'runagent.reasoning'

/** Reads the persisted reasoning toggle; defaults to off. */
function getInitialReasoning(): boolean {
  return localStorage.getItem(REASONING_KEY) === 'true'
}

/** Reads the persisted theme, falling back to the OS preference. */
export function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Applies the theme class to <html>. Call before first render to avoid a flash. */
export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  reasoningEnabled: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setReasoningEnabled: (enabled: boolean) => void
  toggleReasoning: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,
  reasoningEnabled: getInitialReasoning(),

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),

  setReasoningEnabled: (reasoningEnabled) => {
    localStorage.setItem(REASONING_KEY, String(reasoningEnabled))
    set({ reasoningEnabled })
  },

  toggleReasoning: () => get().setReasoningEnabled(!get().reasoningEnabled),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
