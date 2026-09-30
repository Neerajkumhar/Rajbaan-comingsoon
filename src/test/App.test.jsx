import { render, screen } from '@testing-library/react'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { PHONE_DIGITS } from '../contact.js'

// jsdom's URL constructor resolves against http://localhost:3000, so building a path
// with `new URL('../', import.meta.url).pathname` yields "/src" rather than a real
// path. fileURLToPath on the raw string avoids the URL constructor entirely.
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

function sourceFiles(dir = SRC, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) sourceFiles(path, found)
    else if (/\.(jsx?|css)$/.test(entry.name) && !entry.name.includes('.test.')) {
      found.push(path)
    }
  }
  return found
}

describe('App', () => {
  it('renders every section in the designed order', () => {
    const { container } = render(<App />)
    const order = [
      ...container.querySelectorAll('header, main > *, footer'),
    ].map((node) => node.tagName.toLowerCase())
    // The marquee is a decorative div rather than a section: it is aria-hidden and
    // carries no heading, so a section landmark would overstate its meaning.
    expect(order).toEqual([
      'header',
      'section',
      'div',
      'section',
      'section',
      'section',
      'footer',
    ])
  })

  it('raises the sticky bar and the floating button above the drifting field', () => {
    // z-index is one page-wide stack, so these live with page composition rather than in
    // the field's own file: the field's job is to stay behind this, and a change to the
    // header's or the button's layer belongs to the page, not to the field.
    const { container } = render(<App />)
    expect(container.querySelector('header').className).toContain('z-40')
    expect(container.querySelector('a[tabindex="-1"]').className).toContain('z-50')
  })

  it('has exactly one h1, carrying the brand name', () => {
    render(<App />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('राजबान')
  })

  it('exposes exactly one banner landmark and one contentinfo landmark', () => {
    render(<App />)
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  it('offers the WhatsApp action in both the hero and the enquiry band', () => {
    render(<App />)
    // Two, not three: the floating button is aria-hidden, so it is correctly absent
    // from the accessibility tree and the labelled buttons carry the action.
    expect(screen.getAllByRole('link', { name: 'Enquire on WhatsApp' })).toHaveLength(2)
  })

  it('renders the floating button but keeps it out of the tab order', () => {
    const { container } = render(<App />)
    const fab = container.querySelector('a[tabindex="-1"]')
    expect(fab).toHaveAttribute('aria-hidden', 'true')
  })

  it('switches the whole page to Hindi', () => {
    localStorage.setItem('rajbaan.lang.v1', 'hi')
    render(<App />)
    expect(screen.getByText('जल्द आ रहा है')).toBeInTheDocument()
    expect(screen.getByText('क्या आ रहा है')).toBeInTheDocument()
  })

  it('credits Visuark in the footer as a safe external link', () => {
    render(<App />)
    const link = screen.getByRole('link', { name: 'Visuark' })
    expect(link).toHaveAttribute('href', 'https://visuark.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link.closest('footer')).not.toBeNull()
  })

  it('keeps the Visuark credit in Hindi, with the brand name untranslated', () => {
    localStorage.setItem('rajbaan.lang.v1', 'hi')
    const { container } = render(<App />)
    const credit = container.querySelector('footer a[href="https://visuark.com"]')
      .closest('p')
    expect(credit).toHaveTextContent('प्यार से बनाया गया')
    expect(credit).toHaveTextContent('Visuark')
    expect(credit).toHaveTextContent('द्वारा')
  })
})

describe('the phone number has a single source', () => {
  it('appears in no source file except contact.js', () => {
    const offenders = sourceFiles().filter(
      (path) => !path.endsWith('contact.js') && readFileSync(path, 'utf8').includes(PHONE_DIGITS),
    )
    expect(offenders).toEqual([])
  })
})
