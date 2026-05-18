import type { AgentName } from '@/types'

/** Base URL for the backend API. Defaults to the Vite dev proxy path. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/** Window event dispatched by the API layer when auth is irrecoverably lost. */
export const AUTH_LOGOUT_EVENT = 'auth:logout'

/** Application route paths. */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  CHAT: '/',
  CHAT_BY_ID: (id: string) => `/c/${id}`,
  SETTINGS: '/settings',
} as const

export interface AgentMeta {
  label: string
  /** Tailwind classes for the agent badge. */
  badgeClass: string
  description: string
}

/** Per-agent display metadata, keyed by the backend `agent` field. */
export const AGENT_META: Record<string, AgentMeta> = {
  supervisor: {
    label: 'Agent',
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
    description: 'Orchestrates and routes work to specialist agents',
  },
  research: {
    label: 'Research',
    badgeClass: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
    description: 'Searches the web and retrieves documents',
  },
  document: {
    label: 'Document',
    badgeClass: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
    description: 'Generates files: DOCX, XLSX, PPTX, PDF, CSV, MD, TXT',
  },
}

export function agentMeta(agent: string | undefined | null): AgentMeta {
  if (agent && AGENT_META[agent]) return AGENT_META[agent]
  return {
    label: agent ? agent.charAt(0).toUpperCase() + agent.slice(1) : 'Agent',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    description: '',
  }
}

export const KNOWN_AGENTS: AgentName[] = ['supervisor', 'research', 'document']

/** Generated-document MIME types the document agent may emit. */
export const GENERATED_FILE_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'text/csv',
  'text/markdown',
  'text/plain',
])
