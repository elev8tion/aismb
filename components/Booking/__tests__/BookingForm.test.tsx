import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from '../BookingForm';

const defaultTranslations = {
  name: 'Full Name',
  namePlaceholder: 'John Doe',
  email: 'Email Address',
  emailPlaceholder: 'john@company.com',
  phone: 'Phone Number',
  phonePlaceholder: '(555) 123-4567',
  companyName: 'Company Name',
  companyNamePlaceholder: 'Acme Inc',
  industry: 'Industry',
  industryPlaceholder: 'Technology',
  employeeCount: 'Number of Employees',
  employeeCountPlaceholder: '10-50',
  challenge: 'Biggest Challenge',
  challengePlaceholder: 'Tell us about your biggest challenge',
  referralSource: 'How did you hear about us?',
  referralSourcePlaceholder: 'Google, referral, etc.',
  websiteUrl: 'Website URL',
  websiteUrlPlaceholder: 'https://yourcompany.com',
  yourInfo: 'Your Information',
  aboutBusiness: 'About Your Business',
  submit: 'Confirm Consultation',
  submitting: 'Scheduling...',
  submitAssessment: 'Confirm Assessment',
  submittingAssessment: 'Scheduling Assessment...',
  assessmentDuration: '3 hrs',
  required: 'Required fields',
  termsAgreement: 'I agree to the <terms>Terms of Service</terms> and <refund>Refund Policy</refund>',
  termsRequired: 'You must agree to the Terms of Service and Refund Policy',
};

describe('BookingForm', () => {
  const onSubmit = vi.fn();

  it('renders terms checkbox', () => {
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} translations={defaultTranslations} />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders terms link to /terms', () => {
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} translations={defaultTranslations} />
    );
    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });

  it('renders refund link to /refund-policy', () => {
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} translations={defaultTranslations} />
    );
    const refundLink = screen.getByText('Refund Policy');
    expect(refundLink.closest('a')).toHaveAttribute('href', '/refund-policy');
  });

  it('shows error when terms not checked and form submitted', async () => {
    const user = userEvent.setup();
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} translations={defaultTranslations} />
    );

    // Fill all required fields
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Smith');
    await user.type(screen.getByPlaceholderText('john@company.com'), 'jane@test.com');
    await user.type(screen.getByPlaceholderText('Acme Inc'), 'Test Corp');
    await user.type(screen.getByPlaceholderText('Technology'), 'SaaS');
    await user.type(screen.getByPlaceholderText('10-50'), '25');

    // Submit without checking terms
    await user.click(screen.getByText('Confirm Consultation'));

    expect(screen.getByText(defaultTranslations.termsRequired)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when form is valid with terms checked', async () => {
    const user = userEvent.setup();
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} translations={defaultTranslations} />
    );

    // Fill required fields
    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Smith');
    await user.type(screen.getByPlaceholderText('john@company.com'), 'jane@test.com');
    await user.type(screen.getByPlaceholderText('Acme Inc'), 'Test Corp');
    await user.type(screen.getByPlaceholderText('Technology'), 'SaaS');
    await user.type(screen.getByPlaceholderText('10-50'), '25');

    // Check terms
    await user.click(screen.getByRole('checkbox'));

    // Submit
    await user.click(screen.getByText('Confirm Consultation'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Jane Smith',
      email: 'jane@test.com',
      companyName: 'Test Corp',
    });
  });

  it('shows loading state', () => {
    render(
      <BookingForm date="2026-03-15" time="09:00" onSubmit={onSubmit} loading translations={defaultTranslations} />
    );
    expect(screen.getByText('Scheduling...')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /scheduling/i });
    expect(button).toBeDisabled();
  });

  it('shows formatted date and time', () => {
    render(
      <BookingForm date="2026-03-15" time="14:30" onSubmit={onSubmit} translations={defaultTranslations} />
    );
    expect(screen.getByText('Sunday, March 15')).toBeInTheDocument();
    expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
  });

  it('shows assessment duration for assessment type', () => {
    render(
      <BookingForm
        date="2026-03-15"
        time="09:00"
        onSubmit={onSubmit}
        bookingType="assessment"
        translations={defaultTranslations}
      />
    );
    expect(screen.getByText(/3 hrs/)).toBeInTheDocument();
  });
});
