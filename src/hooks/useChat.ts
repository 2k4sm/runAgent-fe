import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { useUIStore } from '@/stores/uiStore'
import { chatService } from '@/services/chatService'
import { fileService } from '@/services/fileService'
import { readSSEStream } from './useSSE'
import { ApiError } from '@/services/api'
import { ROUTES } from '@/lib/constants'
import type { Asset, StagedFile } from '@/types'

/** Builds an optimistic Asset for a staged file so it renders immediately. */
function optimisticAsset(staged: StagedFile): Asset {
  if (staged.asset) return staged.asset
  return {
    id: staged.assetId ?? crypto.randomUUID(),
    user_id: '',
    conversation_id: null,
    run_id: null,
    source: 'upload',
    file_name: staged.file.name,
    file_type: staged.file.type || 'application/octet-stream',
    file_size: staged.file.size,
    storage_path: '',
    file_url: '',
    created_at: new Date().toISOString(),
  }
}

/**
 * Orchestrates sending a message end to end:
 * ensure a conversation exists -> upload any not-yet-uploaded attachments ->
 * POST the message -> stream the run -> reconcile against persisted state.
 */
export function useChat() {
  const navigate = useNavigate()
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (content: string, staged: StagedFile[] = []) => {
      const trimmed = content.trim()
      if (!trimmed && staged.length === 0) return
      if (useChatStore.getState().streaming) return

      const convStore = useConversationStore.getState()
      const chatStore = useChatStore.getState()

      // 1. Resolve a conversation id. For a new chat, generate it on the
      //    client so the UI can render and route synchronously — nothing waits
      //    on the create round-trip.
      const isNew = !convStore.activeId
      const conversationId = convStore.activeId ?? crypto.randomUUID()
      // Name the conversation after the opening query (trimmed to a sensible
      // length); fall back to the default for attachment-only sends.
      const title = trimmed ? trimmed.replace(/\s+/g, ' ').slice(0, 60) : 'New conversation'

      // 2. Render everything optimistically and instantly — before any await.
      if (isNew) {
        chatStore.setEmpty(conversationId) // marks `loaded` so ChatPage won't fetch
        convStore.selectConversation(conversationId)
        convStore.addLocalConversation(conversationId, title)
        navigate(ROUTES.CHAT_BY_ID(conversationId))
      }
      chatStore.appendUserMessage(conversationId, trimmed, staged.map(optimisticAsset))
      // Sets `streaming` → the thinking indicator shows immediately.
      chatStore.startAssistantMessage(conversationId)

      // 3. Persist the conversation row in the background (new chats only).
      if (isNew) {
        try {
          await convStore.createConversation(conversationId, title)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not start a conversation'
          toast.error(message)
          useChatStore.getState().setStreamError(conversationId, message)
          navigate(ROUTES.CHAT)
          return
        }
      }

      // 4. Ensure every attachment is stored. Re-upload anything that did not
      //    finish (or failed) on attach — abort the send if one still cannot
      //    be stored, rather than silently dropping the file.
      let attachmentIds: string[]
      try {
        attachmentIds = await Promise.all(
          staged.map(async (s) => {
            if (s.status === 'uploaded' && s.assetId) return s.assetId
            const asset = await fileService.upload(s.file)
            return asset.id
          }),
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload an attachment'
        toast.error(message)
        useChatStore.getState().setStreamError(conversationId, message)
        return
      }

      // 5. POST the message.
      const controller = new AbortController()
      abortRef.current = controller
      let response: Response
      try {
        response = await chatService.sendMessage({
          content: trimmed,
          conversationId,
          attachmentIds,
          reasoning: useUIStore.getState().reasoningEnabled,
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

      // 6. Stream and apply events.
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

      // 7. Move the conversation to the top of the sidebar. Nothing is
      //    refetched from the backend — the frontend store already holds the
      //    conversation (added optimistically) and the SSE-built messages;
      //    persisted runs are loaded only on first opening a conversation.
      useConversationStore.getState().touchConversation(conversationId)
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
