import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSS = readFileSync(join(SRC, 'index.css'), 'utf8')

// Tailwind compiles a utility class written in JSX into `filter:` or `will-change:` in the
// *built* stylesheet, so scanning src/index.css cannot see one — the text that produced it
// is not in this file at all. A `blur-[1px]` on a piece repaints it every frame exactly like
// the CSS this file already guards against, and emits no `filter` substring to match.
// Scoped to the three files the field feature touched: a whole-tree scan is not available,
// because ContactButtons and WhatsAppFab carry a pre-existing `hover:brightness-95`, itself
// a filter utility, and that predates the field and is none of its business.
const FEATURE_JSX = ['App.jsx', 'components/SpiceField.jsx', 'components/SpiceMotif.jsx'].map(
  (rel) => [rel, readFileSync(join(SRC, rel), 'utf8')],
)

// Matched as class-name families rather than as the emitted property names, because these
// are the spellings that compile to `filter:` and `will-change:`. The separator alternation
// matters: an arbitrary value arrives as `blur-[1px]`, so requiring a word character after
// the dash would miss the very case this guard exists for, and several of these utilities
// are bare (`grayscale`, `invert`) with no dash at all. A comment that happened to contain
// one of these words would fail this — loudly, and fixed by rewording, which is the right
// way round compared with a utility slipping through unnoticed.
const WILL_CHANGE_UTILITY = /\bwill-change\b/
const FILTER_UTILITY =
  /\bfilter\b|\b(?:blur|backdrop-blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia)(?:-|\b)/

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
    for (const [name, source] of FEATURE_JSX) {
      expect(source, name).not.toMatch(WILL_CHANGE_UTILITY)
    }
  })

  it('filters nothing anywhere in the feature', () => {
    // The keyframe guard above only covers the keyframe. `filter` outside it — on
    // .animate-drift, say — would repaint every frame just the same.
    expect(CSS).not.toContain('filter')
    for (const [name, source] of FEATURE_JSX) {
      expect(source, name).not.toMatch(FILTER_UTILITY)
    }
  })
})
