"use client"

import * as React from "react"

/**
 * Reveals the wrapped section once it scrolls into view — a marketing-surface
 * entrance, fired exactly once (see RECIPES: scroll reveal), then static.
 * The base styles in globals.css keep content visible for no-JS clients and
 * only hide it once the IntersectionObserver is armed.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    // Arm the hidden state directly on the DOM, not via state: it never
    // changes after mount, so a re-render would only be wasted work.
    node.dataset.armed = "true"

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      // -80px gives the reveal a beat before the element touches the fold.
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-revealed={visible || undefined}
      className={`home-reveal ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}