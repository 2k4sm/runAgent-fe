import type { UsageMeta } from '@/types'

/** Token usage line shown beneath a completed assistant message. */
export function UsageFooter({ usage }: { usage: UsageMeta }) {
  return (
    <p className="text-muted-foreground mt-1 text-[0.7rem]">
      {usage.total_tokens.toLocaleString()} tokens ({usage.prompt_tokens.toLocaleString()} in ·{' '}
      {usage.completion_tokens.toLocaleString()} out)
    </p>
  )
}
