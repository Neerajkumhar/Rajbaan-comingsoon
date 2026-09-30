import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
  })

  it('clips its own pieces so nothing widens the document', () => {
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

  it('sizes each piece inline and never through a Tailwind class', () => {
    // base carries className 'h-12 w-12'; passing className replaces it wholesale
    // rather than merging, so the inline width and height are the only sizing.
    // Read them off the style object rather than as attributes: `toHaveAttribute`
    // would ask for the SVG geometry attribute, which React never derives from an
    // inline width, so that assertion could only fail however the piece is sized.
    const { pieces } = renderField()
    for (const svg of pieces) {
      expect(svg.style.width).not.toBe('')
      expect(svg.style.height).not.toBe('')
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
      expect(svg.style.opacity).not.toBe('')
    }
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
