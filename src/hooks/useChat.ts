import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { chatService } from '@/services/chatService'
import { conversationService } from '@/services/conversationService'
import { readSSEStream } from './useSSE'
import { ApiError } from '@/services/api'
import { ROUTES } from '@/lib/constants'
import type { Asset } from '@/types'

/** Builds lightweight Asset stand-ins for pending uploads so they render immediately. */
function pendingAssets(files: File[]): Asset[] {
  return files.map((f) => ({
    id: crypto.randomUUID(),
    user_id: '',
    conversation_id: null,
    run_id: null,
    source: 'upload',
    file_name: f.name,
    file_type: f.type || 'application/octet-stream',
    file_size: f.size,
    storage_path: '',
    file_url: '',
    created_at: new Date().toISOString(),
  }))
}

/**
 * Orchestrates sending a message end to end:
 * ensure a conversation exists -> POST the message -> stream the response ->
 * reconcile against persisted state.
 */
export function useChat() {
  const navigate = useNavigate()
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (content: string, files: File[] = []) => {
      const trimmed = content.trim()
      if (!trimmed && files.length === 0) return
      if (useChatStore.getState().streaming) return

      const convStore = useConversationStore.getState()
      const chatStore = useChatStore.getState()

      // 1. Resolve a conversation id — create one first if this is a new chat.
      let conversationId = convStore.activeId
      let isNew = false
      if (!conversationId) {
        try {
          const created = await convStore.createConversation()
          conversationId = created.id
          isNew = true
          convStore.selectConversation(conversationId)
          chatStore.setMessages(conversationId, [])
          navigate(ROUTES.CHAT_BY_ID(conversationId))
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Could not start a conversation')
          return
        }
      }

      // 2. Optimistically render the user message and an empty assistant turn.
      chatStore.appendUserMessage(conversationId, trimmed, pendingAssets(files))
      chatStore.startAssistantMessage(conversationId)

      // 3. POST the message.
      const controller = new AbortController()
      abortRef.current = controller
      let response: Response
      try {
        response = await chatService.sendMessage({
          content: trimmed,
          conversationId,
          attachments: files,
          signal: controller.signal,
        })
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to send message'
        toast.error(message)
        useChatStore.getState().setStreamError(conversationId, message)
        return
      }

      // 4. Stream and apply events.
      try {
        await readSSEStream(
          response,
          (event) => useChatStore.getState().applySSEEvent(conversationId, event),
          controller.signal,
        )
      } catch (err) {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'Stream interrupted'
          toast.error(message)
          useChatStore.getState().setStreamError(conversationId, message)
        }
      } finally {
        useChatStore.getState().finishStreaming(conversationId)
        abortRef.current = null
      }

      // 5. Reconcile against persisted state and refresh sidebar ordering.
      try {
        const rows = await conversationService.getMessages(conversationId)
        useChatStore.getState().setMessages(conversationId, rows)
      } catch {
        // Keep the optimistic stream if reconciliation fails.
      }
      if (isNew) {
        void useConversationStore.getState().loadConversations()
      } else {
        useConversationStore.getState().touchConversation(conversationId)
      }
    },
    [navigate],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    const conversationId = useConversationStore.getState().activeId
    if (conversationId) useChatStore.getState().finishStreaming(conversationId)
  }, [])

  return { send, stop }
}
