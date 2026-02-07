'use client';

import { useState } from 'react';
import { BookingFormData, BookingType } from '@/lib/booking/types';

interface BookingFormProps {
  date: string;
  time: string;
  onSubmit: (data: BookingFormData) => void;
  loading?: boolean;
  bookingType?: BookingType;
  translations: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    companyName: string;
    companyNamePlaceholder: string;
    industry: string;
    industryPlaceholder: string;
    employeeCount: string;
    employeeCountPlaceholder: string;
    challenge: string;
    challengePlaceholder: string;
    referralSource: string;
    referralSourcePlaceholder: string;
    websiteUrl: string;
    websiteUrlPlaceholder: string;
    yourInfo: string;
    aboutBusiness: string;
    submit: string;
    submitting: string;
    submitAssessment: string;
    submittingAssessment: string;
    assessmentDuration: string;
    required: string;
  };
}

export default function BookingForm({
  date,
  time,
  onSubmit,
  loading = false,
  bookingType = 'consultation',
  translations,
}: BookingFormProps) {
  const isAssessment = bookingType === 'assessment';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [challenge, setChallenge] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format date and time for display
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = (() => {
    const [hours, mins] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  })();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Please enter your full name';
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!companyName.trim() || companyName.trim().length < 2) {
      newErrors.companyName = 'Please enter your company name';
    }

    if (!industry.trim() || industry.trim().length < 2) {
      newErrors.industry = 'Please enter your industry';
    }

    if (!employeeCount.trim()) {
      newErrors.employeeCount = 'Please enter your number of employees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    onSubmit({
      date,
      time,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      companyName: companyName.trim(),
      industry: industry.trim(),
      employeeCount: employeeCount.trim(),
      challenge: challenge.trim() || undefined,
      referralSource: referralSource.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      timezone,
      bookingType,
    });
  };

  return (
    <div className="w-full">
      {/* Booking Summary */}
      <div className="mb-6 p-4 bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{formattedDate}</p>
            <p className="text-sm text-white/60">{formattedTime} ({isAssessment ? translations.assessmentDuration : '30 min'})</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Your Information */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">{translations.yourInfo}</h3>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="booking-name" className="block text-sm font-medium mb-2">
                {translations.name} <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="booking-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={translations.namePlaceholder}
                disabled={loading}
                className={`
                  w-full input-glass
                  ${errors.name ? 'border-[#EF4444]' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="booking-email" className="block text-sm font-medium mb-2">
                {translations.email} <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="booking-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translations.emailPlaceholder}
                disabled={loading}
                className={`
                  w-full input-glass
                  ${errors.email ? 'border-[#EF4444]' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.email}</p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label htmlFor="booking-phone" className="block text-sm font-medium mb-2">
                {translations.phone}
              </label>
              <input
                id="booking-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={translations.phonePlaceholder}
                disabled={loading}
                className="w-full input-glass disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section: About Your Business */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">{translations.aboutBusiness}</h3>
          <div className="space-y-4">
            {/* Company Name Field */}
            <div>
              <label htmlFor="booking-company" className="block text-sm font-medium mb-2">
                {translations.companyName} <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="booking-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={translations.companyNamePlaceholder}
                disabled={loading}
                className={`
                  w-full input-glass
                  ${errors.companyName ? 'border-[#EF4444]' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.companyName}</p>
              )}
            </div>

            {/* Industry Field */}
            <div>
              <label htmlFor="booking-industry" className="block text-sm font-medium mb-2">
                {translations.industry} <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="booking-industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder={translations.industryPlaceholder}
                disabled={loading}
                className={`
                  w-full input-glass
                  ${errors.industry ? 'border-[#EF4444]' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.industry}</p>
              )}
            </div>

            {/* Employee Count Field */}
            <div>
              <label htmlFor="booking-employees" className="block text-sm font-medium mb-2">
                {translations.employeeCount} <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="booking-employees"
                type="text"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder={translations.employeeCountPlaceholder}
                disabled={loading}
                className={`
                  w-full input-glass
                  ${errors.employeeCount ? 'border-[#EF4444]' : ''}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.employeeCount && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.employeeCount}</p>
              )}
            </div>

            {/* Challenge Field (Optional) */}
            <div>
              <label htmlFor="booking-challenge" className="block text-sm font-medium mb-2">
                {translations.challenge}
              </label>
              <textarea
                id="booking-challenge"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder={translations.challengePlaceholder}
                disabled={loading}
                rows={3}
                className="w-full input-glass resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Referral Source Field (Optional) */}
            <div>
              <label htmlFor="booking-referral" className="block text-sm font-medium mb-2">
                {translations.referralSource}
              </label>
              <input
                id="booking-referral"
                type="text"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder={translations.referralSourcePlaceholder}
                disabled={loading}
                className="w-full input-glass disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Website URL Field (Optional) */}
            <div>
              <label htmlFor="booking-website" className="block text-sm font-medium mb-2">
                {translations.websiteUrl}
              </label>
              <input
                id="booking-website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder={translations.websiteUrlPlaceholder}
                disabled={loading}
                className="w-full input-glass disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Required Fields Note */}
        <p className="text-xs text-white/40">
          <span className="text-[#F97316]">*</span> {translations.required}
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isAssessment ? translations.submittingAssessment : translations.submitting}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isAssessment ? translations.submitAssessment : translations.submit}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
