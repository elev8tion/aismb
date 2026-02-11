import ClientLayout from '@/components/ClientLayout';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SocialProofBar from '@/components/SocialProofBar';
import ProblemSection from '@/components/ProblemSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import UseCaseSelector from '@/components/UseCaseSelector';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import dynamic from 'next/dynamic';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
const VoiceAgentFAB = dynamic(() => import('@/components/VoiceAgentFAB'), {
  ssr: false,
});
const ROICalculator = dynamic(() => import('@/components/ROICalculator'), {
  loading: () => <div className="h-64" />,
});
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function Home() {
  return (
    <ClientLayout>
      <main className="min-h-screen bg-[#0A0A0B]">
        <Header />
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <HowItWorksSection />
        <UseCaseSelector />
        <CaseStudiesSection />
        <ErrorBoundary>
          <ROICalculator />
        </ErrorBoundary>
        <ErrorBoundary>
          <PricingSection />
        </ErrorBoundary>
        <FAQSection />
        <ErrorBoundary>
          <FinalCTA />
        </ErrorBoundary>
        <Footer />

        {/* Voice Agent FAB */}
        <ErrorBoundary fallback={null}>
          <VoiceAgentFAB />
        </ErrorBoundary>
      </main>
    </ClientLayout>
  );
}
