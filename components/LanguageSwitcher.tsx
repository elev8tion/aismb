'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { type Language, getLanguageLabel } from '@/lib/i18n/language';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslations();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            language === 'en'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('es')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            language === 'es'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          ES
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 text-white/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <div className="flex gap-1">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
            language === 'en'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {getLanguageLabel('en')}
        </button>
        <button
          onClick={() => handleLanguageChange('es')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
            language === 'es'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {getLanguageLabel('es')}
        </button>
      </div>
    </div>
  );
}
