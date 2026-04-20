'use client';

import { useRouter, usePathname } from 'next/navigation';
import { buildLocalizedPath, getLocaleFromPath, locales } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLang = getLocaleFromPath(pathname || '/');
  const currentLanguage = languages.find(lang => lang.code === currentLang);

  const switchLanguage = (langCode: string) => {
    if (!pathname) return;
    const newPath = buildLocalizedPath(pathname, langCode as 'ru' | 'en');
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white/80 hover:text-white hover:bg-white/10"
      >
        <Languages className="w-4 h-4 mr-2" />
        {currentLanguage?.flag} {currentLanguage?.name}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-white/20 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                lang.code === currentLang ? 'bg-white/10 text-white' : 'text-white/80'
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}