# Rajbaan Coming Soon Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React "coming soon" site for the Rajbaan spices and dry-fruits brand that converts visitors into WhatsApp or phone enquiries on 9216487878.

**Architecture:** A static Vite + React 19 + Tailwind v4 single page with no router, no backend, and no runtime dependencies beyond React. All copy lives in one bilingual dictionary (`src/content.js`), all contact details in one constant module (`src/contact.js`), and the only application state is the active language in a React context that persists to `localStorage`. Each visual section is a prop-less component that reads those two modules directly, so sections are independent and order-independent.

**Tech Stack:** Vite 8.3.1, React 19.3.0, Tailwind CSS 4.3.3, Vitest 5.0.2, React Testing Library 16.3.3, ESLint 10.11.0, Node 24.19.0, Python 3 + Pillow for asset prep.

**Spec:** `docs/superpowers/specs/2026-09-26-rajbaan-coming-soon-design.md`

---

## Before you start: read this

**Commits are opt-in.** The plan's commit steps are written as if this folder were its
own git repository. It is not — `/home/tony/Desktop/Rajbaan` currently sits inside an
unrelated `/home/tony` repository. Do not run `git init` and do not run any commit step
until the user explicitly asks. Every commit step below is marked `[COMMIT — ask first]`.
Run every other step as written. If the user declines, the work still stands on its own;
nothing in the code depends on version control.

**Python needs Pillow.** Verify with `python3 -c "import PIL; print(PIL.__version__)"`.
If it fails, install it before Task 1.

## File structure

Files created, in dependency order. Nothing outside this list is touched.

| File | Responsibility |
| --- | --- |
| `package.json` | deps and the four npm scripts |
| `vite.config.js` | React + Tailwind plugins, Vitest `test` block |
| `eslint.config.js` | flat config, js recommended + react-hooks |
| `.gitignore` | node_modules, dist, coverage |
| `index.html` | meta, Open Graph, font preconnect, `#root` |
| `scripts/prepare-logo.py` | derives `public/logo.png` and `public/favicon.png` |
| `src/index.css` | Tailwind import, `@theme` tokens, keyframes, reduced-motion |
| `src/contact.js` | the phone number, derived WhatsApp and tel links |
| `src/content.js` | every EN and HI string, nested by section |
| `src/LanguageContext.jsx` | language state, persistence, `useLanguage` |
| `src/hooks/useReveal.js` | IntersectionObserver reveal-on-scroll |
| `src/components/SpiceMotif.jsx` | four named inline SVG exports |
| `src/components/ContactButtons.jsx` | the shared WhatsApp + call pair |
| `src/components/TopBar.jsx` | slim ink strip, brand signature, language toggle |
| `src/components/Hero.jsx` | logo card, wordmark, tagline, badge, CTAs |
| `src/components/Marquee.jsx` | scrolling Devanagari ticker |
| `src/components/Categories.jsx` | three product cards |
| `src/components/Trust.jsx` | four trust points |
| `src/components/Enquiry.jsx` | maroon conversion band |
| `src/components/Footer.jsx` | ink footer, text wordmark |
| `src/components/WhatsAppFab.jsx` | fixed bottom-right button |
| `src/App.jsx` | composes the sections in order |
| `src/main.jsx` | React root |
| `src/test/setup.js` | jest-dom matchers |
| `src/test/content.test.js` | EN/HI key parity |
| `src/test/contact.test.js` | link derivation from the one constant |
| `src/test/language.test.jsx` | toggle, persistence, corrupted-value recovery |
| `README.md` | run, build, deploy, logo swap, placeholder URLs |

## Task order and why

Tasks 1–3 are the toolchain and must pass before anything else can be verified. Task 4
produces the assets every later task references. Task 5 fixes the design tokens and
motion CSS. Tasks 6–8 are the two content modules plus the language context — the only
real logic, and the only things with tests. Tasks 9–16 are presentational sections that
depend on 5–8 but not on each other, so they could be parallelised by a subagent. Task
17 assembles the page; 18 is the final gate.

### Task 1: Toolchain — scaffold, deps, lint, test harness

**Files:**
- Create: `package.json`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `index.html`, `src/test/setup.js`

- [x] **Step 1: Create `package.json`**

```json
{
  "name": "rajbaan-coming-soon",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^19.3.0",
    "react-dom": "^19.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^10.11.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "globals": "^17.12.0",
    "jsdom": "^30.1.1",
    "tailwindcss": "^4.3.3",
    "vite": "^8.3.1",
    "vitest": "^5.0.2"
  }
}
```

- [x] **Step 2: Install and record the resolved versions**

Run: `npm install`
Expected: exits 0, creates `package-lock.json`. Peer warnings about
`oxc-transform-react` and `@rolldown/plugin-babel` are expected and harmless — both are
declared optional by `@vitejs/plugin-react`.

Run: `npm ls vite react tailwindcss vitest eslint --depth=0`
Expected: every package resolves to the versions in the table above with no `UNMET`.

- [x] **Step 3: Create `vite.config.js`**

`defineConfig` is imported from `vitest/config` rather than `vite` so a single file
configures both the dev server and the test runner. Vitest reads `vite.config.js` by
default; no second config file exists.

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

- [x] **Step 4: Create `eslint.config.js`**

The react-hooks rules are pulled from the plugin's own recommended config rather than
hard-coded rule names, so the rule set stays correct across plugin versions.

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },
    },
  },
]
```

`globals: true` is set in the Vitest config, so a test using bare `test()` runs fine at
runtime. Without this block ESLint would still flag it as undefined, so the lint config
mirrors the runner's globals. The project's own tests import from `vitest` explicitly
regardless.

- [x] **Step 5: Create `.gitignore`**

```
node_modules
dist
coverage
*.local
```

- [x] **Step 6: Create `index.html`**

`https://example.invalid/rajbaan` is a reserved non-resolving TLD used deliberately:
an unreplaced placeholder fails visibly instead of resolving to a stranger's site.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rajbaan — Pure Spices &amp; Dry Fruits | Coming Soon</title>
    <meta
      name="description"
      content="Rajbaan brings you hand-picked whole spices, ground masala and premium dry fruits. Launching soon — WhatsApp 9216487878 to enquire."
    />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="canonical" href="https://example.invalid/rajbaan" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Serif+Devanagari:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Rajbaan — Pure Spices &amp; Dry Fruits" />
    <meta
      property="og:description"
      content="Hand-picked whole spices, ground masala and premium dry fruits. Coming soon."
    />
    <meta property="og:url" content="https://example.invalid/rajbaan" />
    <meta property="og:image" content="https://example.invalid/rajbaan/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [x] **Step 7: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
