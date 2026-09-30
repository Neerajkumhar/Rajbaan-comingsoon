import { useLanguage } from '../LanguageContext.jsx'

// One copy of the list is a fixed number of viewport widths, and the keyframe translates
// by exactly one, so the loop point is the viewport edge whatever the screen is. How many
// copies are needed therefore depends on how wide a copy is, and a copy is as wide as its
// nine names at the current type size: four is enough that even the widest supported
// screen is covered twice over, so there is never a moment with nothing to scroll into.
const COPIES = 4

export function Marquee() {
  const { t } = useLanguage()
  const items = t('marquee')

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-marigold/40 bg-maroon py-3"
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {Array.from({ length: COPIES }, (_, copy) => (
          // `w-screen` is what makes the seam exact. Each copy is then one viewport wide
          // regardless of how wide its text happens to measure, which is the property the
          // -100vw keyframe depends on; without it a copy is as wide as its contents and
          // the two drift out of step with the animation.
          <div key={copy} className="flex w-screen shrink-0 items-center">
            {items.map((item, index) => (
              <span
                key={index}
                className="flex items-center pr-[0.6em] font-display text-[clamp(1.125rem,2.2vw,2rem)] text-marigold"
              >
                {item}
                <span className="pl-[0.6em] text-marigold/60">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}