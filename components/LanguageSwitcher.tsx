'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { type Language } from '@/lib/i18n/language';

const LABEL: Record<Language, string> = {
  en: 'English',
  es: 'Español',
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslations();

  const other: Language = language === 'en' ? 'es' : 'en';

  return (
    <button
      onClick={() => setLanguage(other)}
      className="px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-300"
      aria-label={`Switch to ${LABEL[other]}`}
    >
      {LABEL[other]}
    </button>
  );
}
