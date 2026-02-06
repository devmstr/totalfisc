import React, { createContext, useContext, useEffect, useState } from 'react'
import i18n from './i18n'

type Language = 'fr' | 'ar'
type Direction = 'ltr' | 'rtl'

interface I18nContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (i18n.language as Language) || 'fr'
  )

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    // Sync HTML attributes
    document.documentElement.dir = direction
    document.documentElement.lang = language
  }, [language, direction])

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
    setLanguageState(lang)
  }

  const toggleLanguage = () => {
    const nextLang = language === 'fr' ? 'ar' : 'fr'
    setLanguage(nextLang)
  }

  return (
    <I18nContext.Provider
      value={{ language, direction, setLanguage, toggleLanguage }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
