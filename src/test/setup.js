import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia, and this app asks one viewport question of it: `useReveal`
// asks for prefers-reduced-motion, `SpiceField` asks for min-width 768px. Without a
// stub both would throw on mount, which is why this lives in the shared setup rather
// than in one test file. Nothing matches here — a reduced-motion or narrow-viewport
// field is a specific arrangement, so a test that wants one installs its own and any
// test that does not is reading the widest, most-neutral state.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})