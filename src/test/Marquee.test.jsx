import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { content } from '../content.js'
import { LanguageProvider } from '../LanguageContext.jsx'
import { Marquee } from '../components/Marquee.jsx'

function renderMarquee() {
  return render(
    <LanguageProvider>
      <Marquee />
    </LanguageProvider>,
  )
}

describe('Marquee', () => {
  it('renders the item list twice for a seamless loop', () => {
    const { container } = renderMarquee()
    const items = container.querySelectorAll('.animate-marquee > span')
    expect(items).toHaveLength(content.en.marquee.length * 2)
  })

  it('lays the spacing inside each item so the two halves are identical', () => {
    const { container } = renderMarquee()
    const items = [...container.querySelectorAll('.animate-marquee > span')]

    // The track translates -50%, so a seamless loop requires the first half and the
    // second half to occupy exactly the same width. A flex `gap` between items would
    // make that false: N items produce N-1 gaps, so half the track is items + (N-1)/2
    // gaps while the true period is items + N/2 gaps. Per-item padding keeps the halves
    // equal, so the last item must carry trailing padding like every other item.
    const half = items.length / 2
    for (let i = 0; i < half; i += 1) {
      expect(items[i].className).toBe(items[i + half].className)
    }
    expect(items[items.length - 1].className).toContain('pr-8')
  })

  it('hides the decorative band from assistive technology', () => {
    const { container } = renderMarquee()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})
