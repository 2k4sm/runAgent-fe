import { Sparkles } from 'lucide-react'
import { MessageItem } from './MessageItem'
import { EmptyState } from '@/components/common/EmptyState'
import type { ChatMessage } from '@/types'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Start a conversation"
        description="Ask a question, request research, or have a document generated."
        className="h-full"
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-2">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}
