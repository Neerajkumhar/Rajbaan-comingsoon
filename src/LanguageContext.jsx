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
