import { useEffect, useState } from 'react'

/** True when the primary pointer is coarse (touch) — phones and touch tablets. */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )
  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isTouch
}
