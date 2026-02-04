import ClientLayout from '@/components/ClientLayout';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SocialProofBar from '@/components/SocialProofBar';
import ProblemSection from '@/components/ProblemSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import UseCaseSelector from '@/components/UseCaseSelector';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import ROICalculator from '@/components/ROICalculator';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import VoiceAgentFAB from '@/components/VoiceAgentFAB';

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
        <ROICalculator />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
        <Footer />

        {/* Voice Agent FAB */}
        <VoiceAgentFAB />
      </main>
    </ClientLayout>
  );
}
