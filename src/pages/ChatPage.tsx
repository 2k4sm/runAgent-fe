import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { conversationService } from '@/services/conversationService'

/** Chat route for both `/` (new chat) and `/c/:id` (existing conversation). */
export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const selectConversation = useConversationStore((s) => s.selectConversation)
  const messages = useChatStore((s) => (id ? s.messagesByConversation[id] : undefined)) ?? []
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    selectConversation(id ?? null)
    if (!id) return

    const chat = useChatStore.getState()
    if (chat.isLoaded(id) || chat.streaming) return

    let cancelled = false
    setLoading(true)
    conversationService
      .getRuns(id)
      .then((runs) => {
        if (!cancelled) useChatStore.getState().setRuns(id, runs)
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load this conversation')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, selectConversation])

  return (
    <ChatWindow
      conversationId={id ?? null}
      messages={messages}
      loading={Boolean(id) && loading && messages.length === 0}
    />
  )
}
