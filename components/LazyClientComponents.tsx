'use client';

import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const VoiceAgentFAB = dynamic(() => import('@/components/VoiceAgentFAB'), {
  ssr: false,
});

const ROICalculator = dynamic(() => import('@/components/ROICalculator'), {
  loading: () => <div className="h-64" />,
});

export function LazyROICalculator() {
  return (
    <ErrorBoundary>
      <ROICalculator />
    </ErrorBoundary>
  );
}

export function LazyVoiceAgentFAB() {
  return (
    <ErrorBoundary fallback={null}>
      <VoiceAgentFAB />
    </ErrorBoundary>
  );
}
