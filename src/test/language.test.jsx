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

  it('refuses an unknown language instead of storing it', () => {
    localStorage.setItem(STORAGE_KEY, 'hi')
    renderProbe()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('hi')
    expect(screen.getByTestId('language')).toHaveTextContent('hi')
  })
})
