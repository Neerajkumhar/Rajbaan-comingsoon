import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PHONE_DIGITS, TEL_HREF, WHATSAPP_HREF } from '../contact.js'
import { LanguageProvider } from '../LanguageContext.jsx'
import { ContactButtons } from '../components/ContactButtons.jsx'

beforeEach(() => {
  localStorage.clear()
})

function renderButtons(props) {
  return render(
    <LanguageProvider>
      <ContactButtons {...props} />
    </LanguageProvider>,
  )
}

describe('ContactButtons', () => {
  it('links WhatsApp to the wa.me deep link with the prefilled message', () => {
    renderButtons()
    const link = screen.getByRole('link', { name: 'Enquire on WhatsApp' })
    expect(link).toHaveAttribute('href', WHATSAPP_HREF)
  })

  it('opens WhatsApp in a new tab without leaking the opener', () => {
    renderButtons()
    const link = screen.getByRole('link', { name: 'Enquire on WhatsApp' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links the call button to the tel href', () => {
    renderButtons()
    expect(screen.getByRole('link', { name: /Call/ })).toHaveAttribute('href', TEL_HREF)
  })

  it('shows the digits from the shared constant, not a hard-coded copy', () => {
    renderButtons()
    expect(screen.getByRole('link', { name: new RegExp(PHONE_DIGITS) })).toBeInTheDocument()
  })

  it('translates both labels in the active language', () => {
    renderButtons()
    expect(screen.getByText('WhatsApp us')).toBeInTheDocument()
    expect(screen.getByText(/^Call/)).toBeInTheDocument()
  })

  it('keeps the accessible name in the active language', () => {
    localStorage.setItem('rajbaan.lang.v1', 'hi')
    render(
      <LanguageProvider>
        <ContactButtons />
      </LanguageProvider>,
    )
    expect(screen.getByRole('link', { name: 'व्हाट्सएप पर पूछताछ करें' })).toBeInTheDocument()
  })

  it('applies the requested size variant', () => {
    const { container } = renderButtons({ size: 'lg' })
    const links = container.querySelectorAll('a')
    expect(links[0].className).toContain('min-h-14')
  })
})
