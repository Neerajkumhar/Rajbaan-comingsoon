import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Cashew, Chilli, StarAnise } from '../components/SpiceMotif.jsx'

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
