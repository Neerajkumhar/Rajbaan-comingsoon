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

        <h1 className="mt-8 font-display text-4xl font-normal leading-[1.45] sm:text-5xl">
          {t('hero.wordmarkLocal')}
        </h1>
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
