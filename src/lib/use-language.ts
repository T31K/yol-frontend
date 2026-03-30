'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Lang, type Translations, translations } from './translations'

const STORAGE_KEY = 'yol-language'

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && stored in translations) setLangState(stored)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t: Translations = translations[lang]

  return { lang, setLang, t }
}