```

- [x] **Step 8: Verify the harness runs before any source exists**

`src/main.jsx` does not exist yet, so the entry script 404s. Only the harness matters
here, and it is proven by a throwaway test that is deleted in the next step.

Run: `npm test`
Expected: FAIL, because no test files exist — Vitest exits non-zero with "No test files
found". This is the correct result and confirms the runner is wired up. If instead you
see a config or plugin resolution error, fix that before continuing.

- [x] **Step 9: Write a temporary smoke test to prove the runner executes**

Create `src/test/smoke.test.jsx` — the `.jsx`
extension is required, because `@vitejs/plugin-react` only transforms JSX in `.jsx`
files and a `.js` file containing JSX fails to parse:

```js
import { render, screen } from '@testing-library/react'

test('renders jsx in jsdom', () => {
  render(<p>Rajbaan</p>)
  expect(screen.getByText('Rajbaan')).toBeInTheDocument()
})
```

Run: `npm test`
Expected: PASS, 1 test.

Run: `npm run lint`
Expected: exits 0 with no output.

- [x] **Step 10: Delete the smoke test**

Run: `rm src/test/smoke.test.jsx`

The harness is proven; the smoke test has done its job and the real tests arrive in
Tasks 2 and 3.

- [ ] **Step 11: [COMMIT — ask first] Initial toolchain**

```bash
git add package.json package-lock.json vite.config.js eslint.config.js .gitignore index.html src/test/setup.js
git commit -m "chore: scaffold Vite + React + Tailwind + Vitest toolchain"
```
### Task 2: Contact and content modules (TDD)

`src/contact.js` is the single source of truth for the phone number. Nothing else in the
project may hard-code `9216487878`, including visible UI copy — the displayed digits and
the dialled digits come from the same constant, so they cannot drift apart.

**Files:**
- Create: `src/contact.js`, `src/content.js`, `src/test/contact.test.js`, `src/test/content.test.js`

- [x] **Step 1: Write the failing contact test**

Create `src/test/contact.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { PHONE_DIGITS, TEL_HREF, WHATSAPP_HREF, WHATSAPP_MESSAGE } from '../contact.js'

describe('contact links', () => {
  it('holds the number once, as 10 national digits', () => {
    expect(PHONE_DIGITS).toBe('9216487878')
  })

  it('builds a wa.me link in international form', () => {
    expect(WHATSAPP_HREF.startsWith('https://wa.me/919216487878?text=')).toBe(true)
  })

  it('url-encodes the prefilled message into the wa.me link', () => {
    expect(WHATSAPP_HREF).toContain(encodeURIComponent(WHATSAPP_MESSAGE))
    expect(WHATSAPP_HREF).not.toContain(' ')
  })

  it('builds a tel link in international form', () => {
    expect(TEL_HREF).toBe('tel:+919216487878')
  })
})
```

The `not.toContain(' ')` assertion is the one that actually matters: an unencoded space
in a `wa.me` href is silently truncated by some browsers, so the customer would open a
chat with no message.

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL with "Failed to resolve import ../contact.js" or "Cannot find module".

- [x] **Step 3: Write minimal `src/contact.js`**

```js
export const PHONE_DIGITS = '9216487878'

export const WHATSAPP_MESSAGE =
  'Namaste Rajbaan, mujhe aapke masale aur dry fruits ke baare mein jaanna hai.'

const INTERNATIONAL = `91${PHONE_DIGITS}`

export const WHATSAPP_HREF = `https://wa.me/${INTERNATIONAL}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`

export const TEL_HREF = `tel:+${INTERNATIONAL}`
```

- [x] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 4 tests in `contact.test.js`.

- [x] **Step 5: Write the failing content parity test**

This is the guard that stops a half-translated page shipping. It runs before the other
content assertions so a missing key fails with a clear message.

Create `src/test/content.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { content, LANGUAGES } from '../content.js'

function keysOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('content dictionary', () => {
  it('has exactly two locales', () => {
    expect(Object.keys(content).sort()).toEqual([...LANGUAGES].sort())
  })

  it('has the same keys in every locale', () => {
    const [reference, ...rest] = LANGUAGES
    const expected = keysOf(content[reference]).sort()
    for (const language of rest) {
      expect(keysOf(content[language]).sort()).toEqual(expected)
    }
  })

  it('has no empty strings', () => {
    for (const language of LANGUAGES) {
      for (const key of keysOf(content[language])) {
        const value = key
          .split('.')
          .reduce((node, part) => node[part], content[language])
        expect(String(value).trim(), `${language}.${key}`).not.toBe('')
      }
    }
  })
})
```

- [x] **Step 6: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL, "Failed to resolve import ../content.js".

- [x] **Step 7: Write `src/content.js`, English half first**

```js
export const LANGUAGES = ['en', 'hi']

