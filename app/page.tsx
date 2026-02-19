import ClientLayout from '@/components/ClientLayout';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SocialProofBar from '@/components/SocialProofBar';
import ProblemSection from '@/components/ProblemSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import UseCaseSelector from '@/components/UseCaseSelector';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LazyROICalculator, LazyVoiceAgentFAB } from '@/components/LazyClientComponents';

export default function Home() {
  return (
    <ClientLayout>
      <main id="main-content" className="min-h-screen bg-[#0A0A0B]">
        <Header />
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <HowItWorksSection />
        <UseCaseSelector />
        <CaseStudiesSection />
        <LazyROICalculator />
        <ErrorBoundary>
          <PricingSection />
        </ErrorBoundary>
        <FAQSection />
        <ErrorBoundary>
          <FinalCTA />
        </ErrorBoundary>
        <Footer />

        {/* Voice Agent FAB */}
        <LazyVoiceAgentFAB />
      </main>
    </ClientLayout>
  );
}
