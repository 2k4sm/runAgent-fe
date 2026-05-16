import { Skeleton } from '@/components/ui/skeleton'

/** A user bubble + assistant block pair mirroring MessageItem's layout. */
function MessagePairSkeleton({ userWidth }: { userWidth: string }) {
  return (
    <>
      <div className="flex justify-end px-4 py-3">
        <Skeleton className="h-14 max-w-[80%]" style={{ width: userWidth }} />
      </div>
      <div className="flex flex-col gap-2 px-4 py-3">
        <Skeleton className="h-4 w-24 self-start" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[92%]" />
        <Skeleton className="h-3.5 w-[70%]" />
      </div>
    </>
  )
}

/** Placeholder shown while an existing conversation's messages load. */
export function ChatSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-2" aria-hidden>
      <MessagePairSkeleton userWidth="55%" />
      <MessagePairSkeleton userWidth="38%" />
      <MessagePairSkeleton userWidth="64%" />
    </div>
  )
}
