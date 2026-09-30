import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'),
  'utf8',
)

describe('the drift keyframe', () => {
  it('exists', () => {
    expect(CSS).toContain('@keyframes drift')
  })

  it('reads per-piece amplitude from custom properties', () => {
    expect(CSS).toContain('--drift-x')
    expect(CSS).toContain('--drift-y')
    expect(CSS).toContain('--drift-r')
  })

  it('animates in the compositor-friendly properties only', () => {
    // Capture the keyframe's own braces. Any span-based slice is wrong here: the
    // stylesheet has `.reveal` rules that legitimately set `opacity` both in the base
    // rules and inside prefers-reduced-motion, so slicing from `@keyframes drift` to the
    // next @media — or to end-of-file — picks up an unrelated `opacity` and fails against
    // correct CSS. `from`/`to` nest one level, hence the inner brace alternative.
    const match = /@keyframes drift\s*\{(?:[^{}]|\{[^{}]*\})*\}/.exec(CSS)
    expect(match).not.toBeNull()
    const block = match[0]
    // opacity is static per piece by design; animating it on 20 elements repaints
    // every frame and drops frames on low-end mobile.
    expect(block).not.toContain('opacity')
    expect(block).not.toContain('filter')
  })

  it('runs infinitely and alternately, so a piece returns to its origin', () => {
    expect(CSS).toMatch(/\.animate-drift\s*\{[^}]*infinite alternate/)
  })

  it('is disabled under prefers-reduced-motion', () => {
    const media = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(media).toContain('.animate-drift')
  })

  it('promotes nothing to its own layer', () => {
    expect(CSS).not.toContain('will-change')
  })
})
