import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Almond,
  BayLeaf,
  Cardamom,
  Cashew,
  Chilli,
  Cinnamon,
  Clove,
  Pepper,
  Raisin,
  StarAnise,
} from '../components/SpiceMotif.jsx'

function svgOf(element) {
  const { container } = render(element)
  return container.querySelector('svg')
}

describe('the solid motif variant', () => {
  it('leaves a motif unfilled by default', () => {
    expect(svgOf(<StarAnise />)).toHaveAttribute('fill', 'none')
  })

  it('fills a solid motif without dropping its stroke', () => {
    // The stroke must survive. Chilli's path is open, so a fill-only render would let
    // the fill auto-close across a straight line and cut the shape in half.
    const svg = svgOf(<Chilli solid />)
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('fill-opacity', '0.28')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('never forwards solid to the DOM', () => {
    // The guard is the props check: it reads the exact object handed to <svg>, so it
    // fails whenever `solid` survives the parameter list, whatever React does with the
    // attribute afterwards.
    expect(Cashew({ solid: true }).props).not.toHaveProperty('solid')

    // The rendered attribute alone cannot guard: React 19 drops an unknown boolean
    // attribute instead of writing it, so the <svg> has no `solid` either way. It still
    // catches a change that forwards solid as a string rather than a boolean.
    //
    // Forwarding as a boolean also makes React log "Received `true` for a non-boolean
    // attribute `solid`", but React dedupes that message per file, so this only bites on
    // whichever render triggers it first. Treat it as a signal, not the guard.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(svgOf(<Cashew solid />)).not.toHaveAttribute('solid')
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      consoleError.mockRestore()
    }
  })

  it('still lets a caller win on fill', () => {
    expect(svgOf(<Cashew solid fill="red" />)).toHaveAttribute('fill', 'red')
  })
})

const NEW_MOTIFS = { Almond, BayLeaf, Cardamom, Cinnamon, Clove, Pepper, Raisin }

describe('the masala and dry-fruit motifs', () => {
  it('exports all seven', () => {
    expect(Object.keys(NEW_MOTIFS)).toHaveLength(7)
  })

  it.each(Object.entries(NEW_MOTIFS))('draws %s on the shared viewBox', (name, Motif) => {
    const svg = svgOf(<Motif />)
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48')
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it.each(Object.entries(NEW_MOTIFS))('hides %s from assistive technology', (name, Motif) => {
    expect(svgOf(<Motif />)).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(Object.entries(NEW_MOTIFS))('gives %s some ink to draw', (name, Motif) => {
    expect(svgOf(<Motif />).children.length).toBeGreaterThan(0)
  })

  it('supports the solid variant on every new motif', () => {
    for (const Motif of Object.values(NEW_MOTIFS)) {
      expect(svgOf(<Motif solid />)).toHaveAttribute('fill', 'currentColor')
    }
  })

  it('never forwards solid to the DOM from any new motif', () => {
    // Task 1 established that checking the rendered attribute cannot guard this: React 19
    // drops an unknown boolean rather than writing it. Read the attribute object instead.
    for (const [name, Motif] of Object.entries(NEW_MOTIFS)) {
      expect(Motif({ solid: true }).props, name).not.toHaveProperty('solid')
    }
  })
})
