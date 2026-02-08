import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useTranslations: () => ({
    t: {
      footer: {
        tagline: 'Agentic systems for SMBs.',
        sections: {
          solutions: 'Solutions',
          company: 'Company',
          resources: 'Resources',
        },
        links: {
          solutions: [
            { label: 'Customer Communication Agents', href: '#solutions' },
          ],
          company: [
            { label: 'About', href: '#how-it-works' },
          ],
          resources: [
            { label: 'ROI Calculator', href: '#roi-calculator' },
          ],
        },
        copyright: 'elev8tion. All rights reserved.',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        aiDisclosure: 'AI Disclosure',
        refundPolicy: 'Refund Policy',
      },
    },
    language: 'en' as const,
    setLanguage: vi.fn(),
  }),
}));

describe('Footer', () => {
  it('renders privacy policy link with correct href', () => {
    render(<Footer />);
    const link = screen.getByText('Privacy Policy');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('renders terms of service link with correct href', () => {
    render(<Footer />);
    const link = screen.getByText('Terms of Service');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/terms');
  });

  it('renders AI disclosure link with correct href', () => {
    render(<Footer />);
    const link = screen.getByText('AI Disclosure');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/ai-disclosure');
  });

  it('renders refund policy link with correct href', () => {
    render(<Footer />);
    const link = screen.getByText('Refund Policy');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/refund-policy');
  });

  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/elev8tion\. All rights reserved\./)).toBeInTheDocument();
  });

  it('renders section headers', () => {
    render(<Footer />);
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
});
