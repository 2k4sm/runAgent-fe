/** Three-dot pulse shown while an assistant turn has started but has no text yet. */
export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Assistant is responding">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground size-1.5 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
