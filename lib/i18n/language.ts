const LANGUAGE_KEY = 'preferred-language';
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const detectLanguage = (): Language => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Check localStorage first
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }

  // Detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }

  // Default to English
  return 'en';
};

export const setLanguage = (lang: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
};

/**
 * Add locale parameter to a URL
 * Handles both URLs with and without existing query params
 */
export const addLocaleToUrl = (url: string, locale: Language): string => {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('locale', locale);
    return urlObj.toString();
  } catch {
    // Fallback for relative URLs or invalid URLs
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}locale=${locale}`;
  }
};
