import { useLanguage } from '../LanguageContext.jsx'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="relative z-10 bg-ink px-4 pb-28 pt-14 text-cashew sm:pb-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
        <p className="font-display text-2xl">{t('hero.wordmarkLocal')}</p>
        <p className="text-sm text-cashew/70">{t('footer.descriptor')}</p>
        <p className="text-xs tracking-[0.3em] text-marigold">
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
