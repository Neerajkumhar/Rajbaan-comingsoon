import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
    // An unknown boolean attribute on an <svg> renders as solid="true" and warns.
    expect(svgOf(<Cashew solid />)).not.toHaveAttribute('solid')
  })

  it('still lets a caller win on fill', () => {
    expect(svgOf(<Cashew solid fill="red" />)).toHaveAttribute('fill', 'red')
  })
})