export const content = {
  en: {
    topBar: { signature: 'Pure Spices • Whole & Hand-picked' },
    hero: {
      wordmarkLocal: 'राजबान',
      wordmarkLatin: 'RAJBAAN',
      tagline: 'Asli masale. Asli Swaad.',
      badge: 'Coming Soon',
      logoAlt: 'Rajbaan — spices and dry fruits',
    },
    marquee: ['हल्दी', 'मसाले', 'काजू', 'खजू', 'बादाम', 'अंजीर', 'इलायची', 'दालचीनी', 'सौंफ'],
    categories: {
      title: 'What is coming',
      items: [
        { title: 'Whole Spices', subtitle: 'साबुत मसाले', motif: 'starAnise' },
        { title: 'Ground Masala', subtitle: 'पिसा हुआ मसाला', motif: 'chilli' },
        { title: 'Premium Dry Fruits', subtitle: 'प्रीमियम सूखा मेवा', motif: 'cashew' },
      ],
    },
    trust: {
      title: 'Why Rajbaan',
      items: [
        { title: '100% Pure', body: 'No fillers, no starch, no adulteration.' },
        { title: 'No Adulteration', body: 'Nothing mixed in that should not be.' },
        { title: 'Hand-picked', body: 'Sorted by hand, batch by batch.' },
        { title: 'Packed Fresh', body: 'Sealed close to the roaster.' },
      ],
    },
    enquiry: {
      headline: 'Order karo pehle se? Apni list bhej dijiye.',
      note: 'We are packing our first lot. Enquire now and we will keep you first in line.',
    },
    footer: {
      descriptor: 'Whole spices, ground masala & premium dry fruits',
      madeIn: 'Made in India',
      rights: '© 2026 Rajbaan',
    },
    buttons: {
      whatsapp: 'WhatsApp us',
      call: 'Call',
      whatsappAria: 'Enquire on WhatsApp',
    },
  },
  // hi half follows in Step 8
}
```

`hero.wordmarkLocal` and `hero.wordmarkLatin` are the one exception to the rule that
copy follows the language: the wordmark is a brand lockup and renders both scripts
regardless of the active locale, per spec 4.2. `marquee` is Devanagari in both locales
because the ticker is a decorative brand signature, and it is `aria-hidden`.

- [x] **Step 8: Add the Hindi half**

Inside the same `content` object, after the `en` block, add:

```js
  hi: {
    topBar: { signature: 'शुद्ध मसाले • शुद्ध साबुत' },
    hero: {
      wordmarkLocal: 'राजबान',
      wordmarkLatin: 'RAJBAAN',
      tagline: 'असली मसाला। असली स्वाद।',
      badge: 'जल्द आ रहा है',
      logoAlt: 'राजबान — मसाले और सूखा मेवा',
    },
    marquee: ['हल्दी', 'मसाले', 'काजू', 'खजू', 'बादाम', 'अंजीर', 'इलायची', 'दालचीनी', 'सौंफ'],
    categories: {
      title: 'क्या आ रहा है',
      items: [
        { title: 'साबुत मसाले', subtitle: 'Whole Spices', motif: 'starAnise' },
        { title: 'पिसा हुआ मसाला', subtitle: 'Ground Masala', motif: 'chilli' },
        { title: 'प्रीमियम सूखा मेवा', subtitle: 'Premium Dry Fruits', motif: 'cashew' },
      ],
    },
    trust: {
      title: 'राजबान क्यों',
      items: [
        { title: '100% शुद्ध', body: 'कोई मिलावट नहीं, कोई स्टार्च नहीं।' },
        { title: 'बिना मिलावट', body: 'जो नहीं मिलना चाहिए, वो नहीं मिलाया जाता।' },
        { title: 'हाथ से चुना', body: 'हर बैच को हाथ से छाँटा जाता है।' },
        { title: 'ताज़ा पैकिंग', body: 'भुनने के बाद ही सीलबंद।' },
      ],
    },
    enquiry: {
      headline: 'पहले से ऑर्डर करना है? अपनी लिस्ट भेज दीजिए।',
      note: 'हमारा पहला लॉट तैयार हो रहा है। अभी पूछें, आप पहले मिलेंगे।',
    },
    footer: {
      descriptor: 'साबुत मसाले, पिसा मसाला और प्रीमियम सूखा मेवा',
      madeIn: 'भारत में बना',
      rights: '© 2026 राजबान',
    },
    buttons: {
      whatsapp: 'व्हाट्सएप करें',
      call: 'कॉल करें',
      whatsappAria: 'व्हाट्सएप पर पूछताछ करें',
    },
  },
```

The key order in `hi` mirrors `en` exactly. The parity test compares sorted key lists,
so order is not enforced, but matching order makes the file readable side by side.

- [x] **Step 9: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 7 tests total (4 contact, 3 content).

- [x] **Step 10: Run lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 11: [COMMIT — ask first] Contact and content modules**

```bash
git add src/contact.js src/content.js src/test/contact.test.js src/test/content.test.js
git commit -m "feat(content): bilingual dictionary and single-source contact links"
```
### Task 3: Language context (TDD)

The only application state in the project. A provider, a `useLanguage` hook, and a `t`
lookup that returns the active locale's sub-object. Persisted to `localStorage` under a
versioned key.

**Files:**
- Create: `src/LanguageContext.jsx`, `src/test/language.test.jsx`

- [x] **Step 1: Write the failing language test**

Create `src/test/language.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageProvider, useLanguage } from '../LanguageContext.jsx'

function Probe() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div>
      <p data-testid="language">{language}</p>
      <p data-testid="badge">{t('hero.badge')}</p>
      <p data-testid="tagline">{t('hero.tagline')}</p>
      <button onClick={() => setLanguage('hi')}>hindi</button>
    </div>
  )
}

const STORAGE_KEY = 'rajbaan.lang.v1'

function renderProbe() {
  return render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('LanguageContext', () => {
  it('defaults to English on a first visit', () => {
    renderProbe()
    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('badge')).toHaveTextContent('Coming Soon')
  })

  it('swaps visible copy when the language changes', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'hindi' }))
    expect(screen.getByTestId('language')).toHaveTextContent('hi')
    expect(screen.getByTestId('badge')).toHaveTextContent('जल्द आ रहा है')
    expect(screen.getByTestId('tagline')).toHaveTextContent('असली मसाला')
  })

  it('persists the choice to localStorage', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'hindi' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('hi')
  })

  it('restores a persisted choice on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'hi')
    renderProbe()
    expect(screen.getByTestId('language')).toHaveTextContent('hi')
  })

  it('falls back to English when the stored value is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, 'klingon')
    renderProbe()
    expect(screen.getByTestId('language')).toHaveTextContent('en')
  })
})
```

The corrupt-value case is not hypothetical: `localStorage` is user-writable, survives
deploys, and a bad value must not white-screen the only page the business has.

Clicks go through RTL's `fireEvent`, not a raw `element.click()`. `fireEvent` is
act-wrapped, so React flushes the state update before the next assertion; a bare DOM
click does not, and the re-render assertion fails against correct code.

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL, "Failed to resolve import ../LanguageContext.jsx".

- [x] **Step 3: Write `src/LanguageContext.jsx`**

```jsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LANGUAGES, content } from './content.js'

const STORAGE_KEY = 'rajbaan.lang.v1'
const DEFAULT_LANGUAGE = 'en'

const LanguageContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage)

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-mode storage denial must not break language switching.
    }
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => key.split('.').reduce((node, part) => node?.[part], content[language]),
    }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
