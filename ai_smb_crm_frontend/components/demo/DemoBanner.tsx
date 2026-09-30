'use client';

export function DemoBanner() {
  return (
    <div className="sticky top-16 tablet:top-0 z-20 border-b border-primary-electricBlue/20 bg-[#07131d]/95 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 text-center text-xs sm:flex-row sm:text-left">
        <p className="text-white/75">
          <span className="font-semibold text-primary-electricBlue">Public demo</span>
          <span className="mx-2 text-white/25">•</span>
          Sample records only. This workspace is read-only and resets automatically.
        </p>
        <a
          href="https://kre8tion.com"
          className="font-medium text-white/60 transition-colors hover:text-white"
        >
          Back to kre8tion.com →
        </a>
      </div>
    </div>
  );
}
