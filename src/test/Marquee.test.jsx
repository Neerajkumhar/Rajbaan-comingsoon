import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { content } from '../content.js'
import { LanguageProvider } from '../LanguageContext.jsx'
import { Marquee } from '../components/Marquee.jsx'
import { PIECES } from '../components/SpiceField.jsx'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSS = readFileSync(join(SRC, 'index.css'), 'utf8')

function renderMarquee() {
  return render(
    <LanguageProvider>
      <Marquee />
    </LanguageProvider>,
  )
}

function copies(container) {
  return [...container.querySelectorAll('.animate-marquee > div')]
}

function itemsIn(container, copy) {
  return [...copy.querySelectorAll(':scope > span')]
}

describe('Marquee', () => {
  it('repeats the list enough times to cover the widest screen twice over', () => {
    const { container } = renderMarquee()
    // Four copies of nine names is about 2.6 viewport widths at desktop type, which is
    // what the -100vw keyframe needs: one to scroll out of view while the next arrives.
    // A count that only just covered the screen would leave the tail of the animation
    // scrolling into empty maroon.
    expect(copies(container)).toHaveLength(4)
    for (const copy of copies(container)) {
      expect(itemsIn(container, copy)).toHaveLength(content.en.marquee.length)
    }
  })

  it('makes each copy exactly one viewport wide, so the seam lands on the edge', () => {
    const { container } = renderMarquee()
    for (const copy of copies(container)) {
      expect(copy.className).toContain('w-screen')
      // shrink-0 is what holds that width inside a flex track: without it a copy is free
      // to be squeezed to fit alongside the others, and every copy stops being a
      // viewport wide at once.
      expect(copy.className).toContain('shrink-0')
    }
  })

  it('lays the spacing inside each item, so every copy is identical in width', () => {
    const { container } = renderMarquee()
    const [first] = copies(container)

    // The track translates -100vw, so a seam-free loop needs every copy to be the same
    // width as the one the animation assumes. A flex `gap` between items would make that
    // false: N items produce N-1 gaps, so half a track is items + (N-1)/2 gaps while the
    // true period is items + N/2 gaps. Per-item padding keeps the copies equal, so the
    // last item must carry trailing padding like every other item.
    for (const copy of copies(container)) {
      for (const item of itemsIn(container, copy)) {
        expect(item.className).toBe(itemsIn(container, first)[0].className)
      }
      expect(itemsIn(container, copy).at(-1).className).toContain('pr-[')
    }
  })

  it('scales the type with the viewport, so spacing never outgrows the names', () => {
    const { container } = renderMarquee()
    const item = itemsIn(container, copies(container)[0])[0]
    // The spacing between names is now whatever fills the screen, so a fixed size would
    // leave the bar reading thin on a large monitor — which is the problem this loop
    // originally had. Type and padding both scale, and padding is in `em` so it scales
    // with the type rather than staying pinned at a fixed 2rem.
    expect(item.className).toContain('clamp(')
    expect(item.className).not.toContain('text-lg')
    expect(item.className).toContain('pr-[0.6em]')
  })

  it('hides the decorative band from assistive technology', () => {
    const { container } = renderMarquee()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('the marquee keyframe', () => {
  it('translates by one viewport width, not a percentage of the track', () => {
    // The bug this replaced: a -50% endpoint is seamless only when the track is twice the
    // viewport. At one third over, the track's right edge cleared the screen and the last
    // third of every cycle showed blank maroon. A -100vw endpoint cannot depend on how
    // wide the track happens to measure, which is the whole reason it is written this way.
    // The body is matched up to its closing brace, so the `@keyframes badge-pulse` later
    // in the file cannot satisfy a search for a `translateX` it happens to share.
    const body = CSS.match(/@keyframes marquee-scroll\s*\{([\s\S]*?)\n\}/)[1]
    expect(body).toContain('translateX(-100vw)')
    expect(body).not.toContain('-50%')
  })
})

describe('the field and the marquee are independent budgets', () => {
  it('keeps the field seed intact alongside the marquee change', () => {
    // Guard against the two features' budgets being conflated: the field's 9 216 B
    // allowance measures SpiceField's own addition, and a change here must not silently
    // be charged against it or quietly add a piece.
    expect(PIECES).toHaveLength(34)
  })
})