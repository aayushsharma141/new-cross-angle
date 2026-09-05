import * as React from "react"

/**
 * The Reveal — Bible §9.1
 * 
 * "A slow, curtain-like vertical wipe on initial page load,
 *  simulating natural light slowly filling a dark architectural room."
 * 
 * Uses only transform + opacity (Bible §5 Motion).
 * Easing: cubic-bezier(0.22, 1, 0.36, 1) — the global deceleration curve.
 */
export function RevealCurtain({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    // Slight delay to ensure paint, then trigger reveal
    const frame = requestAnimationFrame(() => {
      setRevealed(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="relative">
      {/* Content — always rendered for SEO */}
      <div
        className="transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        {children}
      </div>

      {/* Curtain overlay — slides up to reveal */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[9999] bg-stone-950 pointer-events-none transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: revealed ? "translateY(-100%)" : "translateY(0%)",
        }}
      />
    </div>
  )
}
