import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { content } from '../content.js'
import { LanguageProvider } from '../LanguageContext.jsx'
import { Marquee } from '../components/Marquee.jsx'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSS = readFileSync(join(SRC, 'index.css'), 'utf8')

// jsdom reports every element as 0x0 and has no layout, so a copy cannot be measured here.
// This stands in for one: nine names at the real rendering are 957px wide, and the width
// matters because the copy count is derived from it. Tests that care set this; the rest
// leave it at 0 and exercise the unmeasured fallback.

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

// `viewport` is passed rather than held in module state, so one test's stub cannot leak
// into the next: `stubGlobal` is undone by `restoreAllMocks` and the count is recomputed
// from whatever viewport each case declares.
function stubLayout(copyWidth, viewport) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
    return this.className.includes('w-max')
      ? { width: copyWidth, height: 0, top: 0, left: 0, right: copyWidth, bottom: 0 }
      : { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
  })
  vi.stubGlobal('innerWidth', viewport)
}

describe('Marquee', () => {
  it('makes each copy as wide as its own names, with no blank space at its end', () => {
    const { container } = renderMarquee()
    for (const copy of copies(container)) {
      // `w-max`, not `w-screen`. Forcing a copy to one viewport width left the 421px that
      // nine names did not fill at the end of every copy, so the seam was a hole rather
      // than a continuation, and no gap outside the track was visible to warn of it.
      expect(copy.className).toContain('w-max')
      expect(copy.className).not.toMatch(/w-screen|min-w-screen/)
      // shrink-0 holds that width against the track's flex layout.
      expect(copy.className).toContain('shrink-0')
    }
  })

  it('lays the spacing inside each item, so every copy is identical in width', () => {
    const { container } = renderMarquee()
    const reference = itemsIn(container, copies(container)[0])[0].className

    // The loop travels one copy, which is only meaningful if all copies are the same width.
    // A flex `gap` between items would break that: N items produce N-1 gaps, so a fraction
    // of the track is not a copy. Per-item padding keeps them equal, and the last item must
    // carry trailing padding like every other one.
    for (const copy of copies(container)) {
      for (const item of itemsIn(container, copy)) {
        expect(item.className).toBe(reference)
      }
      expect(itemsIn(container, copy).at(-1).className).toContain('pr-8')
    }
  })

  it('hides the decorative band from assistive technology', () => {
    const { container } = renderMarquee()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('copy count and loop distance', () => {
  it('covers two screens at every viewport, since the loop travels one copy', () => {
    stubLayout()
    // The band has to hold enough copies that one is always entering while one leaves. A
    // fixed count cannot: nine names are 957px whether the screen is 390px or 2560px, so
    // three copies gapped by 646px on a large monitor and more on a wider one.
    for (const [copyWidth, viewport, expected] of [
      [957, 390, 2],
      [957, 1440, 4],
      [957, 2560, 6],
      [957, 3840, 9],
    ]) {
      stubLayout(copyWidth, viewport)
      const { container, unmount } = renderMarquee()
      const track = container.querySelector('.animate-marquee')
      const total = copies(container).length * copyWidth

      expect(copies(container).length).toBe(expected)
      expect(total).toBeGreaterThanOrEqual(viewport * 2)
      // And the distance handed to the keyframe is one copy, not the whole track. Both
      // widths are pinned because a distance of `copyWidth * copies` leaves the assertions
      // above intact — they only count copies — while the band travels a full track and so
      // restarts a third of a cycle early. Reading the value, not deriving it from the
      // count, is what catches that.
      expect(track.style.getPropertyValue('--marquee-distance')).toBe(`${copyWidth}px`)
      unmount()
    }
    vi.restoreAllMocks()
  })

  it('re-measures when the viewport changes, not only when the copy does', () => {
    stubLayout(957, 390)
    const { container, unmount } = renderMarquee()
    expect(copies(container).length).toBe(2)

    // A ResizeObserver on the copy alone is not enough. The copy's own box does not change
    // when the window does — it is as wide as its nine names either way — so the band
    // stays at two copies on a 2560px screen and ends in 646px of blank maroon. Verified in
    // a browser: this assertion fails without the resize listener and passes with it.
    // act(), because the listener sets state and React must flush the re-render before the
    // DOM can be read. Without it the assertion sees the pre-resize markup and fails for a
    // reason that has nothing to do with the behaviour under test.
    act(() => {
      window.innerWidth = 2560
      window.dispatchEvent(new Event('resize'))
    })
    expect(copies(container).length).toBe(6)

    // And back down again, so a narrow window does not keep a wide window's count.
    act(() => {
      window.innerWidth = 390
      window.dispatchEvent(new Event('resize'))
    })
    expect(copies(container).length).toBe(2)
    unmount()
    vi.restoreAllMocks()
  })

  it('never repeats fewer than two copies, whatever the measurement says', () => {
    stubLayout()
    // One copy leaves nothing behind it to scroll into. A copy wider than a whole screen
    // still needs a second, or the band empties the moment it starts moving.
    stubLayout(5000, 390)
    const { container } = renderMarquee()
    expect(copies(container).length).toBeGreaterThanOrEqual(2)
    vi.restoreAllMocks()
  })

  it('renders a whole list in every copy it does render', () => {
    stubLayout(957, 1440)
    const { container } = renderMarquee()
    for (const copy of copies(container)) {
      expect(itemsIn(container, copy)).toHaveLength(content.en.marquee.length)
    }
    vi.restoreAllMocks()
  })
})

describe('the marquee keyframe', () => {
  // The body is matched up to its closing brace, so a later keyframe sharing a property
  // cannot satisfy a search for a transform it happens to have.
  const body = CSS.match(/@keyframes marquee-scroll\s*\{([\s\S]*?)\n\}/)[1]

  it('travels the measured distance, not a share of the track or the viewport', () => {
    // Each CSS-only distance has failed here for a different reason: -50% needed a track
    // twice the viewport, -100vw needed a copy exactly one viewport wide, and a fixed
    // pixel distance cannot track a copy whose width depends on the text.
    expect(body).toContain('translateX(var(--marquee-distance')
    expect(body).not.toMatch(/translateX\(-(33|50|100)%/)
    expect(body).not.toContain('translateX(-100vw)')
  })

  it('still moves before the measurement lands, rather than showing a frozen band', () => {
    // The fallback has to be a real distance. `var(--marquee-distance)` alone would resolve
    // to nothing on first paint, leaving the band static until the observer fires.
    expect(body).toMatch(/translateX\(var\(--marquee-distance,\s*\d+px\)\)/)
  })

  it('runs at one speed and loops forever', () => {
    const rule = CSS.match(/\.animate-marquee\s*\{([^}]*)\}/)[1]
    expect(rule).toMatch(/animation:\s*marquee-scroll\s+\d+s\s+linear\s+infinite/)
    expect(rule).not.toMatch(/ease|bounce/)
  })
})

describe('the marquee under reduced motion', () => {
  it('stops rather than leaving the band frozen partway through its travel', () => {
    expect(CSS).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.animate-marquee[\s\S]*?animation:\s*none/,
    )
  })
})