'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for enhanced glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t.nav.solutions, href: '#solutions' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.caseStudies, href: '#case-studies' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div
          className={`liquid-glass liquid-glass-glow max-w-6xl mx-auto px-6 py-4 transition-all duration-500 ${
            scrolled ? 'shadow-2xl shadow-black/20' : ''
          }`}
        >
          <div className="relative flex items-center justify-between z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/logos/dark_mode_brand.svg"
                alt="elev8tion"
                width={320}
                height={100}
                className="h-16 sm:h-20 lg:h-24 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA + Language Switcher */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher variant="compact" />
              <a
                href="#contact"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {t.nav.contact}
              </a>
              <a
                href="#get-started"
                className="btn-fab text-sm px-6 py-2.5"
              >
                {t.nav.getStarted}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'
                  }`}
                />
                <span
                  className={`absolute left-0 top-3 w-6 h-0.5 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu with Liquid Glass */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
              mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-4 mt-4 border-t border-white/10">
              <nav className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                      transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                      opacity: mobileMenuOpen ? 1 : 0
                    }}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="px-4 py-2">
                    <LanguageSwitcher variant="compact" />
                  </div>
                  <a
                    href="#contact"
                    className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.contact}
                  </a>
                  <a
                    href="#get-started"
                    className="btn-fab block text-center text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.getStarted}
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
