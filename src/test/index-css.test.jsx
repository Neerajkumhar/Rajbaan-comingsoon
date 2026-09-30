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
    // Assert inside the keyframe, not against the whole file: a comment naming the three
    // properties would satisfy a whole-file toContain while the keyframe had baked
    // constants, collapsing one shared keyframe back into per-piece values.
    const match = /@keyframes drift\s*\{(?:[^{}]|\{[^{}]*\})*\}/.exec(CSS)
    expect(match).not.toBeNull()
    expect(match[0]).toMatch(/var\(--drift-x,\s*8px\)/)
    expect(match[0]).toMatch(/var\(--drift-y,\s*-6px\)/)
    expect(match[0]).toMatch(/var\(--drift-r,\s*3deg\)/)
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
    // Assert that .animate-drift is actually switched off, not merely named inside the
    // query. Checking for the name alone passes if the declaration is commented out, and
    // it cannot see `animation-duration: 0.01ms` — a widely copied reduced-motion idiom
    // that leaves a 20-element field animating. `[^{}]*` rather than `[\s\S]*?` so the name
    // and the declaration must share a single rule.
    const media = /@media \(prefers-reduced-motion: reduce\)\s*\{(?:[^{}]|\{[^{}]*\})*\}/.exec(CSS)
    expect(media).not.toBeNull()
    expect(media[0]).toMatch(/\.animate-drift[^{}]*\{\s*animation:\s*none\s*;/)
  })

  it('promotes nothing to its own layer', () => {
    expect(CSS).not.toContain('will-change')
  })

  it('filters nothing anywhere in the feature', () => {
    // The keyframe guard above only covers the keyframe. `filter` outside it — on
    // .animate-drift, say — would repaint every frame just the same.
    expect(CSS).not.toContain('filter')
  })
})
