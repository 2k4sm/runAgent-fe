/** Blinking caret shown at the tail of an actively streaming answer. */
export function StreamingCursor() {
  return (
    <span
      className="bg-foreground ml-0.5 inline-block h-4 w-[2px] animate-pulse align-text-bottom"
      aria-hidden
    />
  )
}
