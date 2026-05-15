import { useEffect, useLayoutEffect, useRef } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Header } from '@/components/layout/Header'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import type { ChatMessage } from '@/types'

interface ChatWindowProps {
  conversationId: string | null
  messages: ChatMessage[]
}

/** Scrollable message area + composer, with sticky-to-bottom auto-scroll. */
export function ChatWindow({ conversationId, messages }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(true)
  const streaming = useChatStore((s) => s.streaming)
  const conversations = useConversationStore((s) => s.conversations)

  const title =
    conversations.find((c) => c.id === conversationId)?.title ??
    (conversationId ? 'Conversation' : 'New chat')

  // Track whether the user is scrolled to the bottom.
  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  // Keep the latest content in view while pinned to the bottom.
  const lastContent = messages[messages.length - 1]?.content ?? ''
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight
  }, [messages.length, lastContent, streaming])

  // Jump to the bottom when switching conversations.
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
      pinnedRef.current = true
    }
  }, [conversationId])

  return (
    <div className="flex h-full flex-col">
      <Header title={title} />
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <ChatInput />
    </div>
  )
}
