import { apiDelete, apiGet, apiPatch, apiPost } from './api'
import type { MCPServer, MCPServerCreateInput, MCPServerUpdateInput } from '@/types'

/** CRUD + connection calls for the user's MCP servers. */
export const mcpService = {
  list(): Promise<MCPServer[]> {
    return apiGet<MCPServer[]>('/mcp/servers')
  },

  create(body: MCPServerCreateInput): Promise<MCPServer> {
    return apiPost<MCPServer>('/mcp/servers', body)
  },

  update(id: string, body: MCPServerUpdateInput): Promise<MCPServer> {
    return apiPatch<MCPServer>(`/mcp/servers/${id}`, body)
  },

  remove(id: string): Promise<{ status: string }> {
    return apiDelete<{ status: string }>(`/mcp/servers/${id}`)
  },

  test(id: string): Promise<MCPServer> {
    return apiPost<MCPServer>(`/mcp/servers/${id}/test`)
  },

  oauthStart(id: string): Promise<{ authorization_url: string }> {
    return apiPost<{ authorization_url: string }>(`/mcp/servers/${id}/oauth/start`)
  },
}
