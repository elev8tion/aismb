'use client';

import React from 'react';

export default function MidnightMist() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(70, 85, 110, 0.25), transparent),
            radial-gradient(ellipse 50% 30% at 20% 80%, rgba(99, 102, 241, 0.2), transparent),
            radial-gradient(ellipse 40% 40% at 90% 20%, rgba(181, 184, 208, 0.15), transparent)
          `,
        }}
      />

      {/* Floating Orbs */}
      <div
        className="orb-1 absolute w-64 h-64 rounded-full blur-3xl mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          top: '10%',
          left: '10%',
        }}
      />
      <div
        className="orb-2 absolute w-96 h-96 rounded-full blur-3xl mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          top: '50%',
          right: '5%',
        }}
      />
      <div
        className="orb-3 absolute w-72 h-72 rounded-full blur-3xl mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          bottom: '20%',
          left: '30%',
        }}
      />

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
