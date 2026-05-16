import { useEffect } from 'react'

/**
 * Watchdog for a Base UI failure mode: if a modal overlay is unmounted while
 * open, its cleanup can leave the rest of the page stuck `inert` (every click
 * and keypress dead) until a reload. Base UI tags inerted elements with
 * `data-base-ui-inert`; this strips those tags when they linger with no
 * overlay actually open, so the UI self-heals instead of locking up.
 */
export function InertRecovery() {
  useEffect(() => {
    const sweep = () => {
      const marked = document.querySelectorAll('[data-base-ui-inert]')
      if (marked.length === 0) return
      // A genuinely-open overlay always keeps its popup mounted.
      const overlayOpen = document.querySelector(
        '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]',
      )
      if (overlayOpen) return
      marked.forEach((el) => {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
        el.removeAttribute('data-base-ui-inert')
      })
    }
    const id = window.setInterval(sweep, 1000)
    return () => window.clearInterval(id)
  }, [])

  return null
}
