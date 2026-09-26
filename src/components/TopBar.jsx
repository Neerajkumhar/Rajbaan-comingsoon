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
              className={`min-h-11 min-w-11 rounded-full px-4 text-xs font-semibold transition ${
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
