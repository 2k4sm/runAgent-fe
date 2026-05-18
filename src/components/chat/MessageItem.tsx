import { AlertCircle, RotateCcw } from 'lucide-react'
import { Markdown } from '@/components/common/Markdown'
import { useChat } from '@/hooks/useChat'
import { useChatStore } from '@/stores/chatStore'
import { AgentBadge } from './AgentBadge'
import { ThoughtBlock } from './ThoughtBlock'
import { ReasoningBlock } from './ReasoningBlock'
import { AgentResponseBlock } from './AgentResponseBlock'
import { ToolCallBlock } from './ToolCallBlock'
import { HandoffDivider } from './HandoffDivider'
import { StreamingIndicator } from './StreamingIndicator'
import { StreamingCursor } from './StreamingCursor'
import { AttachmentList } from './AttachmentList'
import { UsageFooter } from './UsageFooter'
import { cn } from '@/lib/utils'
import type { ChatItem, ChatMessage } from '@/types'

function ItemRenderer({
  item,
  streaming,
  active,
  onRetry,
  retryBusy,
}: {
  item: ChatItem
  streaming: boolean
  active: boolean
  onRetry: () => void
  retryBusy: boolean
}) {
  switch (item.kind) {
    case 'reasoning':
      return <ReasoningBlock item={item} streaming={streaming} />
    case 'agent_response':
      return <AgentResponseBlock item={item} active={active} />
    case 'thought':
      return <ThoughtBlock item={item} />
    case 'tool_call':
    case 'tool_result':
      return <ToolCallBlock item={item} />
    case 'handoff':
      return <HandoffDivider item={item} />
    case 'error':
      return (
        <div className="border-destructive/40 bg-destructive/10 text-destructive my-2 flex items-start gap-2 border p-2 text-xs">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{item.content}</span>
          <button
            type="button"
            onClick={onRetry}
            disabled={retryBusy}
            className="border-border bg-background text-foreground hover:bg-muted ml-auto flex shrink-0 items-center gap-1 self-start border px-1.5 py-0.5 disabled:opacity-50"
          >
            <RotateCcw className="size-3" />
            Retry
          </button>
        </div>
      )
    default:
      return null
  }
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%]">
        <div className="border-border bg-primary/10 border px-3 py-2 text-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.attachments?.length ? <AttachmentList attachments={message.attachments} /> : null}
      </div>
    </div>
  )
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const streaming = message.status === 'streaming'
  const { retry } = useChat()
  const busy = useChatStore((s) => s.streaming)

  return (
    <div className="flex flex-col gap-1">
      <AgentBadge agent={message.agent} className="self-start" />

      <div className="text-sm">
        {message.items.map((item, idx) => (
          <ItemRenderer
            key={item.id}
            item={item}
            streaming={streaming}
            // "active" = the latest item received: streaming, last, no answer text yet.
            active={streaming && idx === message.items.length - 1 && !message.content}
            onRetry={() => void retry(message)}
            retryBusy={busy}
          />
        ))}

        {message.content ? (
          <>
            <Markdown content={message.content} />
            {streaming ? <StreamingCursor /> : null}
          </>
        ) : null}

        {/* Keep a visible "working" signal for the whole turn — including the
            gaps after a handoff while the next agent spins up. */}
        {streaming ? <StreamingIndicator /> : null}
      </div>

      {message.generatedAssets?.length ? (
        <AttachmentList attachments={message.generatedAssets} />
      ) : null}

      {message.usage ? <UsageFooter usage={message.usage} /> : null}
    </div>
  )
}

/** Renders one chat message, branching on role. */
export function MessageItem({ message }: { message: ChatMessage }) {
  return (
    <div className={cn('px-4 py-3')}>
      {message.role === 'user' ? (
        <UserMessage message={message} />
      ) : (
        <AssistantMessage message={message} />
      )}
    </div>
  )
}
