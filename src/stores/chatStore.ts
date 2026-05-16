import { create } from 'zustand'
import type {
  Asset,
  ChatMessage,
  PersistedRun,
  SSEEvent,
  TimelineAttachment,
  ToolCallMeta,
  ToolResultMeta,
  UsageMeta,
} from '@/types'

const uid = (): string => crypto.randomUUID()
const now = (): string => new Date().toISOString()

/** Minimal event shape shared by live SSE events and persisted timeline events. */
interface EventLike {
  type: SSEEvent['type']
  agent?: string | null
  content?: string | null
  metadata?: Record<string, unknown> | null
}

/** Promotes a trimmed timeline attachment into a full Asset for rendering. */
function attachmentToAsset(a: TimelineAttachment): Asset {
  return {
    id: a.id,
    user_id: '',
    conversation_id: null,
    run_id: null,
    source: 'upload',
    file_name: a.file_name,
    file_type: a.file_type,
    file_size: a.file_size,
    storage_path: '',
    file_url: a.file_url,
    created_at: now(),
  }
}

/**
 * Applies one event to an assistant message, returning the updated copy.
 * Shared by the live stream (`applySSEEvent`) and run replay (`mapRuns`) so
 * both reconstruct thoughts, tool calls and handoffs identically.
 */
function applyEventToMessage(m: ChatMessage, event: EventLike): ChatMessage {
  const { type, agent, content, metadata } = event

  switch (type) {
    case 'chunk':
      return { ...m, agent: agent || m.agent, content: m.content + (content ?? '') }

    case 'thought': {
      const items = m.items.slice()
      const last = items[items.length - 1]
      // Merge consecutive thoughts from the same agent.
      if (last && last.kind === 'thought' && last.agent === (agent ?? undefined)) {
        items[items.length - 1] = {
          ...last,
          content: `${last.content}\n${content ?? ''}`.trim(),
        }
      } else {
        items.push({
          id: uid(),
          kind: 'thought',
          agent: agent ?? undefined,
          content: content ?? '',
        })
      }
      return { ...m, items }
    }

    case 'tool_call': {
      const meta = (metadata ?? {}) as Partial<ToolCallMeta>
      return {
        ...m,
        items: [
          ...m.items,
          {
            id: uid(),
            kind: 'tool_call',
            agent: agent ?? undefined,
            content: '',
            metadata: metadata ?? undefined,
            toolCallId: meta.tool_call_id,
            toolName: meta.tool_name,
            resolved: false,
          },
        ],
      }
    }

    case 'tool_result': {
      const meta = (metadata ?? {}) as Partial<ToolResultMeta>
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
        agent: agent ?? undefined,
        content: content ?? '',
        metadata: metadata ?? undefined,
        toolName: meta.tool_name,
      })
      return { ...m, items }
    }

    case 'handoff':
      return {
        ...m,
        items: [
          ...m.items,
          {
            id: uid(),
            kind: 'handoff',
            agent: agent ?? undefined,
            content: content ?? '',
            metadata: metadata ?? undefined,
          },
        ],
      }

    case 'error':
      return {
        ...m,
        status: 'error',
        items: [
          ...m.items,
          {
            id: uid(),
            kind: 'error',
            agent: agent ?? undefined,
            content: content ?? 'An error occurred',
          },
        ],
      }

    case 'done':
      return {
        ...m,
        status: m.status === 'error' ? 'error' : 'complete',
        usage: (metadata?.usage as UsageMeta | undefined) ?? m.usage,
      }

    default:
      // 'status' and unknowns leave the message untouched.
      return m
  }
}

/** A fresh, empty assistant message for a given run. */
function emptyAssistant(runId: string): ChatMessage {
  return {
    // Stable id so reconciliation does not remount the message.
    id: `${runId}-assistant`,
    role: 'assistant',
    content: '',
    items: [],
    status: 'streaming',
    runId,
    createdAt: now(),
  }
}

/**
 * Rebuilds the conversation's ChatMessage[] by replaying every run's ordered
 * `data` timeline — yielding the same detail as a live stream.
 */
function mapRuns(runs: PersistedRun[]): ChatMessage[] {
  const messages: ChatMessage[] = []

  for (const run of runs) {
    let assistant: ChatMessage | null = null
    const ensureAssistant = (): ChatMessage => {
      if (!assistant) {
        assistant = emptyAssistant(run.id)
        messages.push(assistant)
      }
      return assistant
    }
    const updateAssistant = (fn: (m: ChatMessage) => ChatMessage): void => {
      const next = fn(ensureAssistant())
      messages[messages.length - 1] = next
      assistant = next
    }

    for (const entry of run.data ?? []) {
      if (entry.kind === 'message' && entry.role === 'user') {
        messages.push({
          id: `${run.id}-user`,
          role: 'user',
          content: entry.content ?? '',
          items: [],
          attachments: (entry.attachments ?? []).map(attachmentToAsset),
          status: 'complete',
          runId: run.id,
          createdAt: entry.ts,
        })
        assistant = null
      } else if (entry.kind === 'message' && entry.role === 'assistant') {
        updateAssistant((m) => ({
          ...m,
          agent: entry.agent ?? m.agent,
          content: entry.content ?? m.content,
          status: m.status === 'error' ? 'error' : 'complete',
        }))
      } else if (entry.kind === 'event' && entry.type) {
        // Final text comes from the assistant message entry; skip chunk text.
        if (entry.type === 'chunk' || entry.type === 'status') continue
        updateAssistant((m) =>
          applyEventToMessage(m, {
            type: entry.type!,
            agent: entry.agent,
            content: entry.content,
            metadata: entry.metadata,
          }),
        )
      }
    }

    // A run that ended without resolving (aborted) must not hang as streaming.
    if (assistant && (assistant as ChatMessage).status === 'streaming') {
      updateAssistant((m) => ({
        ...m,
        status: run.status === 'failed' ? 'error' : 'complete',
      }))
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

  setRuns: (conversationId: string, runs: PersistedRun[]) => void
  setEmpty: (conversationId: string) => void
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

    setRuns: (conversationId, runs) => {
      set((s) => ({
        messagesByConversation: {
          ...s.messagesByConversation,
          [conversationId]: mapRuns(runs),
        },
        loaded: { ...s.loaded, [conversationId]: true },
      }))
    },

    setEmpty: (conversationId) => {
      set((s) => ({
        messagesByConversation: { ...s.messagesByConversation, [conversationId]: [] },
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
      if (event.type === 'status') {
        set({ statusText: event.content ?? null })
        return
      }
      updateLast(conversationId, (m) => applyEventToMessage(m, event))
      if (event.type === 'error' || event.type === 'done') {
        set({ streaming: false, statusText: null })
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
