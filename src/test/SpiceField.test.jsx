import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { SpiceField } from '../components/SpiceField.jsx'
import { PIECES, MOTIFS } from '../components/SpiceField.jsx'

function renderField() {
  const { container } = render(<SpiceField />)
  return { layer: container.firstChild, pieces: container.querySelectorAll('svg.animate-drift') }
}

describe('SpiceField', () => {
  it('renders exactly the 20 seeded pieces', () => {
    const { pieces } = renderField()
    expect(PIECES).toHaveLength(20)
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

  it('uses only palette tones that exist in the stylesheet', () => {
    const tones = [...new Set(PIECES.map((piece) => piece.tone))]
    expect([...tones].sort()).toEqual(['ink', 'marigold', 'maroon', 'turmeric'])
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
    for (const piece of PIECES) {
      expect(Math.abs(parseFloat(piece.driftX))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftX))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftY))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftY))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftR))).toBeGreaterThanOrEqual(1)
      expect(Math.abs(parseFloat(piece.driftR))).toBeLessThanOrEqual(3)
      expect(piece.duration).toBeGreaterThanOrEqual(20)
      expect(piece.duration).toBeLessThanOrEqual(40)
    }
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
