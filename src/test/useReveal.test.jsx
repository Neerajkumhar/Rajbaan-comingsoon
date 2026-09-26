import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReveal } from '../hooks/useReveal.js'

function Probe() {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} data-testid="target" className={visible ? 'is-visible' : ''}>
      content
    </div>
  )
}

const originalObserver = globalThis.IntersectionObserver
const originalMatchMedia = window.matchMedia

function mockObserver() {
  const instances = []
  class FakeObserver {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
      this.disconnected = false
      instances.push(this)
    }
    observe() {}
    unobserve() {}
    disconnect() {
      this.disconnected = true
    }
  }
  globalThis.IntersectionObserver = FakeObserver
  return instances
}

function setReducedMotion(matches) {
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })
}

afterEach(() => {
  globalThis.IntersectionObserver = originalObserver
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
})

describe('useReveal', () => {
  it('starts hidden and becomes visible when the target intersects', () => {
    setReducedMotion(false)
    const instances = mockObserver()
    render(<Probe />)

    const target = screen.getByTestId('target')
    expect(target).not.toHaveClass('is-visible')
    expect(instances).toHaveLength(1)
    expect(instances[0].options.threshold).toBe(0.15)

    act(() => instances[0].callback([{ isIntersecting: true }]))
    expect(target).toHaveClass('is-visible')
  })

  it('stays hidden while the target has not intersected', () => {
    setReducedMotion(false)
    const instances = mockObserver()
    render(<Probe />)

    act(() => instances[0].callback([{ isIntersecting: false }]))
    expect(screen.getByTestId('target')).not.toHaveClass('is-visible')
  })

  it('disconnects after revealing so it cannot fire again', () => {
    setReducedMotion(false)
    const instances = mockObserver()
    render(<Probe />)

    act(() => instances[0].callback([{ isIntersecting: true }]))
    expect(instances[0].disconnected).toBe(true)
  })

  it('reveals immediately when reduced motion is requested', () => {
    setReducedMotion(true)
    const instances = mockObserver()
    render(<Probe />)

    expect(screen.getByTestId('target')).toHaveClass('is-visible')
    expect(instances).toHaveLength(0)
  })

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    setReducedMotion(false)
    globalThis.IntersectionObserver = undefined
    render(<Probe />)

    expect(screen.getByTestId('target')).toHaveClass('is-visible')
  })
})
