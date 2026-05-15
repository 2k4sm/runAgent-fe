import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'runagent.theme'

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
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
