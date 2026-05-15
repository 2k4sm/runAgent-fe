import { AlertCircle } from 'lucide-react'
import { Markdown } from '@/components/common/Markdown'
import { AgentBadge } from './AgentBadge'
import { ThoughtBlock } from './ThoughtBlock'
import { ToolCallBlock } from './ToolCallBlock'
import { HandoffDivider } from './HandoffDivider'
import { StreamingIndicator } from './StreamingIndicator'
import { AttachmentList } from './AttachmentList'
import { GeneratedFileCard } from './GeneratedFileCard'
import { UsageFooter } from './UsageFooter'
import { cn } from '@/lib/utils'
import type { ChatItem, ChatMessage } from '@/types'

function ItemRenderer({ item }: { item: ChatItem }) {
  switch (item.kind) {
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
  const empty = !message.content && message.items.length === 0

  return (
    <div className="flex flex-col gap-1">
      <AgentBadge agent={message.agent} className="self-start" />

      <div className="text-sm">
        {message.items.map((item) => (
          <ItemRenderer key={item.id} item={item} />
        ))}

        {message.content ? (
          <Markdown content={message.content} />
        ) : streaming && empty ? (
          <StreamingIndicator />
        ) : null}
      </div>

      {message.generatedAssets?.length ? (
        <div className="mt-2 space-y-1.5">
          {message.generatedAssets.map((asset) => (
            <GeneratedFileCard key={asset.id} asset={asset} />
          ))}
        </div>
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
