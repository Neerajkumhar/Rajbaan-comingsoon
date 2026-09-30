import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { SpiceField } from '../components/SpiceField.jsx'
import { PIECES, MOTIFS, TONES, WIDE_QUERY } from '../components/SpiceField.jsx'

// The shared setup stubs matchMedia to match nothing, which would render the narrow
// field and quietly hold every count in this file to 18. Default to the wide viewport —
// the state that renders the whole seed — and let the narrow tests ask for their own.
function setWideViewport(isWide) {
  window.matchMedia = (query) => ({
    matches: query === WIDE_QUERY && isWide,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })
}

beforeEach(() => {
  setWideViewport(true)
})

function renderField() {
  const { container } = render(<SpiceField />)
  return {
    layer: container.firstChild,
    svgs: container.querySelectorAll('svg'),
    pieces: container.querySelectorAll('svg.animate-drift'),
  }
}

describe('SpiceField', () => {
  it('renders exactly the 34 seeded pieces', () => {
    const { pieces } = renderField()
    expect(PIECES).toHaveLength(34)
    expect(pieces).toHaveLength(PIECES.length)
  })

  it('hides the whole layer from assistive technology', () => {
    // A decorative field read aloud is a real accessibility failure, and no other
    // test in the suite would catch it.
    const { layer } = renderField()
    expect(layer).toHaveAttribute('aria-hidden', 'true')
  })

  it('never intercepts a click', () => {
    const { layer } = renderField()
    expect(layer).toHaveAttribute('class')
    expect(layer.className).toContain('pointer-events-none')
    // z-0 is what keeps the field decorative. Raise it — to z-20 to stack it above the
    // lifted main, or to z-[60] because the motifs read faintly — and the field paints
    // over the whole page, content included, while every other test in the suite stays
    // green: nothing else measures this layer against the content. inset-0 and fixed
    // ride with it because a z-index only orders a box that actually covers the viewport.
    expect(layer.className).toContain('z-0')
    expect(layer.className).toContain('inset-0')
    expect(layer.className).toContain('fixed')
  })

  it('clips its own pieces inside the layer', () => {
    const { layer } = renderField()
    expect(layer.className).toContain('overflow-hidden')
  })

  it('resolves every seeded motif to a real component', () => {
    // A typo'd motif key would make Motif undefined and React would throw. Assert the
    // lookup directly so the failure names the key instead of just "Element type is
    // invalid".
    for (const piece of PIECES) {
      expect(MOTIFS[piece.motif], `unknown motif "${piece.motif}"`).toBeTypeOf('function')
    }
  })

  it('uses only the four palette tones', () => {
    const tones = [...new Set(PIECES.map((piece) => piece.tone))]
    expect([...tones].sort()).toEqual(['ink', 'marigold', 'maroon', 'turmeric'])
    // Pin the class names as literals rather than deriving them from the tone name, which
    // is what the producer does and what this assertion must not assume. A misspelling —
    // `text-margold` — yields a class in no stylesheet, and the pieces then render in the
    // inherited body colour. Any check that read the map back would watch both sides move
    // together and stay green. Tailwind emits these utilities from the @theme tokens at
    // build time, so `src/index.css` cannot be scanned for them; the emitted name is as
    // far as this suite can reach, and the build is what turns it into a rule.
    expect(TONES).toEqual({
      ink: 'text-ink',
      marigold: 'text-marigold',
      maroon: 'text-maroon',
      turmeric: 'text-turmeric',
    })
  })

  it('carries every seeded value onto the DOM', () => {
    // This is the seam the rest of the file cannot reach. Every other test here reads the
    // `PIECES` literal, which is the seed's own description of itself: delete `left` and
    // `top` from the style object, or the three `--drift-*` properties, or misspell a tone
    // class, and the field breaks on the page while the suite stays green. The keyframe's
    // `var(--drift-x, 8px)` fallbacks are in range by design, so a piece that never
    // receives its amplitude drifts in lockstep with every other piece rather than
    // failing anything. This test reads the rendered element instead, which is the only
    // place a dropped style is observable.
    const { pieces } = renderField()
    PIECES.forEach((piece, i) => {
      const el = pieces[i]
      expect(el.style.left).toBe(`${piece.x}%`)
      expect(el.style.top).toBe(`${piece.y}%`)
      expect(el.style.rotate).toBe(`${piece.rotate}deg`)
      expect(el.style.animationDuration).toBe(`${piece.duration}s`)
      expect(el.style.animationDelay).toBe(`${piece.delay}s`)
      expect(el.style.getPropertyValue('--drift-x')).toBe(piece.driftX)
      expect(el.style.getPropertyValue('--drift-y')).toBe(piece.driftY)
      expect(el.style.getPropertyValue('--drift-r')).toBe(piece.driftR)
      // `className` on an <svg> is an SVGAnimatedString, not a string, so `baseVal` is
      // the property that actually holds the class list here.
      expect(el.className.baseVal).toContain(TONES[piece.tone])
    })
  })

  it('sizes each piece inline and carries base rotation on `rotate`, not `transform`', () => {
    // base carries className 'h-12 w-12'; passing className replaces it wholesale
    // rather than merging, so the inline width and height are the only sizing.
    // Read them off the style object rather than as attributes: `toHaveAttribute`
    // would ask for the SVG geometry attribute, which React never derives from an
    // inline width, so that assertion could only fail however the piece is sized.
    // The `rotate` half is the load-bearing part: the drift keyframe animates
    // `transform`, and CSS applies `rotate` before `transform`, so the base tilt
    // composes with the drift. Moving the base rotation onto `transform` would let
    // the keyframe overwrite it on every frame, and nothing else would notice.
    const { pieces } = renderField()
    for (const svg of pieces) {
      expect(svg.style.width).not.toBe('')
      expect(svg.style.height).not.toBe('')
      expect(svg.style.rotate).not.toBe('')
      expect(svg.style.transform).toBe('')
    }
  })

  it('keeps every opacity static and inside the legible band', () => {
    for (const piece of PIECES) {
      expect(piece.opacity).toBeGreaterThanOrEqual(0.1)
      expect(piece.opacity).toBeLessThanOrEqual(0.18)
    }
    const { pieces } = renderField()
    for (const svg of pieces) {
      expect(svg.style.animationName).toBe('')
    }
    // React renders PIECES in order, so index i addresses the same piece on both
    // sides. Asserting the seeded value rather than mere presence is what makes a
    // swapped or scaled opacity fail here instead of surviving as a subtle drift.
    PIECES.forEach((piece, i) => {
      expect(pieces[i].style.opacity).toBe(String(piece.opacity))
      expect(pieces[i].style.width).toBe(`${piece.size}px`)
    })
  })

  it('varies the drift instead of moving every piece in lockstep', () => {
    const durations = new Set(PIECES.map((piece) => piece.duration))
    const delays = new Set(PIECES.map((piece) => piece.delay))
    expect(durations.size).toBeGreaterThan(8)
    expect(delays.size).toBeGreaterThan(8)
  })

  it('keeps every piece inside the viewport', () => {
    for (const piece of PIECES) {
      expect(piece.x).toBeGreaterThanOrEqual(0)
      expect(piece.x).toBeLessThanOrEqual(100)
      expect(piece.y).toBeGreaterThanOrEqual(0)
      expect(piece.y).toBeLessThanOrEqual(100)
    }
  })

  it('keeps drift amplitude, duration and rotation in the specified range', () => {
    // Every seeded entry, so the sixteen added with the responsive count are held to the
    // same bands as the original twenty. `rotate` and `size` are checked here because
    // this is the seed's range test; a piece outside either band is as much a departure
    // as a drift amplitude of 2px. `delay` must stay negative so a piece starts
    // mid-cycle rather than sitting at its origin until the first keyframe tick.
    for (const piece of PIECES) {
      expect(piece.size).toBeGreaterThanOrEqual(30)
      expect(piece.size).toBeLessThanOrEqual(54)
      expect(piece.rotate).toBeGreaterThanOrEqual(-30)
      expect(piece.rotate).toBeLessThanOrEqual(30)
      expect(Math.abs(parseFloat(piece.driftX))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftX))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftY))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftY))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftR))).toBeGreaterThanOrEqual(1)
      expect(Math.abs(parseFloat(piece.driftR))).toBeLessThanOrEqual(3)
      expect(piece.duration).toBeGreaterThanOrEqual(20)
      expect(piece.duration).toBeLessThanOrEqual(40)
      expect(piece.delay).toBeLessThan(0)
    }
  })

  it('marks every piece with one of the two viewport widths', () => {
    // Only these two values exist, so `minWidth` can be compared with === and a typo
    // cannot pass as "visible everywhere" — a piece carrying minWidth: 700 would never
    // render at any width if the narrow set were selected by that comparison.
    for (const piece of PIECES) {
      expect([0, 768]).toContain(piece.minWidth)
    }
  })

  it('reserves 16 pieces for the wide field and leaves 18 for the narrow one', () => {
    // Both counts are the contract, so both are pinned: a seed that quietly grew a
    // seventeenth desktop-only piece would render 19 on a phone, and no rendering
    // assertion below would notice.
    const hidden = PIECES.filter((piece) => piece.minWidth === 768)
    const shown = PIECES.filter((piece) => piece.minWidth === 0)
    expect(hidden).toHaveLength(16)
    expect(shown).toHaveLength(18)
    expect(hidden.length + shown.length).toBe(PIECES.length)
  })

  it('breaks at the width the spec names', () => {
    // The stub above decides `matches` with this same constant, so the two cannot drift
    // apart and a breakpoint edit would be invisible: '(min-width: 1024px)' passes every
    // other test in this file while silently changing which eighteen motifs every phone
    // visitor sees. The specs name 768, so it is asserted here rather than shared.
    expect(WIDE_QUERY).toBe('(min-width: 768px)')
  })

  it('renders every seeded piece at a wide viewport', () => {
    const { svgs } = renderField()
    expect(svgs).toHaveLength(34)
  })

  it('renders only the 18 narrow pieces below the breakpoint', () => {
    setWideViewport(false)
    const { svgs } = renderField()
    expect(svgs).toHaveLength(18)
  })

  it('selects the narrow pieces by their minWidth, not by truncating the seed', () => {
    // The count alone cannot tell selection from truncation: dropping the last 18
    // entries renders 18 pieces too, and would silently un-pin every motif, tone and
    // placement the wide field depends on. Compare positions, so the wide-only pieces
    // have to be the exact ones that disappear.
    setWideViewport(false)
    const { pieces } = renderField()
    const narrow = PIECES.filter((piece) => piece.minWidth === 0)
    expect(pieces).toHaveLength(narrow.length)
    expect([...pieces].map((el) => `${el.style.left}/${el.style.top}`)).toEqual(
      narrow.map((piece) => `${piece.x}%/${piece.y}%`),
    )
    for (const piece of PIECES) {
      if (piece.minWidth === 0) continue
      // Both coordinates, not `left` alone: two seeded pieces share an x (26 is taken
      // twice), so a single-coordinate check would report a surviving wide-only piece.
      const stillThere = [...pieces].some(
        (el) => el.style.left === `${piece.x}%` && el.style.top === `${piece.y}%`,
      )
      expect(stillThere).toBe(false)
    }
  })

  it('gives the narrow field more motif than the twenty pieces it replaced', () => {
    // The phone set is picked for area rather than being whatever the desktop-only
    // entries leave behind, so that choice is asserted rather than left to the seed. An
    // earlier version simply hid the two largest pieces and lost 17% of the phone's
    // motif area, which no count assertion would have caught.
    const narrow = PIECES.filter((piece) => piece.minWidth === 0)
    const narrowArea = narrow.reduce((total, piece) => total + piece.size * piece.size, 0)
    expect(narrowArea).toBeGreaterThan(29_760)
    // Clearance is checked against the sizes, not by rendering: two pieces overlapping on
    // a 390x844 screen is the failure mode area optimisation invites, and jsdom has no
    // layout to notice it.
    const overlaps = []
    for (const [i, a] of narrow.entries()) {
      for (const b of narrow.slice(i + 1)) {
        const dx = (Math.abs(a.x - b.x) / 100) * 390
        const dy = (Math.abs(a.y - b.y) / 100) * 844
        const gap = Math.hypot(dx, dy) - ((a.size + b.size) / 2) * Math.SQRT2
        if (gap < 0) overlaps.push(`${a.motif}(${a.x},${a.y})/${b.motif}(${b.x},${b.y})`)
      }
    }
    expect(overlaps).toEqual([])
  })
})

describe('the field in the page', () => {
  it('mounts the field as a sibling above the content stack', () => {
    const { container } = render(<App />)
    const layer = container.querySelector('div[aria-hidden="true"].pointer-events-none')
    expect(layer).not.toBeNull()
    // LanguageProvider renders no DOM wrapper, so the container is the field's real
    // parent. The field must be a sibling of main, not a child of it: a child would
    // break the section-order assertion in App.test.jsx and would clip against main's
    // own stacking context.
    expect(layer.parentElement).toBe(container)
  })

  it('lifts main above the field', () => {
    const { container } = render(<App />)
    const main = container.querySelector('main')
    expect(main.className).toContain('relative')
    expect(main.className).toContain('z-10')
  })

  it('lifts the footer above the field', () => {
    // The footer is an opaque dark band. Left static, pieces would drift across it.
    const { container } = render(<App />)
    const footer = container.querySelector('footer')
    expect(footer.className).toContain('relative')
    expect(footer.className).toContain('z-10')
  })
})
