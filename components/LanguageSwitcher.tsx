'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { type Language } from '@/lib/i18n/language';

const FLAG: Record<Language, { emoji: string; label: string }> = {
  en: { emoji: '🇺🇸', label: 'English' },
  es: { emoji: '🇲🇽', label: 'Español' },
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslations();

  const other: Language = language === 'en' ? 'es' : 'en';
  const target = FLAG[other];

  return (
    <button
      onClick={() => setLanguage(other)}
      className="p-2 text-xl leading-none rounded-xl hover:bg-white/10 transition-all duration-300"
      aria-label={`Switch to ${target.label}`}
      title={target.label}
    >
      {target.emoji}
    </button>
  );
}
