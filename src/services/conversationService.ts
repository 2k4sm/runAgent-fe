import { apiGet, apiPost, apiDelete } from './api'
import type { Conversation, PersistedRun } from '@/types'

/** CRUD calls for conversations and their persisted runs. */
export const conversationService = {
  create(title?: string): Promise<Conversation> {
    return apiPost<Conversation>('/conversations', { title: title || 'New conversation' })
  },

  list(): Promise<Conversation[]> {
    return apiGet<Conversation[]>('/conversations')
  },

  get(id: string): Promise<Conversation> {
    return apiGet<Conversation>(`/conversations/${id}`)
  },

  getRuns(id: string): Promise<PersistedRun[]> {
    return apiGet<PersistedRun[]>(`/conversations/${id}/runs`)
  },

  remove(id: string): Promise<{ status: string }> {
    return apiDelete<{ status: string }>(`/conversations/${id}`)
  },
}
