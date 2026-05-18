/** Model Context Protocol server types. */

export type MCPAuthType = 'none' | 'header' | 'oauth'

export type MCPServerStatus = 'disconnected' | 'connected' | 'needs_auth' | 'error'

export interface MCPToolInfo {
  name: string
  description?: string | null
}

/** A connected MCP server as returned by the backend (never includes secrets). */
export interface MCPServer {
  id: string
  name: string
  description?: string | null
  url: string
  transport: string
  auth_type: MCPAuthType
  enabled: boolean
  status: MCPServerStatus
  status_detail?: string | null
  /** Live favicon URL for the server's domain. */
  icon_url?: string | null
  tools: MCPToolInfo[]
  created_at?: string | null
}

export interface MCPHeaderInput {
  key: string
  value: string
}

export interface MCPServerCreateInput {
  // Name and description are derived automatically from the MCP server.
  url: string
  auth_type: MCPAuthType
  headers?: MCPHeaderInput[]
}

export interface MCPServerUpdateInput {
  name?: string
  description?: string
  enabled?: boolean
  headers?: MCPHeaderInput[]
}
