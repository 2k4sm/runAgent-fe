import { create } from 'zustand'
import type {
  Asset,
  ChatItem,
  ChatMessage,
  PersistedMessage,
  SSEEvent,
  ToolCallMeta,
  ToolResultMeta,
  UsageMeta,
} from '@/types'

const uid = (): string => crypto.randomUUID()
const now = (): string => new Date().toISOString()

/** Best-effort extraction of Asset-shaped objects from a message metadata bag. */
function extractAssets(metadata: Record<string, unknown> | undefined, keys: string[]): Asset[] {
  if (!metadata) return []
  const out: Asset[] = []
  for (const key of keys) {
    const value = metadata[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'file_name' in item) {
          out.push(item as Asset)
        }
      }
    }
  }
  return out
}

/** Maps persisted backend rows into the UI's ChatMessage model. */
function mapPersisted(rows: PersistedMessage[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  let lastAssistant: ChatMessage | null = null

  for (const row of rows) {
    const meta = row.metadata ?? {}
    if (row.role === 'user') {
      const msg: ChatMessage = {
        id: row.id,
        role: 'user',
        content: row.content ?? '',
        items: [],
        attachments: extractAssets(meta, ['attachments', 'assets']),
        status: 'complete',
        runId: row.run_id,
        createdAt: now(),
      }
      messages.push(msg)
      lastAssistant = null
    } else if (row.role === 'assistant') {
      const msg: ChatMessage = {
        id: row.id,
        role: 'assistant',
        agent: row.agent ?? undefined,
        content: row.content ?? '',
        items: [],
        generatedAssets: extractAssets(meta, ['generated_assets', 'assets', 'attachments']),
        status: 'complete',
        usage: (meta.usage as UsageMeta | undefined) ?? undefined,
        runId: row.run_id,
        createdAt: now(),
      }
      messages.push(msg)
      lastAssistant = msg
    } else {
      // tool / system rows — attach as an inline item to the current assistant turn.
      const item: ChatItem = {
        id: row.id,
        kind: row.role === 'tool' ? 'tool_result' : 'handoff',
        agent: row.agent ?? undefined,
        content: row.content ?? '',
        metadata: meta,
      }
      if (!lastAssistant) {
        lastAssistant = {
          id: uid(),
          role: 'assistant',
          agent: row.agent ?? undefined,
          content: '',
          items: [],
          status: 'complete',
          runId: row.run_id,
          createdAt: now(),
        }
        messages.push(lastAssistant)
      }
      lastAssistant.items.push(item)
    }
  }
  return messages
}

interface ChatState {
  messagesByConversation: Record<string, ChatMessage[]>
  loaded: Record<string, boolean>
  streaming: boolean
  currentRunId: string | null
  statusText: string | null

  isLoaded: (conversationId: string) => boolean
  getMessages: (conversationId: string) => ChatMessage[]

  setMessages: (conversationId: string, rows: PersistedMessage[]) => void
  appendUserMessage: (conversationId: string, content: string, attachments?: Asset[]) => void
  startAssistantMessage: (conversationId: string) => string
  applySSEEvent: (conversationId: string, event: SSEEvent) => void
  finishStreaming: (conversationId: string) => void
  setStreamError: (conversationId: string, message: string) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => {
  /** Immutably replace the message list for a conversation. */
  const setList = (conversationId: string, list: ChatMessage[]) =>
    set((s) => ({
      messagesByConversation: { ...s.messagesByConversation, [conversationId]: list },
    }))

  /** Apply an updater to the last message of a conversation, immutably. */
  const updateLast = (conversationId: string, fn: (msg: ChatMessage) => ChatMessage) => {
    const list = get().messagesByConversation[conversationId] ?? []
    if (list.length === 0) return
    const next = list.slice()
    next[next.length - 1] = fn(next[next.length - 1])
    setList(conversationId, next)
  }

  return {
    messagesByConversation: {},
    loaded: {},
    streaming: false,
    currentRunId: null,
    statusText: null,

    isLoaded: (conversationId) => Boolean(get().loaded[conversationId]),

    getMessages: (conversationId) => get().messagesByConversation[conversationId] ?? [],

    setMessages: (conversationId, rows) => {
      set((s) => ({
        messagesByConversation: {
          ...s.messagesByConversation,
          [conversationId]: mapPersisted(rows),
        },
        loaded: { ...s.loaded, [conversationId]: true },
      }))
    },

    appendUserMessage: (conversationId, content, attachments) => {
      const msg: ChatMessage = {
        id: uid(),
        role: 'user',
        content,
        items: [],
        attachments,
        status: 'complete',
        createdAt: now(),
      }
      const list = get().messagesByConversation[conversationId] ?? []
      setList(conversationId, [...list, msg])
    },

    startAssistantMessage: (conversationId) => {
      const id = uid()
      const msg: ChatMessage = {
        id,
        role: 'assistant',
        content: '',
        items: [],
        status: 'streaming',
        createdAt: now(),
      }
      const list = get().messagesByConversation[conversationId] ?? []
      setList(conversationId, [...list, msg])
      set({ streaming: true, statusText: null })
      return id
    },

    applySSEEvent: (conversationId, event) => {
      const { type, agent, content, metadata } = event

      switch (type) {
        case 'chunk':
          updateLast(conversationId, (m) => ({
            ...m,
            agent: agent || m.agent,
            content: m.content + (content ?? ''),
          }))
          break

        case 'thought':
          updateLast(conversationId, (m) => {
            const items = m.items.slice()
            const last = items[items.length - 1]
            // Merge consecutive thoughts from the same agent.
            if (last && last.kind === 'thought' && last.agent === agent) {
              items[items.length - 1] = {
                ...last,
                content: `${last.content}\n${content ?? ''}`.trim(),
              }
            } else {
              items.push({
                id: uid(),
                kind: 'thought',
                agent,
                content: content ?? '',
              })
            }
            return { ...m, items }
          })
          break

        case 'tool_call': {
          const meta = (metadata ?? {}) as Partial<ToolCallMeta>
          updateLast(conversationId, (m) => ({
            ...m,
            items: [
              ...m.items,
              {
                id: uid(),
                kind: 'tool_call',
                agent,
                content: '',
                metadata: metadata ?? undefined,
                toolCallId: meta.tool_call_id,
                toolName: meta.tool_name,
                resolved: false,
              },
            ],
          }))
          break
        }

        case 'tool_result': {
          const meta = (metadata ?? {}) as Partial<ToolResultMeta>
          updateLast(conversationId, (m) => {
            const items = m.items.slice()
            // Match the most recent unresolved tool_call with the same tool name.
            for (let i = items.length - 1; i >= 0; i--) {
              const it = items[i]
              if (it.kind === 'tool_call' && !it.resolved && it.toolName === meta.tool_name) {
                items[i] = { ...it, resolved: true, result: content ?? '' }
                return { ...m, items }
              }
            }
            // No matching call — render the result standalone.
            items.push({
              id: uid(),
              kind: 'tool_result',
              agent,
              content: content ?? '',
              metadata: metadata ?? undefined,
              toolName: meta.tool_name,
            })
            return { ...m, items }
          })
          break
        }

        case 'handoff':
          updateLast(conversationId, (m) => ({
            ...m,
            items: [
              ...m.items,
              {
                id: uid(),
                kind: 'handoff',
                agent,
                content: content ?? '',
                metadata: metadata ?? undefined,
              },
            ],
          }))
          break

        case 'status':
          set({ statusText: content ?? null })
          break

        case 'error':
          updateLast(conversationId, (m) => ({
            ...m,
            status: 'error',
            items: [
              ...m.items,
              { id: uid(), kind: 'error', agent, content: content ?? 'An error occurred' },
            ],
          }))
          set({ streaming: false, statusText: null })
          break

        case 'done':
          updateLast(conversationId, (m) => ({
            ...m,
            status: m.status === 'error' ? 'error' : 'complete',
            usage: (metadata?.usage as UsageMeta | undefined) ?? m.usage,
          }))
          set({ streaming: false, statusText: null })
          break
      }
    },

    finishStreaming: (conversationId) => {
      updateLast(conversationId, (m) =>
        m.status === 'streaming' ? { ...m, status: 'complete' } : m,
      )
      set({ streaming: false, currentRunId: null, statusText: null })
    },

    setStreamError: (conversationId, message) => {
      updateLast(conversationId, (m) => ({
        ...m,
        status: 'error',
        items: [...m.items, { id: uid(), kind: 'error', content: message }],
      }))
      set({ streaming: false, statusText: null })
    },

    reset: () =>
      set({
        messagesByConversation: {},
        loaded: {},
        streaming: false,
        currentRunId: null,
        statusText: null,
      }),
  }
})
