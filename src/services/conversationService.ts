import { apiGet, apiPost, apiDelete } from './api'
import type { Conversation, PersistedMessage } from '@/types'

/** CRUD calls for conversations and their persisted messages. */
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

  getMessages(id: string): Promise<PersistedMessage[]> {
    return apiGet<PersistedMessage[]>(`/conversations/${id}/messages`)
  },

  remove(id: string): Promise<{ status: string }> {
    return apiDelete<{ status: string }>(`/conversations/${id}`)
  },
}
