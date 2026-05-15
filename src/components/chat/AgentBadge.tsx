import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { agentMeta } from '@/lib/constants'
import { cn } from '@/lib/utils'

/** Colored badge identifying which agent produced a message or item. */
export function AgentBadge({ agent, className }: { agent?: string; className?: string }) {
  const meta = agentMeta(agent)
  const badge = <Badge className={cn(meta.badgeClass, className)}>{meta.label}</Badge>
  return meta.description ? <Tooltip content={meta.description}>{badge}</Tooltip> : badge
}
