import { create } from 'zustand'
import { mcpService } from '@/services/mcpService'
import type { MCPServer, MCPServerCreateInput, MCPServerUpdateInput } from '@/types'

interface MCPState {
  servers: MCPServer[]
  loading: boolean
  loaded: boolean
  error: string | null

  load: () => Promise<void>
  addServer: (input: MCPServerCreateInput) => Promise<MCPServer>
  updateServer: (id: string, input: MCPServerUpdateInput) => Promise<void>
  removeServer: (id: string) => Promise<void>
  testServer: (id: string) => Promise<void>
  /** Begin the OAuth flow: opens the provider's consent screen in a popup. */
  startOAuth: (id: string) => Promise<void>
}

/** Replace one server in the list, or append it if new. */
function upsert(servers: MCPServer[], server: MCPServer): MCPServer[] {
  const idx = servers.findIndex((s) => s.id === server.id)
  if (idx === -1) return [...servers, server]
  const next = servers.slice()
  next[idx] = server
  return next
}

export const useMCPStore = create<MCPState>((set, get) => ({
  servers: [],
  loading: false,
  loaded: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null })
    try {
      const servers = await mcpService.list()
      set({ servers, loading: false, loaded: true })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' })
    }
  },

  addServer: async (input) => {
    const server = await mcpService.create(input)
    set({ servers: upsert(get().servers, server) })
    return server
  },

  updateServer: async (id, input) => {
    const server = await mcpService.update(id, input)
    set({ servers: upsert(get().servers, server) })
  },

  removeServer: async (id) => {
    const previous = get().servers
    set({ servers: previous.filter((s) => s.id !== id) })
    try {
      await mcpService.remove(id)
    } catch (err) {
      set({ servers: previous })
      throw err
    }
  },

  testServer: async (id) => {
    const server = await mcpService.test(id)
    set({ servers: upsert(get().servers, server) })
  },

  startOAuth: async (id) => {
    const { authorization_url } = await mcpService.oauthStart(id)
    window.open(authorization_url, 'mcp-oauth', 'width=600,height=720')
  },
}))
