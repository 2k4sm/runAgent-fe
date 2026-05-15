import { create } from 'zustand'
import { conversationService } from '@/services/conversationService'
import type { Conversation } from '@/types'

interface ConversationState {
  conversations: Conversation[]
  activeId: string | null
  loading: boolean
  error: string | null

  loadConversations: () => Promise<void>
  createConversation: (title?: string) => Promise<Conversation>
  selectConversation: (id: string | null) => void
  deleteConversation: (id: string) => Promise<void>
  /** Move a conversation to the top of the list (mirrors backend updated_at order). */
  touchConversation: (id: string) => void
  renameLocally: (id: string, title: string) => void
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeId: null,
  loading: false,
  error: null,

  loadConversations: async () => {
    set({ loading: true, error: null })
    try {
      const conversations = await conversationService.list()
      set({ conversations, loading: false })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' })
    }
  },

  createConversation: async (title) => {
    const conversation = await conversationService.create(title)
    set({ conversations: [conversation, ...get().conversations] })
    return conversation
  },

  selectConversation: (activeId) => set({ activeId }),

  deleteConversation: async (id) => {
    const previous = get().conversations
    // Optimistic removal.
    set({
      conversations: previous.filter((c) => c.id !== id),
      activeId: get().activeId === id ? null : get().activeId,
    })
    try {
      await conversationService.remove(id)
    } catch (err) {
      // Roll back on failure.
      set({ conversations: previous, error: err instanceof Error ? err.message : 'Delete failed' })
      throw err
    }
  },

  touchConversation: (id) => {
    const list = get().conversations
    const idx = list.findIndex((c) => c.id === id)
    if (idx <= 0) return
    const next = [...list]
    const [moved] = next.splice(idx, 1)
    set({ conversations: [moved, ...next] })
  },

  renameLocally: (id, title) => {
    set({
      conversations: get().conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    })
  },
}))