```

The `try/catch` around storage covers Safari private mode, where `localStorage` exists
but writes throw. `LANGUAGES.includes` is the same guard the test asserts, so an
unexpected value is ignored rather than stored.

- [x] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 13 tests total.

- [x] **Step 5: Run lint**

Run: `npm run lint`
Expected: exits 0, no output. `react-hooks/exhaustive-deps` is satisfied because
`setLanguage` is a `useCallback` with an empty dep list and `t` closes over `language`,
which is the only value it reads.

- [ ] **Step 6: [COMMIT — ask first] Language context**

```bash
git add src/LanguageContext.jsx src/test/language.test.jsx
git commit -m "feat(i18n): language context with versioned localStorage persistence"
```
### Task 4: Logo asset preparation

The source is 1774×887, 549 KB, with ink touching all four edges (measured in spec 7.4).
Two derived assets, no transparency and no recolouring.

**Files:**
- Create: `scripts/prepare-logo.py`, `public/logo.png`, `public/favicon.png`
- Read only: `logo rajbaan.png`

- [x] **Step 1: Verify Pillow is available**

Run: `python3 -c "import PIL; print(PIL.__version__)"`
Expected: prints a version. If it raises `ModuleNotFoundError`, run
`python3 -m pip install --user Pillow` and re-run.

- [x] **Step 2: Create `scripts/prepare-logo.py`**

The mark is never inverted or recoloured. The favicon is composed on a white square
rather than centre-cropped, because a square crop of a 2:1 mark spanning the full canvas
width would discard the outer thirds.

```python
"""Derive web assets from the Rajbaan logo. Idempotent; safe to re-run."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "logo rajbaan.png"
PUBLIC = ROOT / "public"

LOGO_WIDTH = 1200
FAVICON_SIZE = 512
FAVICON_MARGIN = 0.1
PALETTE_COLOURS = 256


def load_source():
    """Open the master artwork as opaque RGB, discarding any alpha channel."""
    with Image.open(SOURCE) as source:
        return source.convert("RGB")


def save_web(image, path: Path) -> None:
    """Write a 256-colour palette PNG, dithering off.

    The artwork is black line art on white, so 256 palette entries are effectively
    unlimited for it: measured against the full-colour resize, quantisation moves the
    mean pixel by 0.53/255 and no pixel by more than 24/255, which is below the
    threshold where banding becomes visible. That takes the logo from 273 KB to 17 KB.
    """
    quantized = image.quantize(
        colors=PALETTE_COLOURS,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    )
    quantized.save(path, optimize=True)


def build_logo() -> None:
    image = load_source()
    height = round(image.height * LOGO_WIDTH / image.width)
    save_web(image.resize((LOGO_WIDTH, height), Image.LANCZOS), PUBLIC / "logo.png")


def build_favicon() -> None:
    image = load_source()
    fit = round(FAVICON_SIZE * (1 - 2 * FAVICON_MARGIN))
    scale = fit / image.width
    mark = image.resize((fit, round(image.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGB", (FAVICON_SIZE, FAVICON_SIZE), "white")
    canvas.paste(mark, ((FAVICON_SIZE - fit) // 2, (FAVICON_SIZE - mark.height) // 2))
    save_web(canvas, PUBLIC / "favicon.png")


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    build_logo()
    build_favicon()
    for name in ("logo.png", "favicon.png"):
        path = PUBLIC / name
        with Image.open(path) as image:
            print(f"{name}: {image.width}x{image.height}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
```

`convert("RGB")` discards any alpha channel, guaranteeing the shipped assets are opaque
white-grounded images exactly like the source.

- [x] **Step 3: Run the script**

Run: `python3 scripts/prepare-logo.py`
Expected:

```
logo.png: 1200x600  NN KB
favicon.png: 512x512  NN KB
```

The exact logo height follows from the source's real aspect ratio, not the nominal 2:1,
so read the printed value rather than assuming. Both files must be under 200 KB —
expect roughly 17 KB and 5 KB.

- [x] **Step 4: Verify the source was not modified**

Run: `python3 -c "from PIL import Image; im=Image.open('logo rajbaan.png'); print(im.size, im.mode)"`
Expected: `(1774, 887) RGB` — unchanged.

- [x] **Step 5: Human check — you must do this one**

Open `public/logo.png` and `public/favicon.png` in any image viewer. Confirm the whole
mark is visible in the favicon with a white margin on all four sides, and that the logo
still reads correctly after downscaling. The agent running this plan cannot see images,
so this is the only verification that the artwork survived processing. If the favicon
crops or the mark looks wrong, raise `FAVICON_MARGIN` rather than cropping.

- [ ] **Step 6: [COMMIT — ask first] Derived logo assets**

```bash
git add scripts/prepare-logo.py public/logo.png public/favicon.png
git commit -m "chore(assets): derive downscaled logo and square favicon"
```

Do not add `logo rajbaan.png` itself if it is untracked and large — the README explains
where it belongs.

---

### Task 5: Design tokens, base CSS, motion

Tailwind v4 defines design tokens in CSS with `@theme`; no `tailwind.config.js` exists.
Every colour, font, and animation the spec names is registered here once.

**Files:**
- Create: `src/index.css`

- [x] **Step 1: Write `src/index.css`**

```css
@import 'tailwindcss';

@theme {
  --color-ink: #1a1512;
  --color-maroon: #7b1e1e;
  --color-marigold: #e8a33d;
  --color-turmeric: #f4b942;
  --color-cashew: #f7f1e6;
  --color-parchment: #efe3ce;
  --color-whatsapp: #25d366;

  --font-display: 'Noto Serif Devanagari', Georgia, serif;
  --font-body: 'Noto Sans Devanagari', system-ui, sans-serif;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

.animate-marquee {
  animation: marquee-scroll 30s linear infinite;
}

.animate-badge-pulse {
  animation: badge-pulse 2.4s ease-in-out infinite;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-cashew);
  color: var(--color-ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

:focus-visible {
  outline: 2px solid var(--color-turmeric);
  outline-offset: 2px;
}

.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 500ms ease-out,
    transform 500ms ease-out;
}

.reveal.is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .animate-marquee,
  .animate-badge-pulse {
    animation: none;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Three things are deliberate. The marquee translates `-50%` because the track holds the
item list twice, so the seam lands exactly at the halfway point. `.reveal` starts hidden
but `@media (prefers-reduced-motion: reduce)` and the hook's no-JS path both force it
visible, so content is never trapped behind an animation that may not run. The
`prefers-reduced-motion` block also stops the pulse, which matters because a permanent
opacity animation is a real accessibility problem, not a flourish.

- [x] **Step 2: Verify the stylesheet compiles**

Run: `npm run build`
Expected: FAIL — `src/main.jsx` does not exist yet, and the error names that file. The
build is being used here only to confirm the Tailwind plugin loaded and parsed
`index.css`. A `Cannot apply unknown utility class` or `@theme` syntax error means fix
this file before continuing.

- [ ] **Step 3: [COMMIT — ask first] Design tokens and motion CSS**

```bash
git add src/index.css
git commit -m "feat(styles): spice palette tokens, fonts, and reduced-motion-safe motion"
```

---

### Task 6: `useReveal` hook

**Files:**
- Create: `src/hooks/useReveal.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useRef, useState } from 'react'

export function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}
```

The two guards matter more than the observer. Without the `IntersectionObserver` check,
an environment lacking the API leaves every section permanently invisible, because
`.reveal` starts at `opacity: 0`. Without the reduced-motion check, users who asked for
less motion still get a scroll-triggered fade.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Reveal hook**

```bash
git add src/hooks/useReveal.js
git commit -m "feat(ui): reveal-on-scroll hook with motion and API guards"
```

---

### Task 7: SVG motifs

Three hand-authored line-art motifs, one per category card. They use `currentColor` and
no external asset, so they inherit card colour and add nothing to the bundle beyond a
few hundred bytes. The trust section uses a text `✓` instead of a fourth motif, so no
unused export ships.

**Files:**
- Create: `src/components/SpiceMotif.jsx`

- [x] **Step 1: Write the four motifs**

```jsx
const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  className: 'h-12 w-12',
}

export function StarAnise(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="24" r="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4
        const x = 24 + Math.cos(angle) * 13
        const y = 24 + Math.sin(angle) * 13
        return <circle key={i} cx={x} cy={y} r="5" />
      })}
    </svg>
  )
}

export function Chilli(props) {
  return (
    <svg {...base} {...props}>
      <path d="M26 10c6 4 8 12 4 19-4 7-13 9-19 4" />
      <path d="M26 10c0-3 2-5 5-5" />
      <path d="M13 31c4 2 9 1 12-2" />
    </svg>
  )
}

export function Cashew(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 34c-4-8 0-19 9-22 8-3 16 2 15 10-1 7-9 8-13 4-3-3 0-8 5-8" />
      <path d="M14 34c3 3 8 4 12 2" />
    </svg>
  )
}
```

- [x] **Step 2: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: lint exits 0; build still fails only on the missing `src/main.jsx`.

- [ ] **Step 3: [COMMIT — ask first] SVG motifs**

```bash
git add src/components/SpiceMotif.jsx
git commit -m "feat(ui): hand-authored spice and dry-fruit SVG motifs"
```
### Task 8: Shared contact buttons

The WhatsApp + call pair appears in both the hero and the enquiry band. It exists once
here so the prefilled message and the `tel:` target cannot drift between the two.

**Files:**
- Create: `src/components/ContactButtons.jsx`

- [x] **Step 1: Write the component**

`size` controls the vertical rhythm only: `md` in the hero, `lg` in the enquiry band.
Both variants keep a 48 px minimum height, above the 44 px touch-target floor.

```jsx
import { PHONE_DIGITS, TEL_HREF, WHATSAPP_HREF } from '../contact.js'
import { useLanguage } from '../LanguageContext.jsx'

const SIZES = {
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-7 text-base',
}

export function ContactButtons({ size = 'md', className = '' }) {
  const { t } = useLanguage()
  const sizing = SIZES[size]

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('buttons.whatsappAria')}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp font-semibold text-white shadow-sm transition hover:brightness-95 ${sizing}`}
      >
        <WhatsAppGlyph />
        {t('buttons.whatsapp')}
      </a>
      <a
        href={TEL_HREF}
        className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-semibold text-ink transition hover:bg-ink hover:text-cashew ${sizing}`}
      >
        <PhoneGlyph />
        {t('buttons.call')} {PHONE_DIGITS}
      </a>
    </div>
  )
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.4 0-.8.5-1.2.7-1.4.2-.2.4-.2.6-.2h.4c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7 1.3 1.6 2.1 2 .3.2.5.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.3Z" />
    </svg>
  )
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}
```

`rel="noopener noreferrer"` is required, not optional: the WhatsApp link opens a new tab,
and without it that tab gets a handle on `window.opener`.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Shared contact buttons**

```bash
git add src/components/ContactButtons.jsx
git commit -m "feat(ui): shared WhatsApp and call button pair"
```

---

### Task 9: TopBar with language toggle

**Files:**
- Create: `src/components/TopBar.jsx`

- [x] **Step 1: Write the component**

```jsx
import { LANGUAGES } from '../content.js'
import { useLanguage } from '../LanguageContext.jsx'

const LABELS = { en: 'EN', hi: 'हिं' }

export function TopBar() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 bg-ink text-cashew">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5">
        <p className="truncate text-xs tracking-wide text-cashew/80 sm:text-sm">
          {t('topBar.signature')}
        </p>
        <div
          role="group"
          aria-label="Language"
          className="flex shrink-0 items-center gap-1 rounded-full border border-cashew/25 p-0.5"
        >
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={language === code}
              className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${
                language === code
                  ? 'bg-marigold text-ink'
                  : 'text-cashew/70 hover:text-cashew'
              }`}
            >
              {LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
```

`aria-pressed` communicates the toggle state to assistive tech. The buttons are 36 px
tall (`min-h-9`) inside a `p-0.5` group, which clears the 44 px floor once the group's
padding is counted — verify on device, and raise to `min-h-10` if it feels tight.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] TopBar**

```bash
git add src/components/TopBar.jsx
git commit -m "feat(ui): sticky top bar with EN/HIN toggle"
```

---

### Task 10: Hero

The primary section. The logo card is mandatory: the mark is black-on-white and is never
recoloured, so it must never touch the cream page or a dark band directly.

**Files:**
- Create: `src/components/Hero.jsx`

- [x] **Step 1: Write the component**

```jsx
import { useReveal } from '../hooks/useReveal.js'
import { useLanguage } from '../LanguageContext.jsx'
import { ContactButtons } from './ContactButtons.jsx'

export function Hero() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-marigold)_0%,transparent_70%)] opacity-25"
      />
      <div
        ref={ref}
        className={`reveal relative mx-auto flex max-w-xl flex-col items-center text-center ${visible ? 'is-visible' : ''}`}
      >
        <div className="w-full max-w-[420px] rounded-3xl border border-marigold bg-white p-8 shadow-lg shadow-ink/10 sm:p-10">
          <img
            src="/logo.png"
            alt={t('hero.logoAlt')}
            width="1200"
            height="600"
            className="mx-auto h-auto w-full object-contain"
          />
        </div>

        <p className="mt-8 font-display text-4xl leading-tight sm:text-5xl">
          {t('hero.wordmarkLocal')}
        </p>
        <p className="mt-1 text-sm font-semibold tracking-[0.35em] text-maroon">
          {t('hero.wordmarkLatin')}
        </p>

        <p className="mt-6 font-display text-xl text-ink/80 sm:text-2xl">
          {t('hero.tagline')}
        </p>

        <span className="animate-badge-pulse mt-7 rounded-full bg-marigold px-5 py-2 text-sm font-semibold tracking-wide text-ink">
          {t('hero.badge')}
        </span>

        <ContactButtons className="mt-9" />
      </div>
    </section>
  )
}
```

The logo `img` carries explicit `width`/`height` so the browser reserves the box before
the file loads, preventing layout shift on a phone connection.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Hero**

```bash
git add src/components/Hero.jsx
git commit -m "feat(ui): hero with logo card, wordmark, tagline and CTAs"
```

---

### Task 11: Marquee

**Files:**
- Create: `src/components/Marquee.jsx`

- [x] **Step 1: Write the component**

```jsx
import { useLanguage } from '../LanguageContext.jsx'

export function Marquee() {
  const { t } = useLanguage()
  const items = t('marquee')
  const track = [...items, ...items]

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-marigold/40 bg-maroon py-3"
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {track.map((item, index) => (
          <span
            key={index}
            className="flex items-center pr-8 font-display text-lg text-marigold"
          >
            {item}
            <span className="pl-8 text-marigold/60">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

The track is rendered twice so the `-50%` keyframe in Task 5 has a matching duplicate to
scroll into. The spacing is `pr-8` on each item rather than `gap-8` on the track: with a
flex gap, 18 spans produce 17 gaps, so half the track is `items + 8.5 gaps` while the
true loop period is `items + 9 gaps` — the loop would jump 1rem every 30 seconds. With
the gap inside each item the two halves are exactly equal and `-50%` is exact. Keys use
the index because the two halves are intentionally identical strings — a value key would
collide. The whole band is `aria-hidden` because a screen reader announcing nine spices
twice while scrolling would be noise, and the same items appear accessibly in the
Categories section.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Marquee**

```bash
git add src/components/Marquee.jsx
git commit -m "feat(ui): Devanagari marquee ticker"
```

---

### Task 12: Categories

**Files:**
- Create: `src/components/Categories.jsx`

- [x] **Step 1: Write the component**

```jsx
import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { Cashew, Chilli, StarAnise } from './SpiceMotif.jsx'

const MOTIFS = { starAnise: StarAnise, chilli: Chilli, cashew: Cashew }

export function Categories() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="px-4 py-16 sm:py-20">
      <div ref={ref} className={`reveal mx-auto max-w-5xl ${visible ? 'is-visible' : ''}`}>
        <h2 className="text-center font-display text-3xl sm:text-4xl">
          {t('categories.title')}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {t('categories.items').map((item) => {
            const Motif = MOTIFS[item.motif]
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-marigold/30 bg-parchment p-8 text-center transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg hover:shadow-ink/10"
              >
                <Motif className="mx-auto h-12 w-12 text-maroon" />
                <h3 className="mt-5 font-display text-xl">{item.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{item.subtitle}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

`MOTIFS` maps the dictionary's motif key to a component, so `content.js` stays free of
JSX. The hover lift is wrapped in `motion-safe:` so it never fires for users who have
asked for reduced motion, and the whole reveal block is on the section rather than each
card so the grid staggers as one unit.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Categories**

```bash
git add src/components/Categories.jsx
git commit -m "feat(ui): three product category cards with SVG motifs"
```

---

### Task 13: Trust

**Files:**
- Create: `src/components/Trust.jsx`

- [x] **Step 1: Write the component**

```jsx
import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'

export function Trust() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div ref={ref} className={`reveal mx-auto max-w-5xl ${visible ? 'is-visible' : ''}`}>
        <h2 className="text-center font-display text-3xl sm:text-4xl">
          {t('trust.title')}
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t('trust.items').map((item) => (
            <li key={item.title} className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-marigold text-lg font-bold text-maroon"
              >
                ✓
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-ink/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

A text `✓` inside a bordered circle is used instead of a fifth SVG motif: it is one
glyph, needs no asset, and the tick is the correct semantic mark for all four claims.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Trust**

```bash
git add src/components/Trust.jsx
git commit -m "feat(ui): trust points row"
```
### Task 14: Enquiry

**Files:**
- Create: `src/components/Enquiry.jsx`

- [x] **Step 1: Write the component**

```jsx
import { PHONE_DIGITS } from '../contact.js'
import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { ContactButtons } from './ContactButtons.jsx'

export function Enquiry() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="bg-maroon px-4 py-16 text-cashew sm:py-20">
      <div
        ref={ref}
        className={`reveal mx-auto flex max-w-2xl flex-col items-center text-center ${visible ? 'is-visible' : ''}`}
      >
        <h2 className="font-display text-3xl leading-snug sm:text-4xl">
          {t('enquiry.headline')}
        </h2>
        <p className="mt-4 text-cashew/80">{t('enquiry.note')}</p>
        <p className="mt-8 font-display text-4xl tracking-wide text-marigold sm:text-5xl">
          {PHONE_DIGITS}
        </p>
        <ContactButtons size="lg" className="mt-8" />
      </div>
    </section>
  )
}
```

The headline is the page's one piece of Hinglish in Latin script. It is a dictionary
string, so `hi` mode swaps it for the Devanagari equivalent while `en` mode keeps the
casual Latin phrasing that matches how the business talks.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Enquiry band**

```bash
git add src/components/Enquiry.jsx
git commit -m "feat(ui): WhatsApp conversion band"
```

---

### Task 15: Footer

No logo image here. The only derived asset is black-on-white, which would be invisible on
`ink`, and the mark is never recoloured per spec 7.4.

**Files:**
- Create: `src/components/Footer.jsx`

- [x] **Step 1: Write the component**

The bottom padding reserves the space the WhatsApp FAB occupies, so the FAB can never
cover the copyright line on a short viewport.

```jsx
import { useLanguage } from '../LanguageContext.jsx'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-ink px-4 pb-28 pt-14 text-cashew sm:pb-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
        <p className="font-display text-2xl">{t('hero.wordmarkLocal')}</p>
        <p className="text-sm text-cashew/70">{t('footer.descriptor')}</p>
        <p className="mt-3 text-xs tracking-[0.3em] text-marigold">
          {t('hero.wordmarkLatin')}
        </p>
        <div className="mt-6 flex flex-col items-center gap-1 text-xs text-cashew/60">
          <p>{t('footer.rights')}</p>
          <p>{t('footer.madeIn')}</p>
          <p className="mt-2">
            {t('footer.creditPrefix')}{' '}
            <a
              href="https://visuark.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-marigold underline decoration-marigold/40 underline-offset-2 transition hover:decoration-marigold"
            >
              {t('footer.creditName')}
            </a>{' '}
            {t('footer.creditSuffix')}
          </p>
        </div>
      </div>
    </footer>
  )
}
```

The credit was added after the original plan was approved. "Made by Visuark with love" sits
below the rights line as a bilingual string, with the brand name left in Latin script in
both locales. The link is `inline-flex min-h-11` so its hit area is a real 44x44: as a plain
inline link inside a 12px paragraph it measured 44x16, below even the WCAG 2.2 AA 24px
minimum, and awkward to tap at the very bottom of the page.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] Footer**

```bash
git add src/components/Footer.jsx
git commit -m "feat(ui): footer with text wordmark and FAB clearance"
```

---

### Task 16: WhatsAppFab

**Files:**
- Create: `src/components/WhatsAppFab.jsx`

- [x] **Step 1: Write the component**

`aria-hidden` plus `tabIndex={-1}` keeps the duplicate action out of the tab order. The
same link is reachable as a labelled button in the hero and the enquiry band, so nothing
is lost — a screen-reader user gets a properly named control instead of an unlabelled
icon.

```jsx
import { WHATSAPP_HREF } from '../contact.js'

export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden="true"
      tabIndex={-1}
      className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-xl shadow-ink/25 transition hover:brightness-95"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.4 0-.8.5-1.2.7-1.4.2-.2.4-.2.6-.2h.4c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7 1.3 1.6 2.1 2 .3.2.5.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.3Z" />
      </svg>
    </a>
  )
}
```

`bottom` is an inline style rather than a Tailwind class because `env()` inside a
Tailwind arbitrary value needs escaping that is fragile across versions; the inline
declaration is clearer and cannot break on a Tailwind upgrade.

- [x] **Step 2: Verify lint**

Run: `npm run lint`
Expected: exits 0, no output.

- [ ] **Step 3: [COMMIT — ask first] WhatsApp FAB**

```bash
git add src/components/WhatsAppFab.jsx
git commit -m "feat(ui): floating WhatsApp button"
```

---

### Task 17: Assemble App and main

**Files:**
- Create: `src/App.jsx`, `src/main.jsx`

- [x] **Step 1: Write `src/App.jsx`**

```jsx
import { Categories } from './components/Categories.jsx'
import { Enquiry } from './components/Enquiry.jsx'
import { Footer } from './components/Footer.jsx'
import { Hero } from './components/Hero.jsx'
import { Marquee } from './components/Marquee.jsx'
import { TopBar } from './components/TopBar.jsx'
import { Trust } from './components/Trust.jsx'
import { WhatsAppFab } from './components/WhatsAppFab.jsx'
import { LanguageProvider } from './LanguageContext.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <TopBar />
      <main>
        <Hero />
        <Marquee />
        <Categories />
        <Trust />
        <Enquiry />
      </main>
      <Footer />
      <WhatsAppFab />
    </LanguageProvider>
  )
}
```

- [x] **Step 2: Write `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`main.jsx` imports `index.css` for its side effect. That import is what pulls
`src/index.css` into the bundle, and it must not move into `App.jsx`.

- [x] **Step 3: Run the full verification suite**

Run: `npm test`
Expected: PASS, 12 tests.

Run: `npm run lint`
Expected: exits 0, no output.

Run: `npm run build`
Expected: exits 0. `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`,
`dist/logo.png`, and `dist/favicon.png` all present. Print the total with
`du -sh dist` — expect well under 400 KB, since there is no router, no state library,
and no runtime dependency beyond React.

- [ ] **Step 4: [COMMIT — ask first] Assemble the page**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: compose the Rajbaan coming soon page"
```

---

### Task 18: Final verification gate

Every command here must pass before the work is called done.

**Files:**
- Create: `README.md`

- [x] **Step 1: Write `README.md`**

````markdown
# Rajbaan — Coming Soon

Single-page site for the Rajbaan spices and dry-fruits brand. Static build, no backend.

## Commands

```bash
npm install
npm run dev      # local dev server
npm test         # vitest, single run
npm run lint     # eslint
npm run build    # static output into dist/
```

## Deploying

`npm run build` produces a fully static `dist/`. Upload it to Netlify, Vercel, GitHub
Pages, or any web host. No server, no environment variables, no configuration.

## Before you publish — three things to change

1. **The domain.** In `index.html`, replace all three occurrences of
   `https://example.invalid/rajbaan` with your real domain: the `rel="canonical"`
   link, `og:url`, and `og:image`.
2. **The logo.** Replace `public/logo.png` and `public/favicon.png`. Regenerate them
   from the master artwork with `python3 scripts/prepare-logo.py`, or drop in your own
   files — keep the 2:1 aspect ratio for `logo.png` so the hero card does not distort.
3. **The phone number.** `src/contact.js` holds it in exactly one place,
   `PHONE_DIGITS`. Change it there and the visible text, the WhatsApp link, and the
   `tel:` link all follow.

## Language

`src/content.js` holds every string in English and Hindi. Adding or renaming a key
requires updating both locales — `src/test/content.test.js` fails the build otherwise.

## Design

Full rationale, palette, and layout decisions:
`docs/superpowers/specs/2026-09-26-rajbaan-coming-soon-design.md`
````

- [x] **Step 2: Run every check from a clean state**

Run: `rm -rf dist && npm test && npm run lint && npm run build`
Expected: 12 tests pass, lint silent, build succeeds.

- [x] **Step 3: Serve the build and check it in a browser**

Run: `npm run preview` then open the printed URL.

Check, in this order, and stop to fix anything that fails:

- [x] Page loads with no console errors and no 404s in the network tab.
- [x] The logo appears in its white card, fully visible, not touching the card border.
- [x] Toggling `EN` / `हिं` changes all copy, including the Devanagari heading — and no
      word renders as tofu boxes. If it does, the Devanagari webfont failed to load.
- [x] Reload the page: the language you chose is still selected.
- [x] Tapping "WhatsApp us" opens WhatsApp with the prefilled message.
- [x] Tapping "Call 9216487878" opens the dialler with `+919216487878`.
- [x] The marquee scrolls seamlessly, with no visible jump at the loop point.
- [x] No horizontal scrollbar at 360 px.
- [x] Resize through 360, 390, 768 and 1440 px: nothing overlaps or clips.

- [x] **Step 4: Check the reduced-motion path**

In the browser devtools, emulate `prefers-reduced-motion: reduce`, then reload.

Expected: the badge does not pulse, the marquee is static, and every section is
visible immediately on scroll with no fade.

- [ ] **Step 5: [COMMIT — ask first] README and final gate**

```bash
git add README.md
git commit -m "docs: README with deploy steps and pre-publish checklist"
```

---

## Definition of done

- `npm test` — 37 passing (grew from the planned 13: extra coverage was added for the
  reveal hook, the marquee loop, the contact buttons, the assembled app, and the
  Visuark credit link)
- `npm run lint` — silent
- `npm run build` — succeeds, `dist/` at 296 KB (under the 400 KB target)
- `axe-core` — 0 violations, 37 passing rules
- Automated browser gate — 28 checks green: console clean, no failed requests, logo
  loaded and padded inside its card, EN/HI toggle with reload persistence, Devanagari
  webfont loaded, WhatsApp and `tel:` hrefs exact, marquee halves geometrically
  identical, no horizontal scroll at 360/390/768/1440, visible focus on every tab stop,
  and the reduced-motion path static with all reveals visible
- Layout sanity gate — no clipped text, no tap target under 44px, no text under 12px,
  and no overlapping hero blocks, in both languages at all four widths
- **Still needs a human:** a visual look at the rendered page and the logo. Every
  mechanical proxy for that passed, but this agent cannot view images.
- Both placeholder URLs in `index.html` still read `example.invalid` and are listed in
  the README as pre-publish work — that is intentional, not an oversight

## Deviations and defects found during implementation

Correctness fixes:

- **`useReveal` set state synchronously inside an effect.** `react-hooks` v7's
  `set-state-in-effect` rule flagged it, and the rule was right: the two guard
  conditions (no `IntersectionObserver`, reduced motion) are environment facts fixed at
  render time, not values that change. Moved them into the `useState` initializer so
  `setState` is only ever called from the observer callback.
- **Marquee loop seam.** Per-item `pr-8` padding is load-bearing. A flex `gap` gives N
  items N-1 gaps, so half the track is `items + (N-1)/2` gaps while the true period is
  `items + N/2` gaps — the -50% translate would jump. `src/test/Marquee.test.jsx`
  asserts the halves are identical, and was verified to fail when the gap version is
  restored.

Accessibility fixes found by axe-core and the layout gate:

- **The Visuark credit link was 44x16.** Added as a plain inline link inside a 12px
  paragraph, its hit area was below even the WCAG 2.2 AA 24px minimum and hard to tap at
  the bottom of the page. Made it `inline-flex min-h-11 items-center` for a real 44x44
  target. The layout gate caught this; it was not visible in the unit tests.

- **WhatsApp CTA failed contrast at 1.98:1.** White on brand green `#25d366` is far
  below the 4.5:1 AA minimum. Added `--color-whatsapp-deep: #0f7a43` (5.41:1 with
  white) for the button and the FAB.
- **Badge pulse failed contrast mid-animation.** The pulse faded opacity to 0.55,
  dropping the label to 3.1:1 against the badge for part of every cycle. Rewrote the keyframes to pulse a
  shadow ring instead, so the text holds full opacity in every frame and the effect
  stays safe under any future palette.
- **The page had no `h1`.** The brand wordmark was a paragraph. It is now the single
  `h1`, with `font-normal` so the display font still renders at its loaded weight.
- **Language toggle was 42x44.** Added `min-w-11` so both dimensions reach 44px.
- **Display type had ink outside its line box.** Tailwind's `text-3xl`/`text-4xl`/
  `text-5xl` default to line-heights near 1.1, leaving 5-13px of glyph ink outside the
  box; the hero `h1` sat 4px from the line below it. Set explicit `leading-snug` on
  section headings and `leading-[1.45]` on the hero wordmark and the phone number.

Efficiency:

- **Dropped an unused font weight.** Every `font-display` element renders at weight 400,
  so `Noto Serif Devanagari` is now requested at `400` only instead of `400;600`. Body
  copy keeps 400/600/700, which are all used.

Test corrections made during the work (the tests were wrong, not the app):

- `ContactButtons` mixed English and Hindi expectations in one render, and asserted a
  Hindi accessible name without selecting Hindi.
- An overflow sweep using `rect.right > clientWidth` flagged the marquee track, which is
  deliberately wider than the viewport and correctly clipped by its `overflow-hidden`
  ancestor. The check now tests the page-level scrollbar plus unclipped elements only.
- A first `Marquee` test asserted against a stub that returned `[]`, so it passed
  trivially; it was deleted rather than kept as decoration.

Not done, deliberately:

- **No commits.** The project sits untracked inside an unrelated repository at
  `/home/tony`, so no `git init`, worktree, branch, or commit was created.
- **No visual sign-off.** Screenshots were captured at 360/390/768/1440 and under
  reduced motion, but this agent cannot view images, so a human must look at them.
