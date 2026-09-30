import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../LanguageContext.jsx'

// A copy is as wide as its own names, so the loop has to travel exactly one copy's width
// for the text to stay continuous. CSS cannot express that. `translateX(-50%)` travels half
// the track, which seams only if the track divides into equal copies, and `translateX(-100vw)`
// travels one screen, which seams only if a copy is exactly one screen wide — forcing that
// with `w-screen` left 421px of blank inside every copy, because nine names fill 1019px of a
// 1440px copy. So the distance is measured here and passed in as a custom property, and the
// list is repeated until two screens are covered: one to scroll away, one to arrive.
function copiesFor(copyWidth, viewportWidth) {
  if (!copyWidth) return 3
  return Math.max(2, Math.ceil((viewportWidth * 2) / copyWidth))
}

export function Marquee() {
  const { t } = useLanguage()
  const items = t('marquee')
  const copyRef = useRef(null)
  // One state object rather than separate count and distance, so a resize that changes the
  // count cannot land with a stale distance for a frame and move the track by the wrong amount.
  const [measured, setMeasured] = useState({ copies: 3, distance: null })

  useEffect(() => {
    const copy = copyRef.current
    if (!copy) return undefined

    const measure = () => {
      const copyWidth = copy.getBoundingClientRect().width
      if (!copyWidth) return
      const copies = copiesFor(copyWidth, window.innerWidth)
      setMeasured((current) =>
        // Identical values are left alone: writing the same distance again restarts the
        // keyframe, which would jolt the band on every resize event it did not need to.
        current.copies === copies && current.distance === copyWidth
          ? current
          : { copies, distance: copyWidth },
      )
    }

    measure()
    // The copy is observed for changes to its own width — a different language, a different
    // font loading. The viewport is watched separately: a resize that changes how many
    // copies are needed changes nothing about the copy's own box, so a ResizeObserver on
    // the copy alone leaves the band too short on the new screen and the count never catches up.
    const observer = new ResizeObserver(measure)
    observer.observe(copy)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [items])

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-marigold/40 bg-maroon py-3"
    >
      <div
        className="animate-marquee flex w-max items-center whitespace-nowrap"
        style={
          measured.distance
            ? { '--marquee-distance': `${measured.distance}px` }
            : undefined
        }
      >
        {Array.from({ length: measured.copies }, (_, copy) => (
          // `w-max` and not a viewport unit: a copy is exactly as wide as its own names, so
          // the measured distance is that width and the seam falls between two copies rather
          // than in blank space. `shrink-0` stops flex from squeezing it narrower than measured.
          <div
            key={copy}
            ref={copy === 0 ? copyRef : undefined}
            className="flex w-max shrink-0 items-center"
          >
            {items.map((item, index) => (
              <span
                key={index}
                className="flex items-center pr-8 font-display text-lg text-marigold"
              >
                {item}
                <span className="pl-8 text-marigold/60">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}