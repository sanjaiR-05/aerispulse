'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from '@/domain/types';

/**
 * Return interface for the `useThemeLanguage` custom hook.
 */
export interface UseThemeLanguageResult {
  /** Active internationalization language code ('en' | 'ta' | 'hi') */
  language: SupportedLanguage;
  /** Setter for dashboard language */
  setLanguage: (lang: SupportedLanguage) => void;
  /** Whether dark mode theme is active */
  isDark: boolean;
  /** Direct setter for dark mode boolean flag */
  setIsDark: (dark: boolean) => void;
  /** Toggle dark mode boolean flag */
  toggleDark: () => void;
}

/**
 * Custom hook managing UI accessibility theme (light/dark) and i18n localization state.
 * Synchronizes the Tailwind `dark` class dynamically on `document.documentElement`.
 *
 * @returns {UseThemeLanguageResult} Theme and language state controllers
 *
 * @example
 * ```tsx
 * const { language, setLanguage, isDark, setIsDark } = useThemeLanguage();
 * ```
 */
export function useThemeLanguage(): UseThemeLanguageResult {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Synchronize CSS class on HTML root element for Tailwind dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return {
    language,
    setLanguage,
    isDark,
    setIsDark,
    toggleDark,
  };
}
