'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useTranslations();

  return (
    <footer className="bg-[#0A0A0B] border-t border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-6">
              <Image
                src="/logos/dark_mode_brand.svg"
                alt="elev8tion"
                width={280}
                height={90}
                className="h-16 sm:h-20 lg:h-24 w-auto"
              />
            </div>
            <p className="text-sm text-[#71717A] mb-6">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com/elev8tion" target="_blank" rel="noopener noreferrer" className="text-[#71717A] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/elev8tion" target="_blank" rel="noopener noreferrer" className="text-[#71717A] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.sections.solutions}
            </h4>
            <ul className="space-y-3">
              {t.footer.links.solutions.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-[#71717A] hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.sections.company}
            </h4>
            <ul className="space-y-3">
              {t.footer.links.company.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-[#71717A] hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.sections.resources}
            </h4>
            <ul className="space-y-3">
              {t.footer.links.resources.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-[#71717A] hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#71717A]">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="/privacy" className="text-sm text-[#71717A] hover:text-white transition-colors">
              {t.footer.privacyPolicy}
            </a>
            <a href="/terms" className="text-sm text-[#71717A] hover:text-white transition-colors">
              {t.footer.termsOfService}
            </a>
            <a href="/ai-disclosure" className="text-sm text-[#71717A] hover:text-white transition-colors">
              {t.footer.aiDisclosure}
            </a>
            <a href="/refund-policy" className="text-sm text-[#71717A] hover:text-white transition-colors">
              {t.footer.refundPolicy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
