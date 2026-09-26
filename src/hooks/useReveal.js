import { useEffect, useRef, useState } from 'react'

function revealsImmediately() {
  if (typeof IntersectionObserver === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(revealsImmediately)

  useEffect(() => {
    const node = ref.current
    if (!node || revealsImmediately()) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}
