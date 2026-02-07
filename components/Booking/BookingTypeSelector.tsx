'use client';

import { BookingType } from '@/lib/booking/types';

interface BookingTypeSelectorProps {
  onSelectType: (type: BookingType) => void;
  translations: {
    heading: string;
    consultation: {
      title: string;
      description: string;
      price: string;
      duration: string;
    };
    assessment: {
      title: string;
      description: string;
      price: string;
      duration: string;
      includes: string;
    };
  };
}

export default function BookingTypeSelector({ onSelectType, translations }: BookingTypeSelectorProps) {
  return (
    <div>
      <p className="text-white/60 text-sm mb-4">{translations.heading}</p>
      <div className="space-y-3">
        {/* Free Strategy Call */}
        <button
          onClick={() => onSelectType('consultation')}
          className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#0EA5E9]/40 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-white">{translations.consultation.title}</span>
            </div>
            <span className="text-sm font-bold text-[#10B981]">{translations.consultation.price}</span>
          </div>
          <p className="text-sm text-white/50 mb-2 pl-10">{translations.consultation.description}</p>
          <div className="flex items-center gap-2 pl-10">
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-white/40">{translations.consultation.duration}</span>
          </div>
        </button>

        {/* Onsite Assessment */}
        <button
          onClick={() => onSelectType('assessment')}
          className="w-full text-left p-4 rounded-xl border border-[#F97316]/30 bg-[#F97316]/5 hover:bg-[#F97316]/10 hover:border-[#F97316]/50 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-semibold text-white">{translations.assessment.title}</span>
            </div>
            <span className="text-sm font-bold text-[#F97316]">{translations.assessment.price}</span>
          </div>
          <p className="text-sm text-white/50 mb-2 pl-10">{translations.assessment.description}</p>
          <div className="flex items-center gap-4 pl-10">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-white/40">{translations.assessment.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#10B981]">{translations.assessment.includes}</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
