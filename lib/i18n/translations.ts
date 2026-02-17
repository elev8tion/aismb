export type Language = 'en' | 'es';

export interface Translations {
  nav: {
    solutions: string;
    howItWorks: string;
    pricing: string;
    caseStudies: string;
    contact: string;
    getStarted: string;
    openMenu: string;
    closeMenu: string;
  };

  hero: {
    badge: string;
    titlePart1: string;
    titleHighlight: string;
    titlePart2: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: {
      agentsBuilt: { value: string; label: string };
      toMastery: { value: string; label: string };
      smbsBuilding: { value: string; label: string };
      buildIndependently: { value: string; label: string };
    };
  };

  socialProof: {
    heading: string;
    companies: Array<{ name: string; industry: string }>;
  };

  problem: {
    tag: string;
    heading: string;
    description: string;
    painPoints: Array<{
      title: string;
      description: string;
      stat: string;
    }>;
  };

  howItWorks: {
    tag: string;
    heading: string;
    description: string;
    subDescription: string;
    steps: Array<{
      step: string;
      title: string;
      description: string;
      duration: string;
      deliverable: string;
    }>;
    youllGet: string;
    features: string[];
  };

  useCases: {
    tag: string;
    heading: string;
    description: string;
    complexityLevels: Array<{ id: string; name: string }>;
    systems: Array<{
      id: number;
      complexity: string;
      name: string;
      description: string;
      whatYouLearn: string;
      industries: string;
      capabilities: string[];
    }>;
    youllLearn: string;
    bottomNote: string;
  };

  caseStudies: {
    tag: string;
    heading: string;
    description: string;
    cases: Array<{
      company: string;
      industry: string;
      revenue: string;
      employees: string;
      tier: string;
      investment: string;
      timeline: string;
      challenge: string;
      systemsBuilt: string[];
      results: {
        timeSaved: string;
        revenueImpact: string;
        customerSat: string;
        roi: string;
        roiPeriod: string;
        totalValue: string;
      };
      quote: string;
      owner: string;
    }>;
    labels: {
      challenge: string;
      partnershipTier: string;
      systemsBuiltTogether: string;
      measurableResults: string;
      timeSaved: string;
      roiIn: string;
      totalValueCreated: string;
      revenueImpact: string;
      customerExperience: string;
      owner: string;
    };
    bottomStats: {
      heading: string;
      description: string;
      stats: Array<{ stat: string; label: string }>;
      note: string;
    };
  };

  roiCalculator: {
    tag: string;
    heading: string;
    description: string;
    labels: {
      industry: string;
      businessSize: string;
      hourlyLaborCost: string;
      partnershipTier: string;
    };
    hourlyLaborCostNote: string;
    industries: Array<{ id: string; name: string }>;
    employeeSizes: Array<{ id: string; name: string }>;
    tiers: Array<{ id: string; name: string }>;
    tasks: {
      scheduling: string;
      communication: string;
      dataEntry: string;
      leadResponse: string;
      reporting: string;
      inventory: string;
      socialMedia: string;
    };
    steps: {
      labels: string[];
      next: string;
      back: string;
      seeResults: string;
      basics: { title: string; subtitle: string };
      timeAudit: { title: string; subtitle: string; totalWeeklyHours: string };
      revenue: {
        title: string;
        subtitle: string;
        monthlyRevenue: string;
        avgDealValue: string;
        lostLeads: string;
        closeRate: string;
      };
      results: { title: string; subtitle: string };
    };
    results: {
      heading: string;
      timeSaved: string;
      weeklyValue: string;
      investment: string;
      tasksAutomated: string;
      revenueRecovery: string;
      recoveredLeadsLabel: string;
      annualBenefit: string;
      yourRoi: string;
      paysForItself: string;
      continuesGenerating: string;
      automatedTasksLabel: string;
      weeksShort: string;
      monthsShort: string;
      paybackLabel: string;
    };
    inputSummary: {
      title: string;
      industry: string;
      teamSize: string;
      hourlyRate: string;
      weeklyHours: string;
      monthlyRevenue: string;
      lostLeads: string;
    };
    emailCapture: {
      heading: string;
      placeholder: string;
      send: string;
      sending: string;
      note: string;
      success: string;
    };
    comparison: {
      heading: string;
      traditionalConsultant: string;
      consultantRate: string;
      doneForYou: string;
      agencyRate: string;
      aiSmbPartners: string;
      savePercent: string;
      ownCapability: string;
    };
    cta: string;
    disclaimer: string;
  };

  pricing: {
    tag: string;
    heading: string;
    description: string;
    afterMinimum: string;
    tiers: Array<{
      name: string;
      subtitle: string;
      setupFee: string;
      monthlyFee: string;
      minimumTerm: string;
      description: string;
      includes?: string;
      features: string[];
      outcome: string;
      cta: string;
      highlighted: boolean;
      roiText?: string;
    }>;
    labels: {
      capabilityTransfer: string;
      monthPartnership: string;
      minimumForLearning: string;
      recommended: string;
      typicalRoi: string;
      yourOutcome: string;
      seeCapabilityRoi: string;
      flexibleLearning: string;
      flexibleLearningText: string;
      includes: string;
    };
    guarantee: {
      title: string;
      description: string;
      items: string[];
    };
  };

  faq: {
    tag: string;
    heading: string;
    description: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
    contact: {
      question: string;
      cta: string;
    };
  };

  finalCta: {
    badge: string;
    heading: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustSignals: Array<{ icon: string; label: string }>;
  };

  footer: {
    tagline: string;
    sections: {
      solutions: string;
      company: string;
      resources: string;
    };
    links: {
      solutions: Array<{ label: string; href: string }>;
      company: Array<{ label: string; href: string }>;
      resources: Array<{ label: string; href: string }>;
    };
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    aiDisclosure: string;
    refundPolicy: string;
  };

  voiceAgent: {
    states: {
      idle: { title: string; description: string };
      listening: { title: string; description: string };
      processing: { title: string; description: string };
      speaking: { title: string; description: string };
    };
    transcript: string;
    aiResponse: string;
    yourQuestion: string;
    autoClose: {
      prompt: string;
      seconds: string;
      askAnother: string;
      stayOpen: string;
    };
    buttons: {
      stop: string;
      close: string;
    };
    hint: string;
    errors: {
      notSupported: string;
    };
    textInput: {
      email: string;
      name: string;
      phone: string;
      company: string;
      industry: string;
    };
  };

  languageSwitcher: {
    label: string;
  };

  booking: {
    title: string;
    selectDate: string;
    selectTime: string;
    enterDetails: string;
    typeSelection: {
      heading: string;
      orDivider: string;
      alreadyCertain: string;
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
        process: string[];
        whyPaid: string;
        cta: string;
      };
    };
    form: {
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
      termsAgreement: string;
      termsRequired: string;
    };
    confirmation: {
      title: string;
      subtitle: string;
      date: string;
      time: string;
      duration: string;
      email: string;
      addToCalendar: string;
      googleCalendar: string;
      appleCalendar: string;
      outlookCalendar: string;
      done: string;
      confirmationSent: string;
    };
    paymentSuccess: {
      title: string;
      subtitle: string;
      amount: string;
      whatToExpect: string;
      expectItems: string[];
      strategyDocNote: string;
      addToCalendar: string;
      googleCalendar: string;
      appleCalendar: string;
      outlookCalendar: string;
      backToHome: string;
      error: string;
      processing: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      solutions: 'Solutions',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      caseStudies: 'Case Studies',
      contact: 'Contact',
      getStarted: 'Get Started',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },

    hero: {
      badge: 'Guardrailed AI Infrastructure — Secured, Deployed, Monitored',
      titlePart1: 'Stop Renting Your',
      titleHighlight: "Business's Brain.",
      titlePart2: 'Own It.',
      description:
        "The era of paying monthly for admin staff and bloated software is over. We replace your overhead with secure, sovereign AI agents that you own forever.",
      ctaPrimary: 'Calculate Your Overhead Savings',
      ctaSecondary: 'Deploy Voice Agent',
      stats: {
        agentsBuilt: { value: '24/7', label: 'Agent Uptime' },
        toMastery: { value: '<100ms', label: 'Response Latency' },
        smbsBuilding: { value: '0', label: 'Vendor Lock-in' },
        buildIndependently: { value: '100%', label: 'You Own the Code' },
      },
    },

    socialProof: {
      heading: 'Industries We Deploy Into',
      companies: [
        { name: 'HVAC & Plumbing', industry: 'Home Services' },
        { name: 'General Contractors', industry: 'Construction' },
        { name: 'Property Managers', industry: 'Real Estate' },
        { name: 'Electrical & Trades', industry: 'Field Services' },
        { name: 'Professional Services', industry: 'Agencies & Consultants' },
      ],
    },

    problem: {
      tag: 'The Bleeding',
      heading: "You're paying for overhead you don't need",
      description:
        "Every month you pay for admin salaries, bloated SaaS seats, and answering services—while missing leads. We surgically replace that overhead with AI infrastructure you own.",
      painPoints: [
        {
          title: 'You Are Bleeding Monthly Fees.',
          description:
            "Why pay $50/user for software or $3,000/mo for an admin? AI agents do the same work for pennies on the dollar. Stop renting capability and start owning it.",
          stat: '$120K+/year overhead',
        },
        {
          title: 'Cheap Bots Create Lawsuits.',
          description:
            "Most agencies deploy chatbots that hallucinate fake discounts or leak client data. We build 'Guardrailed Infrastructure' that protects your reputation and your balance sheet.",
          stat: '62% have no guardrails',
        },
        {
          title: "If It's Slow, You Lose the Lead.",
          description:
            "The average SMB misses 20-30% of inbound calls. Each missed HVAC job is $400 gone. Our latency-optimized agents answer instantly, 24/7. No sick days. No voicemail.",
          stat: '23% of calls missed',
        },
        {
          title: 'Complexity Is Where Hackers Live.',
          description:
            "Agencies bolt AI onto your existing stack and call it done. We audit your entire data flow, deploy behind a security perimeter, and test for vulnerabilities before going live.",
          stat: '3x breach risk with cheap tools',
        },
      ],
    },

    howItWorks: {
      tag: 'Deployment Process',
      heading: 'Three steps to secured, deployed infrastructure',
      description:
        "We don't teach—we install, secure, and monitor. Your AI infrastructure is live before you've finished your first cup of coffee.",
      subDescription:
        "Every deployment goes through our three-phase process: audit, install, and activate monitoring. No shortcuts. No 'wrapper' tools.",
      steps: [
        {
          step: '01',
          title: 'The Vulnerability Audit',
          description:
            "We audit your P&L to find exactly which software subscriptions and admin tasks can be replaced. We identify the 'bleeding'—every dollar leaking out of your operation unnecessarily.",
          duration: 'Week 1',
          deliverable: 'Full cost-of-overhead report + replacement roadmap',
        },
        {
          step: '02',
          title: 'Secure Installation',
          description:
            "We deploy your agents behind a security perimeter. We test for hallucinations and data leaks before going live. Your infrastructure passes our Active Defense checklist before it touches a customer.",
          duration: 'Week 2-4',
          deliverable: 'Live AI agents + security audit sign-off',
        },
        {
          step: '03',
          title: 'Active Monitoring',
          description:
            "We don't just hand you the keys. We monitor the system 24/7 to ensure uptime and adapt to new threats. You get monthly reports. Your agents get smarter over time.",
          duration: 'Ongoing',
          deliverable: '24/7 uptime dashboard + monthly performance reports',
        },
      ],
      youllGet: "You'll Receive:",
      features: ['Zero vendor lock-in', 'Hallucination guardrails', 'Active monitoring', '24/7 uptime'],
    },

    useCases: {
      tag: 'Infrastructure Stack',
      heading: 'Sovereign AI assets—deployed and owned by you',
      description:
        "These aren't tools you rent. These are infrastructure assets we install in your business. Built to spec, guardrailed for safety, and monitored around the clock.",
      complexityLevels: [
        { id: 'all', name: 'All Infrastructure' },
        { id: 'beginner', name: 'Revenue' },
        { id: 'intermediate', name: 'Operations' },
        { id: 'advanced', name: 'Enterprise' },
      ],
      systems: [
        {
          id: 1,
          complexity: 'beginner',
          name: 'The Revenue Guard',
          description:
            'Latency-optimized voice & text agents that answer calls, qualify leads, and book appointments instantly. Zero missed revenue. Replaces your answering service at a fraction of the cost.',
          whatYouLearn: 'Instant call pickup, lead qualification, appointment booking',
          industries: 'Any customer-facing business',
          capabilities: ['24/7 availability', 'Instant pickup', 'Lead qualification'],
        },
        {
          id: 2,
          complexity: 'beginner',
          name: 'Sovereign Workflow Protocol',
          description:
            'Automates invoicing, data entry, and dispatching. Replaces the need for expensive per-seat licenses on tools like Zapier or Salesforce. Zero-trust data integration.',
          whatYouLearn: 'Invoicing automation, dispatch logic, CRM replacement',
          industries: 'Operations-heavy businesses',
          capabilities: ['Invoice automation', 'Auto-dispatch', 'Seat-license elimination'],
        },
        {
          id: 3,
          complexity: 'intermediate',
          name: 'Intelligent Document Processor',
          description:
            'Reads proposals, invoices, and contracts—extracts critical data, routes for action, and logs everything with a full audit trail. Liability-protected by design.',
          whatYouLearn: 'Document AI, data extraction, audit trails',
          industries: 'Construction, legal, property management',
          capabilities: ['OCR + Understanding', 'Audit trail', 'Smart routing'],
        },
        {
          id: 4,
          complexity: 'intermediate',
          name: 'Predictive Operations Analyst',
          description:
            'Data-driven agents that analyze sales patterns, forecast cash flow, identify overhead reduction opportunities, and alert you before problems compound.',
          whatYouLearn: 'Cost analysis, forecasting, overhead identification',
          industries: 'Any data-driven business',
          capabilities: ['Overhead alerts', 'Cash flow forecasting', 'Opportunity detection'],
        },
        {
          id: 5,
          complexity: 'advanced',
          name: 'Liability-Guarded Operations',
          description:
            'Complex multi-agent systems with built-in security audits. Ensures your AI never promises something it cannot deliver. Full hallucination guardrails and compliance logging.',
          whatYouLearn: 'Multi-agent coordination, security auditing, compliance',
          industries: 'Complex operations businesses',
          capabilities: ['Hallucination guardrails', 'Compliance logging', 'Security audits'],
        },
        {
          id: 6,
          complexity: 'advanced',
          name: 'Enterprise Fortress Stack',
          description:
            'Full multi-agent swarm with edge-compute optimization. You own the code, weights, and data. Unlimited scale. Audit-ready compliance. No vendor lock-in.',
          whatYouLearn: 'Edge computing, data sovereignty, enterprise compliance',
          industries: 'Scaling businesses ($2M+ revenue)',
          capabilities: ['Full data sovereignty', 'Edge compute', 'Unlimited scale'],
        },
      ],
      youllLearn: "Infrastructure Spec:",
      bottomNote:
        "Every deployment is custom-built for your operations. We audit first, install second, monitor always. These are assets—not subscriptions.",
    },

    caseStudies: {
      tag: "What's Possible",
      heading: 'Projected outcomes by business type',
      description:
        'These projections are built from our overhead savings calculator. Input your real numbers above to see your specific opportunity.',
      cases: [
        {
          company: 'Home Service Business',
          industry: 'HVAC / Plumbing / Electrical',
          revenue: '$800K–$2M annual revenue',
          employees: '3–10 employees',
          tier: 'The Revenue Guard',
          investment: '$2,500 setup + $750/mo',
          timeline: 'Week 1–4 deployment',
          challenge:
            '$3,000/mo admin staff cost + 20 missed calls/week at $400 avg job = over $28K/mo in recoverable opportunity sitting on the table.',
          systemsBuilt: [
            '24/7 Voice Agent - Instant call pickup, lead qualification, appointment booking',
            'Dispatch Notification - Auto-routes jobs to field crew via SMS',
            'Missed Call Recovery - Automated follow-up in under 60 seconds',
          ],
          results: {
            timeSaved: '$3,000/mo eliminated',
            revenueImpact: 'Up to $40K/yr in recovered call revenue',
            customerSat: 'Sub-100ms pickup vs. 4-hour voicemail callback',
            roi: '220',
            roiPeriod: '3 months (projected)',
            totalValue: 'Up to $69K/yr',
          },
          quote:
            'Projection assumes $3,000/mo admin overhead, 20 missed calls/week at $400 avg job value, 60% call capture, 35% close rate. Use the calculator above to model your actual numbers.',
          owner: '',
        },
        {
          company: 'Professional Services Firm',
          industry: 'Agency / Consulting / Legal',
          revenue: '$500K–$1.5M annual revenue',
          employees: '2–8 employees',
          tier: 'The Operations Sovereign',
          investment: '$5,000 setup + $1,500/mo',
          timeline: 'Week 1–6 deployment',
          challenge:
            '$2,000/mo in per-seat SaaS subscriptions + 10 hrs/week on manual invoicing, proposals, and follow-ups — hidden overhead that compounds every quarter.',
          systemsBuilt: [
            'Sovereign Workflow Protocol - Eliminates per-seat SaaS licenses',
            'Intelligent Document Processor - Auto-extracts data from proposals and contracts',
            'Client Follow-up Agent - Automated nurture and re-engagement sequences',
          ],
          results: {
            timeSaved: '~$3,500/mo overhead eliminated',
            revenueImpact: '3x proposal throughput at the same headcount',
            customerSat: 'Same-day response vs. 2-day manual turnaround',
            roi: '185',
            roiPeriod: '4 months (projected)',
            totalValue: 'Up to $83K/yr',
          },
          quote:
            'Projection assumes $2,000/mo software overhead, $1,500/mo admin time, Operations Sovereign tier. Actual results depend on your specific stack and workflow complexity.',
          owner: '',
        },
        {
          company: 'Operations-Heavy Business',
          industry: 'Property / Construction / Logistics',
          revenue: '$2M–$5M annual revenue',
          employees: '10–25 employees',
          tier: 'The Enterprise Fortress',
          investment: '$12,000 setup + $3,000/mo',
          timeline: 'Week 1–8 deployment',
          challenge:
            '$8,000/mo in combined admin and software overhead. Manual dispatch, reporting, and document processing are the bottleneck preventing the next stage of growth.',
          systemsBuilt: [
            'Predictive Operations Analyst - Cash flow forecasting and overhead alerts',
            'Liability-Guarded Operations - Multi-agent coordination with compliance logging',
            'Enterprise Fortress Stack - Full data sovereignty, edge compute, no vendor lock-in',
          ],
          results: {
            timeSaved: '~$8,000/mo overhead eliminated',
            revenueImpact: 'Eliminates 2–3 FTE equivalent in admin overhead',
            customerSat: 'Sub-second dispatch decisions vs. manual routing',
            roi: '310',
            roiPeriod: '6 months (projected)',
            totalValue: 'Up to $192K/yr',
          },
          quote:
            'Projection assumes $5,000/mo admin payroll + $3,000/mo software overhead, Enterprise Fortress tier. Use the calculator to model your actual overhead and missed revenue.',
          owner: '',
        },
      ],
      labels: {
        challenge: 'Overhead Scenario:',
        partnershipTier: 'Infrastructure Tier',
        systemsBuiltTogether: 'What Gets Deployed',
        measurableResults: 'Projected Outcomes',
        timeSaved: 'Overhead Eliminated',
        roiIn: 'Projected ROI in',
        totalValueCreated: 'Annual Value Potential',
        revenueImpact: 'Revenue Upside',
        customerExperience: 'Speed Improvement',
        owner: '',
      },
      bottomStats: {
        heading: 'Why the Numbers Work',
        description:
          'Industry benchmarks that inform our overhead calculator projections',
        stats: [
          { stat: '23%', label: 'Avg Inbound Calls Missed (SMBs)' },
          { stat: '60%', label: 'Overhead Reduction Potential' },
          { stat: '68%', label: 'SMBs Now Using AI Tools' },
          { stat: '<100ms', label: 'Agent Response Latency' },
        ],
        note: "Projections are based on your actual overhead inputs and industry-validated automation rates. Use the calculator above to see your specific numbers.",
      },
    },

    roiCalculator: {
      tag: 'Overhead Savings Calculator',
      heading: 'Calculate Your Annual Capital Recaptured',
      description:
        'Enter your real overhead costs and missed revenue. See exactly how much capital we can put back in your pocket.',
      labels: {
        industry: 'Industry',
        businessSize: 'Business Size',
        hourlyLaborCost: 'Hourly Labor Cost',
        partnershipTier: 'Partnership Tier',
      },
      hourlyLaborCostNote: 'Average blended cost per hour of staff time (wages + overhead)',
      industries: [
        { id: 'other', name: 'Other/Custom Business' },
        { id: 'service', name: 'Service Business' },
        { id: 'professional', name: 'Professional Services' },
        { id: 'retail', name: 'Retail/Hospitality' },
        { id: 'realestate', name: 'Real Estate/Property' },
        { id: 'construction', name: 'Construction/Trades' },
      ],
      employeeSizes: [
        { id: '1-5', name: '1-5 employees' },
        { id: '5-10', name: '5-10 employees' },
        { id: '10-25', name: '10-25 employees' },
        { id: '25-50', name: '25-50 employees' },
      ],
      tiers: [
        { id: 'discovery', name: 'AI Discovery' },
        { id: 'foundation', name: 'Foundation Builder' },
        { id: 'architect', name: 'Systems Architect' },
      ],
      tasks: {
        scheduling: 'Scheduling & Appointments',
        communication: 'Customer Communication & Follow-up',
        dataEntry: 'Data Entry, Invoicing & Bookkeeping',
        leadResponse: 'Lead Response & Qualification',
        reporting: 'Reporting & Analytics',
        inventory: 'Inventory / Supply Tracking',
        socialMedia: 'Social Media & Marketing',
      },
      steps: {
        labels: ['Overhead', 'Missed Revenue', 'Tier', 'Results'],
        next: 'Next',
        back: 'Back',
        seeResults: 'Calculate Savings',
        basics: {
          title: 'Current Overhead Costs',
          subtitle: "Tell us what you're paying for admin and software right now.",
        },
        timeAudit: {
          title: 'Missed Revenue',
          subtitle: 'Estimate the calls and leads slipping through the cracks each week.',
          totalWeeklyHours: 'Total missed opportunities',
        },
        revenue: {
          title: 'Revenue Impact',
          subtitle: 'Help us estimate the revenue you could recover.',
          monthlyRevenue: 'Monthly Revenue',
          avgDealValue: 'Average Job / Deal Value',
          lostLeads: 'Missed Calls Per Week',
          closeRate: 'Close Rate',
        },
        results: {
          title: 'Capital Recaptured',
          subtitle: "Here's the overhead we eliminate and the revenue we recover.",
        },
      },
      results: {
        heading: 'Total Annual Capital Recaptured',
        timeSaved: 'Admin Hours Eliminated',
        weeklyValue: 'Fixed Monthly Savings',
        investment: 'Monthly Infrastructure Fee',
        tasksAutomated: 'Overhead Lines Eliminated',
        revenueRecovery: 'Recovered Revenue',
        recoveredLeadsLabel: 'leads captured/mo',
        annualBenefit: 'Annual Capital Recaptured',
        yourRoi: 'Your ROI',
        paysForItself: 'Infrastructure pays for itself in ~',
        continuesGenerating: 'weeks, then generates pure profit',
        automatedTasksLabel: 'Overhead Lines Replaced',
        weeksShort: 'wks',
        monthsShort: 'mo',
        paybackLabel: 'Payback Period',
      },
      inputSummary: {
        title: 'Your Inputs',
        industry: 'Industry',
        teamSize: 'Team Size',
        hourlyRate: 'Hourly Rate',
        weeklyHours: 'Weekly Hours',
        monthlyRevenue: 'Monthly Revenue',
        lostLeads: 'Lost Leads/mo',
      },
      emailCapture: {
        heading: 'Email me this full report',
        placeholder: 'Enter your email',
        send: 'Send',
        sending: 'Sending...',
        note: "We'll send a detailed breakdown of your potential ROI. No spam.",
        success: 'Report sent successfully! Check your inbox.',
      },
      comparison: {
        heading: 'Compare Alternatives (Annual)',
        traditionalConsultant: 'Traditional Consultant',
        consultantRate: '$175/hr × your saved hours',
        doneForYou: 'Done-for-you Agency',
        agencyRate: '$6,500/mo × 12',
        aiSmbPartners: 'AI KRE8TION Partners',
        savePercent: 'Save ',
        ownCapability: '% vs alternatives + you own the capability forever',
      },
      cta: 'Deploy My Infrastructure',
      disclaimer:
        'Calculations use your inputs to estimate fixed overhead savings and recovered revenue. Fixed savings = (Payroll + Software) minus our monthly fee. Revenue recovery assumes 60% call capture rate and 35% close rate. Actual results vary by business and implementation.',
    },

    pricing: {
      tag: 'Infrastructure Investment',
      heading: 'Own Your AI. Pay for Results.',
      description:
        'Sovereign AI infrastructure—deployed, secured, and monitored by us. No vendor lock-in. No monthly seat fees. Full ownership.',
      afterMinimum:
        "After the minimum term, the infrastructure is yours. Most clients continue month-to-month — AI models evolve, integrations update, and active monitoring keeps your ROI compounding. Cancel anytime.",
      tiers: [
        {
          name: 'The Revenue Guard',
          subtitle: 'Voice Infrastructure',
          setupFee: '$2,500',
          monthlyFee: '$750',
          minimumTerm: '2 months',
          description: 'One latency-optimized voice agent that answers 24/7, qualifies leads, and books appointments. Capture 100% of leads. Zero missed revenue.',
          includes: 'Revenue Guard voice agent deployed, monitored & infrastructure bundled',
          features: [
            'Replaces your answering service ($500/mo value)',
            'Captures ~$5K/mo in otherwise-lost leads',
            '24/7 availability — no sick days, no voicemail',
            'Hallucination guardrails (liability protection)',
            'Instant-pickup latency optimization',
            'Lead qualification & appointment booking',
            'API & hosting costs bundled — no surprise bills',
            'Monthly performance reports',
          ],
          outcome: 'Capture 100% of leads. Zero missed revenue.',
          cta: 'Deploy Voice Agent',
          highlighted: false,
          roiText: 'Replaces $500+/mo answering service',
        },
        {
          name: 'The Operations Sovereign',
          subtitle: 'Back-Office Stack',
          setupFee: '$5,000',
          monthlyFee: '$1,500',
          minimumTerm: '3 months',
          description: 'Voice Agent + 3 Workflow Agents (Invoicing, Scheduling, Dispatch). Cut overhead by 60%. Eliminate data entry and per-user software fees.',
          includes: 'Revenue Guard + 3 Sovereign Workflow agents, infrastructure bundled',
          features: [
            'Everything in The Revenue Guard',
            'Replaces 1 full-time admin ($40K/yr savings)',
            'Eliminates per-user software seat fees',
            '20+ hours/week returned to the owner',
            'Invoicing, scheduling & dispatch automation',
            'Zero-trust CRM and bank data integration',
            'API & hosting costs bundled — no separate infrastructure invoices',
            'Active defense monitoring 24/7',
          ],
          outcome: 'Cut overhead by 60%. Eliminate data entry.',
          cta: 'Replace Admin Work',
          highlighted: true,
          roiText: 'Replaces $40K/yr admin salary',
        },
        {
          name: 'The Enterprise Fortress',
          subtitle: 'Full Autonomy',
          setupFee: '$12,000',
          monthlyFee: '$3,000',
          minimumTerm: '6 months',
          description: 'Multi-agent swarm with edge-compute optimization. Scale without headcount. Full code, weights, and data sovereignty. You hold your own API accounts — true independence at every layer.',
          includes: 'Full multi-agent stack + sovereignty package + pass-through API model',
          features: [
            'Everything in The Operations Sovereign',
            'Client-owned API accounts — you hold your OpenAI, Twilio & infra credentials',
            'Audit-ready compliance & security documentation',
            'Unlimited scale — handle 10K+ interactions simultaneously',
            'Full sovereignty: you own the code, weights, and data',
            'Edge-compute optimization for maximum speed',
            'Dedicated active defense team',
            'Quarterly security audits',
          ],
          outcome: 'Scale without headcount. Institutional security.',
          cta: 'Build Infrastructure',
          highlighted: false,
          roiText: 'Eliminates scaling bottlenecks at $2M+ revenue',
        },
        {
          name: 'Custom Enterprise',
          subtitle: 'Bespoke deployment',
          setupFee: 'Custom',
          monthlyFee: 'Custom',
          minimumTerm: 'Custom',
          description: 'Multi-location, complex integration, or industry-specific compliance requirements. Fully bespoke infrastructure design.',
          features: [
            'Everything in The Enterprise Fortress',
            'Multi-location deployment',
            'Industry-specific compliance (HIPAA, SOC2, etc.)',
            'Dedicated infrastructure architect',
            'White-glove implementation',
            'Custom SLA and uptime guarantees',
          ],
          outcome: 'Full AI-native operation with bespoke infrastructure',
          cta: 'Contact Us',
          highlighted: false,
        },
      ],
    labels: {
      capabilityTransfer: 'Infrastructure Setup',
      monthPartnership: '/month active monitoring',
      minimumForLearning: 'minimum deployment term',
      recommended: 'MOST POPULAR',
      typicalRoi: 'Value Replacement',
      yourOutcome: 'Outcome Promise',
      seeCapabilityRoi: 'Calculate Overhead Savings',
      flexibleLearning: 'Active Defense',
      flexibleLearningText: 'Hallucination guardrails + 24/7 monitoring included in all tiers',
      includes: 'Deploys',
    },
      guarantee: {
        title: 'Active Defense Included on All Tiers',
        description: "Every deployment includes our Active Defense monitoring protocol—hallucination guardrails and data-leak prevention that run 24/7 to protect your reputation.",
        items: ['No vendor lock-in', 'You own the infrastructure', 'Zero data breaches SLA'],
      },
    },

    faq: {
      tag: 'FAQ',
      heading: 'Common questions',
      description: 'Everything you need to know about sovereign AI infrastructure.',
      items: [
        {
          question: 'Do I own the AI agents you deploy?',
          answer:
            "Yes. Unlike SaaS tools you rent, the infrastructure we deploy is yours. The code, the integrations, the trained models—all owned by you. Your agents run independently of our billing — but we strongly recommend continued monitoring as AI models and integrations evolve over time.",
        },
        {
          question: 'How is this different from hiring an agency or using a chatbot?',
          answer:
            "Agencies build 'wrapper' tools on top of off-the-shelf services—when they leave, so does the capability. Cheap chatbots hallucinate and create liability. We build secured, owned infrastructure with Active Defense monitoring that protects against both.",
        },
        {
          question: 'How do you prevent AI hallucinations?',
          answer:
            "Every agent is deployed with Hallucination Guardrails—a set of boundary rules that prevent the AI from making promises, quoting prices, or providing information outside its defined scope. We test extensively before going live.",
        },
        {
          question: 'What happens to my data?',
          answer:
            'Your data stays yours. We deploy using Zero-Trust Integration principles—every data connection is encrypted, audited, and permissioned. We never store or sell your business data.',
        },
        {
          question: 'How fast can you deploy?',
          answer:
            "The Revenue Guard (voice agent) can be live within 1 week after the vulnerability audit. The Operations Sovereign typically deploys in 2-4 weeks. The Enterprise Fortress is a 6-week deployment depending on integration complexity.",
        },
        {
          question: 'What systems do you integrate with?',
          answer:
            'We integrate with QuickBooks, ServiceTitan, Jobber, Google Workspace, Microsoft 365, most CRMs, and custom APIs. The Operations Sovereign tier includes a Zero-Trust CRM and bank data integration layer.',
        },
        {
          question: 'What does the monthly fee actually cover?',
          answer:
            "For The Revenue Guard and Operations Sovereign, the monthly fee is fully bundled — it covers your active monitoring, API usage (voice calls, LLM tokens), hosting, and infrastructure costs. No separate bills from third-party providers. Usage beyond your included allowance is billed at a flat overage rate, and you're notified at 80% of your monthly limit. The Enterprise Fortress operates on a pass-through model: you hold your own API accounts (OpenAI, Twilio, etc.) for true infrastructure sovereignty, and the monthly fee covers management, monitoring, and optimization only.",
        },
      ],
      contact: {
        question: 'Still have questions?',
        cta: 'Get in touch',
      },
    },

    finalCta: {
      badge: 'Limited deployment slots',
      heading: 'Complexity is where the risk is.',
      description:
        "Don't trust your business to a 'wrapper' agency. Build a fortress. Secure your future revenue with an infrastructure partner who deploys assets you own forever.",
      ctaPrimary: 'Secure Your Infrastructure',
      ctaSecondary: 'Calculate Overhead Savings',
      trustSignals: [
        { icon: 'shield', label: 'Active Defense monitoring' },
        { icon: 'lock', label: 'Zero vendor lock-in' },
        { icon: 'clock', label: '24/7 uptime guarantee' },
      ],
    },

    footer: {
      tagline: 'Sovereign AI infrastructure for SMBs. Own your agents. Eliminate your overhead.',
      sections: {
        solutions: 'Infrastructure',
        company: 'Company',
        resources: 'Resources',
      },
      links: {
        solutions: [
          { label: 'The Revenue Guard', href: '#pricing' },
          { label: 'Sovereign Workflow Protocol', href: '#pricing' },
          { label: 'Liability-Guarded Operations', href: '#pricing' },
          { label: 'Enterprise Fortress', href: '#pricing' },
        ],
        company: [
          { label: 'About', href: '#how-it-works' },
          { label: 'Case Studies', href: '#case-studies' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Contact', href: '#get-started' },
        ],
        resources: [
          { label: 'ROI Calculator', href: '#roi-calculator' },
          { label: 'Blog', href: '#case-studies' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Support', href: '#get-started' },
        ],
      },
      copyright: 'elev8tion. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      aiDisclosure: 'AI Disclosure',
      refundPolicy: 'Refund Policy',
    },

    voiceAgent: {
      states: {
        idle: { title: 'Ready to Help', description: 'Click to ask a question' },
        listening: { title: 'Listening...', description: 'Speak your question' },
        processing: {
          title: 'Processing Your Question...',
          description: 'Analyzing and preparing response...'
        },
        speaking: {
          title: 'AI Response',
          description: 'Listen or read below ↓'
        },
      },
      transcript: 'You asked:',
      aiResponse: 'AI Response:',
      yourQuestion: 'Your Question:',
      autoClose: {
        prompt: 'Need more information or have another question?',
        seconds: 'seconds until auto-close',
        askAnother: 'Ask Another Question',
        stayOpen: 'Stay Open',
      },
      buttons: {
        stop: 'Stop',
        close: 'Close',
      },
      hint: 'Voice Chat With Me!',
      errors: {
        notSupported: 'Voice recording is not supported in this browser.',
      },
      textInput: {
        email: 'Email Address',
        name: 'Full Name',
        phone: 'Phone Number',
        company: 'Company Name',
        industry: 'Industry',
      },
    },

    languageSwitcher: {
      label: 'Language',
    },

    booking: {
      title: 'Book a Call',
      selectDate: 'Select a date for your strategy call',
      selectTime: 'Choose your preferred time',
      enterDetails: 'Enter your details to confirm',
      typeSelection: {
        heading: 'How would you like to connect?',
        orDivider: 'or',
        alreadyCertain: 'Already certain you want AI for your business?',
        consultation: {
          title: 'Free Strategy Call',
          description: 'A 30-minute video call to discuss your business goals and explore AI opportunities.',
          price: 'Free',
          duration: '30 min video call',
        },
        assessment: {
          title: 'On-Site Operations Assessment',
          description: 'Skip the call. I come to your place of business to shadow you or a staff member and understand your operations firsthand.',
          price: '$250',
          duration: '3-hour on-site visit',
          includes: 'Full strategy report included',
          process: [
            'I shadow you or a team member for 3 hours — ride-alongs, workflows, daily operations',
            'I identify where agentic AI systems can streamline and grow your business',
            'We sit down together to review a synopsis of opportunities I\'ve identified',
            'You decide if you\'d like to invest in implementation and choose a partnership tier',
          ],
          whyPaid: 'The $250 fee ensures my expertise and time are compensated regardless of outcome. If you choose not to proceed, you still receive a complete written strategy report with all recommendations — it\'s yours to keep.',
          cta: 'Book On-Site Assessment — $250',
        },
      },
      form: {
        name: 'Full Name',
        namePlaceholder: 'John Smith',
        email: 'Email Address',
        emailPlaceholder: 'john@company.com',
        phone: 'Phone Number (optional)',
        phonePlaceholder: '+1 (555) 123-4567',
        companyName: 'Company / Business Name',
        companyNamePlaceholder: 'Acme Plumbing LLC',
        industry: 'Industry',
        industryPlaceholder: 'e.g. HVAC, Real Estate, Construction',
        employeeCount: 'Number of Employees',
        employeeCountPlaceholder: 'e.g. 12',
        challenge: 'Biggest Operational Challenge (optional)',
        challengePlaceholder: 'What slows your team down or costs you the most time?',
        referralSource: 'How did you hear about us? (optional)',
        referralSourcePlaceholder: 'Google, referral, social media, etc.',
        websiteUrl: 'Website URL (optional)',
        websiteUrlPlaceholder: 'https://yourcompany.com',
        yourInfo: 'Your Information',
        aboutBusiness: 'About Your Business',
        submit: 'Confirm Booking',
        submitting: 'Booking...',
        submitAssessment: 'Continue to Payment ($250)',
        submittingAssessment: 'Redirecting to payment...',
        assessmentDuration: '3 hrs',
        required: 'Required fields',
        termsAgreement: 'I agree to the <terms>Terms of Service</terms> and <refund>Refund Policy</refund>',
        termsRequired: 'You must agree to the Terms of Service and Refund Policy',
      },
      confirmation: {
        title: 'Booking Confirmed!',
        subtitle: "You're all set. We look forward to speaking with you.",
        date: 'Date',
        time: 'Time',
        duration: '30 minutes',
        email: 'Confirmation sent to',
        addToCalendar: 'Add to your calendar',
        googleCalendar: 'Google',
        appleCalendar: 'Apple',
        outlookCalendar: 'Outlook',
        done: 'Done',
        confirmationSent: "A confirmation email has been sent to your inbox.",
      },
      paymentSuccess: {
        title: 'Assessment Confirmed & Paid!',
        subtitle: 'Your on-site operations assessment has been booked. We look forward to visiting your business.',
        amount: 'Amount Paid',
        whatToExpect: 'What to Expect',
        expectItems: [
          'A 3-hour on-site visit — I\'ll shadow you or a staff member to understand your day-to-day operations',
          'Ride-alongs, workflow observation, and hands-on time with your team',
          'A sit-down review of the AI opportunities I\'ve identified for your business',
          'Discussion of partnership tiers if you choose to move forward with implementation',
        ],
        strategyDocNote: 'After the assessment, you will receive a complete written strategy report with all recommendations — whether or not you choose to proceed with our services. It\'s yours to keep.',
        addToCalendar: 'Add to your calendar',
        googleCalendar: 'Google',
        appleCalendar: 'Apple',
        outlookCalendar: 'Outlook',
        backToHome: 'Back to Home',
        error: 'Something went wrong. Please contact us if you were charged.',
        processing: 'Verifying your payment...',
      },
    },
  },

  es: {
    nav: {
      solutions: 'Soluciones',
      howItWorks: 'Como Funciona',
      pricing: 'Precios',
      caseStudies: 'Casos de Estudio',
      contact: 'Contacto',
      getStarted: 'Comenzar',
      openMenu: 'Abrir menu',
      closeMenu: 'Cerrar menu',
    },

    hero: {
      badge: 'Infraestructura de IA con Barandillas — Asegurada, Implementada, Monitoreada',
      titlePart1: 'Deja de Rentar',
      titleHighlight: 'el Cerebro de Tu Negocio.',
      titlePart2: 'Poseerlo.',
      description:
        'La era de pagar mensualmente por personal administrativo y software inflado ha terminado. Reemplazamos tus gastos generales con agentes de IA seguros y soberanos que posees para siempre.',
      ctaPrimary: 'Calcula Tus Ahorros de Overhead',
      ctaSecondary: 'Implementar Agente de Voz',
      stats: {
        agentsBuilt: { value: '24/7', label: 'Disponibilidad del Agente' },
        toMastery: { value: '<100ms', label: 'Latencia de Respuesta' },
        smbsBuilding: { value: '0', label: 'Dependencia de Proveedor' },
        buildIndependently: { value: '100%', label: 'Tu Eres el Dueno del Codigo' },
      },
    },

    socialProof: {
      heading: 'Industrias Donde Implementamos',
      companies: [
        { name: 'HVAC & Plomeria', industry: 'Servicios del Hogar' },
        { name: 'Contratistas Generales', industry: 'Construccion' },
        { name: 'Administradores de Propiedades', industry: 'Bienes Raices' },
        { name: 'Electricistas & Oficios', industry: 'Servicios de Campo' },
        { name: 'Servicios Profesionales', industry: 'Agencias & Consultores' },
      ],
    },

    problem: {
      tag: 'El Sangrado',
      heading: 'Estas pagando por costos que no necesitas',
      description:
        'Cada mes pagas salarios administrativos, licencias de software infladas y servicios de contestador, mientras pierdes clientes potenciales. Reemplazamos quirurgicamente ese overhead con infraestructura de IA que posees.',
      painPoints: [
        {
          title: 'Estas Sangrando Cuotas Mensuales.',
          description:
            'Por que pagar $50/usuario en software o $3,000/mes en un administrador? Los agentes de IA hacen el mismo trabajo por centavos. Deja de rentar capacidad y empieza a poseerla.',
          stat: '$120K+/ano en overhead',
        },
        {
          title: 'Los Bots Baratos Crean Demandas.',
          description:
            'La mayoria de agencias implementan chatbots que alucinan descuentos falsos o filtran datos de clientes. Construimos "Infraestructura con Barandillas" que protege tu reputacion y tu balance.',
          stat: '62% sin proteccion',
        },
        {
          title: 'Si Es Lento, Pierdes el Cliente.',
          description:
            'La PYME promedio pierde el 20-30% de llamadas entrantes. Cada trabajo de HVAC perdido vale $400. Nuestros agentes optimizados responden al instante, 24/7. Sin dias de enfermedad. Sin correo de voz.',
          stat: '23% de llamadas perdidas',
        },
        {
          title: 'La Complejidad Es Donde Viven los Hackers.',
          description:
            'Las agencias conectan IA a tu stack existente y lo llaman hecho. Auditamos todo tu flujo de datos, implementamos detras de un perimetro de seguridad y probamos vulnerabilidades antes de salir en vivo.',
          stat: '3x mas riesgo con herramientas baratas',
        },
      ],
    },

    howItWorks: {
      tag: 'Proceso de Implementacion',
      heading: 'Tres pasos hacia una infraestructura segura e implementada',
      description:
        'No ensenamos — instalamos, aseguramos y monitoreamos. Tu infraestructura de IA esta activa antes de que termines tu primer cafe.',
      subDescription:
        'Cada implementacion pasa por nuestro proceso de tres fases: auditoria, instalacion y activacion de monitoreo. Sin atajos. Sin herramientas "envoltorio".',
      steps: [
        {
          step: '01',
          title: 'La Auditoria de Vulnerabilidades',
          description:
            'Auditamos tu P&L para encontrar exactamente que suscripciones de software y tareas administrativas pueden reemplazarse. Identificamos el "sangrado" — cada dolar que escapa innecesariamente de tu operacion.',
          duration: 'Semana 1',
          deliverable: 'Reporte completo de costos de overhead + hoja de ruta de reemplazo',
        },
        {
          step: '02',
          title: 'Instalacion Segura',
          description:
            'Implementamos tus agentes detras de un perimetro de seguridad. Probamos alucinaciones y fugas de datos antes de salir en vivo. Tu infraestructura pasa nuestra lista de verificacion de Defensa Activa antes de tocar a un cliente.',
          duration: 'Semana 2-4',
          deliverable: 'Agentes de IA activos + aprobacion de auditoria de seguridad',
        },
        {
          step: '03',
          title: 'Monitoreo Activo',
          description:
            'No solo te entregamos las llaves. Monitoreamos el sistema 24/7 para garantizar tiempo de actividad y adaptarnos a nuevas amenazas. Recibes reportes mensuales. Tus agentes se vuelven mas inteligentes con el tiempo.',
          duration: 'Continuo',
          deliverable: 'Panel de actividad 24/7 + reportes de desempeno mensuales',
        },
      ],
      youllGet: 'Recibiras:',
      features: ['Cero dependencia de proveedores', 'Barandillas anti-alucinacion', 'Monitoreo activo', 'Tiempo de actividad 24/7'],
    },

    useCases: {
      tag: 'Stack de Infraestructura',
      heading: 'Activos de IA soberanos — implementados y en tu propiedad',
      description:
        'Estas no son herramientas que rentas. Son activos de infraestructura que instalamos en tu negocio. Construidos a medida, con barandillas de seguridad y monitoreados las 24 horas.',
      complexityLevels: [
        { id: 'all', name: 'Toda la Infraestructura' },
        { id: 'beginner', name: 'Ingresos' },
        { id: 'intermediate', name: 'Operaciones' },
        { id: 'advanced', name: 'Empresarial' },
      ],
      systems: [
        {
          id: 1,
          complexity: 'beginner',
          name: 'El Guardia de Ingresos',
          description:
            'Agentes de voz y texto optimizados en latencia que responden llamadas, califican prospectos y reservan citas al instante. Cero ingresos perdidos. Reemplaza tu servicio de contestador a una fraccion del costo.',
          whatYouLearn: 'Contestacion instantanea, calificacion de prospectos, reservacion de citas',
          industries: 'Cualquier negocio orientado al cliente',
          capabilities: ['Disponibilidad 24/7', 'Contestacion instantanea', 'Calificacion de prospectos'],
        },
        {
          id: 2,
          complexity: 'beginner',
          name: 'Protocolo de Flujo de Trabajo Soberano',
          description:
            'Automatiza facturacion, entrada de datos y despacho. Elimina la necesidad de licencias costosas por usuario en herramientas como Zapier o Salesforce. Integracion de datos de confianza cero.',
          whatYouLearn: 'Automatizacion de facturas, logica de despacho, eliminacion de licencias CRM',
          industries: 'Negocios con operaciones intensivas',
          capabilities: ['Automatizacion de facturas', 'Auto-despacho', 'Eliminacion de licencias'],
        },
        {
          id: 3,
          complexity: 'intermediate',
          name: 'Procesador Inteligente de Documentos',
          description:
            'Lee propuestas, facturas y contratos — extrae datos criticos, enruta para accion y registra todo con un rastro de auditoria completo. Protegido de responsabilidad por diseno.',
          whatYouLearn: 'IA de documentos, extraccion de datos, rastros de auditoria',
          industries: 'Construccion, legal, administracion de propiedades',
          capabilities: ['OCR + Comprension', 'Rastro de auditoria', 'Enrutamiento inteligente'],
        },
        {
          id: 4,
          complexity: 'intermediate',
          name: 'Analista de Operaciones Predictivo',
          description:
            'Agentes basados en datos que analizan patrones de ventas, pronostican flujo de caja, identifican oportunidades de reduccion de overhead y alertan antes de que los problemas se acumulen.',
          whatYouLearn: 'Analisis de costos, pronostico, identificacion de overhead',
          industries: 'Cualquier negocio basado en datos',
          capabilities: ['Alertas de overhead', 'Pronostico de flujo de caja', 'Deteccion de oportunidades'],
        },
        {
          id: 5,
          complexity: 'advanced',
          name: 'Operaciones con Barandillas de Responsabilidad',
          description:
            'Sistemas multi-agente complejos con auditorias de seguridad integradas. Garantiza que tu IA nunca prometa algo que no puede cumplir. Barandillas anti-alucinacion y registros de cumplimiento completos.',
          whatYouLearn: 'Coordinacion multi-agente, auditoria de seguridad, cumplimiento',
          industries: 'Negocios con operaciones complejas',
          capabilities: ['Barandillas anti-alucinacion', 'Registro de cumplimiento', 'Auditorias de seguridad'],
        },
        {
          id: 6,
          complexity: 'advanced',
          name: 'Stack Fortaleza Empresarial',
          description:
            'Enjambre multi-agente completo con optimizacion de computo en el borde. Posees el codigo, los pesos y los datos. Escala ilimitada. Cumplimiento listo para auditorias. Sin dependencia de proveedores.',
          whatYouLearn: 'Computacion en el borde, soberania de datos, cumplimiento empresarial',
          industries: 'Negocios en crecimiento ($2M+ de ingresos)',
          capabilities: ['Soberania total de datos', 'Computo en el borde', 'Escala ilimitada'],
        },
      ],
      youllLearn: 'Especificacion de Infraestructura:',
      bottomNote:
        'Cada implementacion es construida a medida para tus operaciones. Auditamos primero, instalamos segundo, monitoreamos siempre. Estos son activos — no suscripciones.',
    },

    caseStudies: {
      tag: 'Lo Que Es Posible',
      heading: 'Resultados proyectados por tipo de negocio',
      description:
        'Estas proyecciones se generan desde nuestra calculadora de ahorros de overhead. Ingresa tus numeros reales arriba para ver tu oportunidad especifica.',
      cases: [
        {
          company: 'Negocio de Servicios del Hogar',
          industry: 'HVAC / Plomeria / Electricidad',
          revenue: '$800K–$2M ingresos anuales',
          employees: '3–10 empleados',
          tier: 'El Guardia de Ingresos',
          investment: '$3,500 configuracion + $750/mes',
          timeline: 'Semanas 1–4 de implementacion',
          challenge:
            '$3,000/mes en personal administrativo + 20 llamadas perdidas/semana a $400 por trabajo = mas de $28K/mes en oportunidad recuperable sobre la mesa.',
          systemsBuilt: [
            'Agente de Voz 24/7 - Atencion instantanea de llamadas, calificacion de prospectos, reserva de citas',
            'Notificacion de Despacho - Ruta automatica de trabajos al equipo de campo via SMS',
            'Recuperacion de Llamadas Perdidas - Seguimiento automatizado en menos de 60 segundos',
          ],
          results: {
            timeSaved: '$3,000/mes eliminados',
            revenueImpact: 'Hasta $40K/ano en ingresos recuperados de llamadas',
            customerSat: 'Atencion en <100ms vs. devolucion de llamada en 4 horas',
            roi: '220',
            roiPeriod: '3 meses (proyectado)',
            totalValue: 'Hasta $69K/ano',
          },
          quote:
            'Proyeccion asume $3,000/mes de overhead administrativo, 20 llamadas perdidas/semana a $400 valor promedio de trabajo, 60% captura, 35% tasa de cierre. Usa la calculadora para modelar tus numeros.',
          owner: '',
        },
        {
          company: 'Firma de Servicios Profesionales',
          industry: 'Agencia / Consultoria / Legal',
          revenue: '$500K–$1.5M ingresos anuales',
          employees: '2–8 empleados',
          tier: 'El Soberano de Operaciones',
          investment: '$5,000 configuracion + $1,500/mes',
          timeline: 'Semanas 1–6 de implementacion',
          challenge:
            '$2,000/mes en suscripciones de software por usuario + 10 hrs/semana en facturacion manual, propuestas y seguimientos — overhead oculto que se acumula cada trimestre.',
          systemsBuilt: [
            'Protocolo de Flujo Soberano - Elimina licencias de SaaS por usuario',
            'Procesador Inteligente de Documentos - Extrae datos de propuestas y contratos automaticamente',
            'Agente de Seguimiento de Clientes - Secuencias automatizadas de nutricion y reenganche',
          ],
          results: {
            timeSaved: '~$3,500/mes de overhead eliminado',
            revenueImpact: '3x produccion de propuestas con el mismo personal',
            customerSat: 'Respuesta el mismo dia vs. tramitacion manual en 2 dias',
            roi: '185',
            roiPeriod: '4 meses (proyectado)',
            totalValue: 'Hasta $83K/ano',
          },
          quote:
            'Proyeccion asume $2,000/mes en software, $1,500/mes en tiempo administrativo, nivel Soberano de Operaciones. Los resultados reales dependen de tu stack y complejidad de flujo de trabajo.',
          owner: '',
        },
        {
          company: 'Negocio con Operaciones Intensivas',
          industry: 'Propiedades / Construccion / Logistica',
          revenue: '$2M–$5M ingresos anuales',
          employees: '10–25 empleados',
          tier: 'La Fortaleza Empresarial',
          investment: '$12,000 configuracion + $3,000/mes',
          timeline: 'Semanas 1–8 de implementacion',
          challenge:
            '$8,000/mes en overhead combinado de administracion y software. Despacho manual, reportes y procesamiento de documentos son el cuello de botella que impide el proximo nivel de crecimiento.',
          systemsBuilt: [
            'Analista de Operaciones Predictivo - Pronostico de flujo de caja y alertas de overhead',
            'Operaciones con Barandillas de Responsabilidad - Coordinacion multi-agente con registro de cumplimiento',
            'Stack Fortaleza Empresarial - Soberania total de datos, computo en borde, sin dependencia de proveedor',
          ],
          results: {
            timeSaved: '~$8,000/mes de overhead eliminado',
            revenueImpact: 'Elimina el equivalente a 2–3 FTE en overhead administrativo',
            customerSat: 'Decisiones de despacho en menos de 1 segundo vs. enrutamiento manual',
            roi: '310',
            roiPeriod: '6 meses (proyectado)',
            totalValue: 'Hasta $192K/ano',
          },
          quote:
            'Proyeccion asume $5,000/mes nomina admin + $3,000/mes overhead de software, nivel Fortaleza Empresarial. Usa la calculadora para modelar tu overhead real e ingresos perdidos.',
          owner: '',
        },
      ],
      labels: {
        challenge: 'Escenario de Overhead:',
        partnershipTier: 'Nivel de Infraestructura',
        systemsBuiltTogether: 'Que Se Implementa',
        measurableResults: 'Resultados Proyectados',
        timeSaved: 'Overhead Eliminado',
        roiIn: 'ROI Proyectado en',
        totalValueCreated: 'Potencial de Valor Anual',
        revenueImpact: 'Ventaja de Ingresos',
        customerExperience: 'Mejora de Velocidad',
        owner: '',
      },
      bottomStats: {
        heading: 'Por Que Funcionan los Numeros',
        description:
          'Datos de la industria que fundamentan las proyecciones de nuestra calculadora de overhead',
        stats: [
          { stat: '23%', label: 'Llamadas Entrantes Perdidas en Promedio (PyMEs)' },
          { stat: '60%', label: 'Potencial de Reduccion de Overhead' },
          { stat: '68%', label: 'PyMEs Que Usan Herramientas de IA' },
          { stat: '<100ms', label: 'Latencia de Respuesta del Agente' },
        ],
        note: 'Las proyecciones se basan en tus datos reales de overhead y tasas de automatizacion validadas por la industria. Usa la calculadora arriba para ver tus numeros especificos.',
      },
    },

    roiCalculator: {
      tag: 'Calculadora de Ahorros de Overhead',
      heading: 'Calcula Tu Capital Anual Recuperado',
      description:
        'Ingresa tus costos reales de overhead e ingresos perdidos. Ve exactamente cuanto capital podemos devolverte.',
      labels: {
        industry: 'Industria',
        businessSize: 'Tamano del Negocio',
        hourlyLaborCost: 'Costo Laboral por Hora',
        partnershipTier: 'Nivel de Infraestructura',
      },
      hourlyLaborCostNote: 'Costo promedio combinado por hora de tiempo del personal',
      industries: [
        { id: 'other', name: 'Otro/Negocio Personalizado' },
        { id: 'service', name: 'Negocio de Servicios' },
        { id: 'professional', name: 'Servicios Profesionales' },
        { id: 'retail', name: 'Retail/Hospitalidad' },
        { id: 'realestate', name: 'Bienes Raices/Propiedades' },
        { id: 'construction', name: 'Construccion/Oficios' },
      ],
      employeeSizes: [
        { id: '1-5', name: '1-5 empleados' },
        { id: '5-10', name: '5-10 empleados' },
        { id: '10-25', name: '10-25 empleados' },
        { id: '25-50', name: '25-50 empleados' },
      ],
      tiers: [
        { id: 'discovery', name: 'El Guardia de Ingresos' },
        { id: 'foundation', name: 'El Soberano de Operaciones' },
        { id: 'architect', name: 'La Fortaleza Empresarial' },
      ],
      tasks: {
        scheduling: 'Programacion y Citas',
        communication: 'Comunicacion con Clientes y Seguimiento',
        dataEntry: 'Entrada de Datos, Facturacion y Contabilidad',
        leadResponse: 'Respuesta y Calificacion de Prospectos',
        reporting: 'Reportes y Analitica',
        inventory: 'Inventario / Seguimiento de Suministros',
        socialMedia: 'Redes Sociales y Marketing',
      },
      steps: {
        labels: ['Overhead', 'Ingresos Perdidos', 'Nivel', 'Resultados'],
        next: 'Siguiente',
        back: 'Atras',
        seeResults: 'Calcular Ahorros',
        basics: {
          title: 'Costos de Overhead Actuales',
          subtitle: 'Cuentanos cuanto pagas hoy en administracion y software.',
        },
        timeAudit: {
          title: 'Ingresos Perdidos',
          subtitle: 'Estima las llamadas y prospectos que se pierden cada semana.',
          totalWeeklyHours: 'Total de oportunidades perdidas',
        },
        revenue: {
          title: 'Impacto en Ingresos',
          subtitle: 'Ayudanos a estimar los ingresos que podrias recuperar.',
          monthlyRevenue: 'Ingresos Mensuales',
          avgDealValue: 'Valor Promedio de Trabajo / Venta',
          lostLeads: 'Llamadas Perdidas por Semana',
          closeRate: 'Tasa de Cierre',
        },
        results: {
          title: 'Capital Recuperado',
          subtitle: 'Asi es el overhead que eliminamos y los ingresos que recuperamos.',
        },
      },
      results: {
        heading: 'Capital Anual Total Recuperado',
        timeSaved: 'Horas Administrativas Eliminadas',
        weeklyValue: 'Ahorro Mensual Fijo',
        investment: 'Cuota Mensual de Infraestructura',
        tasksAutomated: 'Lineas de Overhead Eliminadas',
        revenueRecovery: 'Ingresos Recuperados',
        recoveredLeadsLabel: 'prospectos capturados/mes',
        annualBenefit: 'Capital Anual Recuperado',
        yourRoi: 'Tu ROI',
        paysForItself: 'La infraestructura se paga sola en ~',
        continuesGenerating: 'semanas, luego genera ganancia pura',
        automatedTasksLabel: 'Lineas de Overhead Reemplazadas',
        weeksShort: 'sem',
        monthsShort: 'mes',
        paybackLabel: 'Periodo de Retorno',
      },
      inputSummary: {
        title: 'Tus Datos',
        industry: 'Industria',
        teamSize: 'Equipo',
        hourlyRate: 'Tarifa/Hora',
        weeklyHours: 'Horas Semanales',
        monthlyRevenue: 'Ingresos Mensuales',
        lostLeads: 'Llamadas Perdidas/sem',
      },
      emailCapture: {
        heading: 'Enviame este reporte completo',
        placeholder: 'Ingresa tu email',
        send: 'Enviar',
        sending: 'Enviando...',
        note: 'Te enviaremos un desglose detallado de tus ahorros potenciales. Sin spam.',
        success: 'Reporte enviado exitosamente! Revisa tu bandeja de entrada.',
      },
      comparison: {
        heading: 'Comparar Alternativas (Anual)',
        traditionalConsultant: 'Consultor Tradicional',
        consultantRate: '$175/hr x tus horas ahorradas',
        doneForYou: 'Agencia de Servicios Completos',
        agencyRate: '$6,500/mes x 12',
        aiSmbPartners: 'AI KRE8TION Partners',
        savePercent: 'Ahorra ',
        ownCapability: '% vs alternativas + eres dueno de la infraestructura para siempre',
      },
      cta: 'Implementar Mi Infraestructura',
      disclaimer:
        'Los calculos usan tus datos para estimar ahorros fijos de overhead e ingresos recuperados. Ahorro fijo = (Nomina + Software) menos nuestra cuota mensual. Recuperacion de ingresos asume 60% de captura de llamadas y 35% de tasa de cierre. Los resultados reales varian por negocio e implementacion.',
    },

    pricing: {
      tag: 'Inversion en Infraestructura',
      heading: 'Posee Tu IA. Paga por Resultados.',
      description:
        'Infraestructura de IA soberana — implementada, asegurada y monitoreada por nosotros. Sin dependencia de proveedores. Sin cuotas por usuario. Propiedad total.',
      afterMinimum:
        'Despues del termino minimo, la infraestructura es tuya. La mayoria de los clientes continuan mes a mes — los modelos de IA evolucionan, las integraciones se actualizan, y el monitoreo activo mantiene tu ROI creciendo. Cancela en cualquier momento.',
      tiers: [
        {
          name: 'El Guardia de Ingresos',
          subtitle: 'Infraestructura de Voz',
          setupFee: '$2,500',
          monthlyFee: '$750',
          minimumTerm: '2 meses',
          description: 'Un agente de voz optimizado en latencia que responde 24/7, califica prospectos y reserva citas. Captura el 100% de los prospectos. Cero ingresos perdidos.',
          includes: 'Agente de voz Revenue Guard implementado, monitoreado e infraestructura incluida',
          features: [
            'Reemplaza tu servicio de contestador (valor $500/mes)',
            'Captura ~$5K/mes en prospectos que de otro modo se perderian',
            'Disponibilidad 24/7 — sin dias de enfermedad, sin correo de voz',
            'Barandillas anti-alucinacion (proteccion de responsabilidad)',
            'Optimizacion de latencia para contestacion instantanea',
            'Calificacion de prospectos y reservacion de citas',
            'Costos de API e infraestructura incluidos — sin facturas sorpresa',
            'Reportes de desempeno mensuales',
          ],
          outcome: 'Captura el 100% de prospectos. Cero ingresos perdidos.',
          cta: 'Implementar Agente de Voz',
          highlighted: false,
          roiText: 'Reemplaza servicio de contestador $500+/mes',
        },
        {
          name: 'El Soberano de Operaciones',
          subtitle: 'Stack de Oficina Trasera',
          setupFee: '$5,000',
          monthlyFee: '$1,500',
          minimumTerm: '3 meses',
          description: 'Agente de Voz + 3 Agentes de Flujo de Trabajo (Facturacion, Programacion, Despacho). Reduce el overhead en un 60%. Elimina la entrada de datos y cuotas por usuario.',
          includes: 'Revenue Guard + 3 agentes de Flujo de Trabajo Soberano, infraestructura incluida',
          features: [
            'Todo en El Guardia de Ingresos',
            'Reemplaza 1 administrador de tiempo completo (ahorro $40K/ano)',
            'Elimina cuotas de software por usuario',
            '20+ horas/semana devueltas al propietario',
            'Automatizacion de facturacion, programacion y despacho',
            'Integracion de datos CRM y bancarios de confianza cero',
            'Costos de API e infraestructura incluidos — sin facturas de terceros separadas',
            'Monitoreo de defensa activa 24/7',
          ],
          outcome: 'Reduce el overhead en un 60%. Elimina la entrada de datos.',
          cta: 'Reemplazar Trabajo Administrativo',
          highlighted: true,
          roiText: 'Reemplaza salario de administrador $40K/ano',
        },
        {
          name: 'La Fortaleza Empresarial',
          subtitle: 'Autonomia Total',
          setupFee: '$12,000',
          monthlyFee: '$3,000',
          minimumTerm: '6 meses',
          description: 'Enjambre multi-agente con optimizacion de computo en el borde. Escala sin contratar personal. Soberania total de codigo, pesos y datos. Tu gestionas tus propias cuentas de API — independencia verdadera en cada capa.',
          includes: 'Stack multi-agente completo + paquete de soberania + modelo de API directo',
          features: [
            'Todo en El Soberano de Operaciones',
            'Cuentas de API propias — tu gestionas tus credenciales de OpenAI, Twilio e infraestructura',
            'Cumplimiento y documentacion de seguridad listos para auditorias',
            'Escala ilimitada — maneja 10K+ interacciones simultaneamente',
            'Soberania total: posees el codigo, los pesos y los datos',
            'Optimizacion de computo en el borde para maxima velocidad',
            'Equipo dedicado de defensa activa',
            'Auditorias de seguridad trimestrales',
          ],
          outcome: 'Escala sin contratar personal. Seguridad institucional.',
          cta: 'Construir Infraestructura',
          highlighted: false,
          roiText: 'Elimina cuellos de botella de escalamiento a $2M+ de ingresos',
        },
        {
          name: 'Empresarial Personalizado',
          subtitle: 'Implementacion a medida',
          setupFee: 'Personalizado',
          monthlyFee: 'Personalizado',
          minimumTerm: 'Personalizado',
          description: 'Multi-ubicacion, integracion compleja, o requisitos de cumplimiento especificos de la industria. Diseno de infraestructura completamente a medida.',
          features: [
            'Todo en La Fortaleza Empresarial',
            'Implementacion multi-ubicacion',
            'Cumplimiento especifico de industria (HIPAA, SOC2, etc.)',
            'Arquitecto de infraestructura dedicado',
            'Implementacion premium de clase blanca',
            'SLA y garantias de tiempo de actividad personalizadas',
          ],
          outcome: 'Operacion totalmente IA-nativa con infraestructura a medida',
          cta: 'Contactanos',
          highlighted: false,
        },
      ],
    labels: {
      capabilityTransfer: 'Instalacion de Infraestructura',
      monthPartnership: '/mes monitoreo activo',
      minimumForLearning: 'termino minimo de implementacion',
      recommended: 'MAS POPULAR',
      typicalRoi: 'Reemplazo de Valor',
      yourOutcome: 'Promesa de Resultado',
      seeCapabilityRoi: 'Calcular Ahorros de Overhead',
      flexibleLearning: 'Defensa Activa',
      flexibleLearningText: 'Barandillas anti-alucinacion + monitoreo 24/7 incluidos en todos los niveles',
      includes: 'Implementa',
    },
      guarantee: {
        title: 'Defensa Activa Incluida en Todos los Niveles',
        description: 'Cada implementacion incluye nuestro protocolo de monitoreo de Defensa Activa — barandillas anti-alucinacion y prevencion de fugas de datos que funcionan 24/7 para proteger tu reputacion.',
        items: ['Sin dependencia de proveedores', 'Eres dueno de la infraestructura', 'SLA cero brechas de datos'],
      },
    },

    faq: {
      tag: 'Preguntas Frecuentes',
      heading: 'Preguntas comunes',
      description: 'Todo lo que necesitas saber sobre infraestructura de IA soberana.',
      items: [
        {
          question: 'Soy dueno de los agentes de IA que implementan?',
          answer:
            'Si. A diferencia de las herramientas SaaS que rentas, la infraestructura que implementamos es tuya. El codigo, las integraciones, los modelos entrenados — todo en tu propiedad. Tus agentes funcionan independientemente de nuestra facturacion — pero recomendamos ampliamente el monitoreo continuo a medida que los modelos de IA y las integraciones evolucionan con el tiempo.',
        },
        {
          question: 'En que se diferencia de contratar una agencia o usar un chatbot?',
          answer:
            'Las agencias construyen herramientas "envoltorio" sobre servicios de terceros — cuando se van, la capacidad tambien. Los chatbots baratos alucinan y crean responsabilidad. Construimos infraestructura segura y de tu propiedad con monitoreo de Defensa Activa que protege contra ambos.',
        },
        {
          question: 'Como previenen las alucinaciones de IA?',
          answer:
            'Cada agente se implementa con Barandillas Anti-Alucinacion — un conjunto de reglas que evitan que la IA haga promesas, cite precios o proporcione informacion fuera de su alcance definido. Probamos extensamente antes de salir en vivo.',
        },
        {
          question: 'Que pasa con mis datos?',
          answer:
            'Tus datos son tuyos. Implementamos usando principios de Integracion de Confianza Cero — cada conexion de datos esta encriptada, auditada y con permisos. Nunca almacenamos ni vendemos los datos de tu negocio.',
        },
        {
          question: 'Que tan rapido pueden implementar?',
          answer:
            'El Guardia de Ingresos (agente de voz) puede estar activo en 1 semana despues de la auditoria de vulnerabilidades. El Soberano de Operaciones tipicamente se implementa en 2-4 semanas. La Fortaleza Empresarial es una implementacion de 6 semanas segun la complejidad de integracion.',
        },
        {
          question: 'Con que sistemas se integran?',
          answer:
            'Nos integramos con QuickBooks, ServiceTitan, Jobber, Google Workspace, Microsoft 365, la mayoria de CRMs y APIs personalizadas. El nivel Soberano de Operaciones incluye una capa de integracion de datos CRM y bancarios de Confianza Cero.',
        },
        {
          question: 'Que cubre exactamente la cuota mensual?',
          answer:
            'Para El Guardia de Ingresos y El Soberano de Operaciones, la cuota mensual es completamente incluida — cubre tu monitoreo activo, uso de API (llamadas de voz, tokens LLM), alojamiento y costos de infraestructura. Sin facturas separadas de proveedores externos. El uso por encima de tu asignacion incluida se factura a una tarifa plana por excedente, y se te notifica al alcanzar el 80% de tu limite mensual. La Fortaleza Empresarial opera con un modelo de API directo: tu gestionas tus propias cuentas de API (OpenAI, Twilio, etc.) para soberania total, y la cuota mensual cubre gestion, monitoreo y optimizacion solamente.',
        },
      ],
      contact: {
        question: 'Aun tienes preguntas?',
        cta: 'Ponte en contacto',
      },
    },

    finalCta: {
      badge: 'Espacios de implementacion limitados',
      heading: 'La complejidad es donde esta el riesgo.',
      description:
        "No confies tu negocio a una agencia 'envoltorio'. Construye una fortaleza. Asegura tus ingresos futuros con un socio de infraestructura que implementa activos que posees para siempre.",
      ctaPrimary: 'Asegurar Mi Infraestructura',
      ctaSecondary: 'Calcular Ahorros de Overhead',
      trustSignals: [
        { icon: 'shield', label: 'Monitoreo de Defensa Activa' },
        { icon: 'lock', label: 'Cero dependencia de proveedores' },
        { icon: 'clock', label: 'Garantia de tiempo de actividad 24/7' },
      ],
    },

    footer: {
      tagline: 'Infraestructura de IA soberana para PYMEs. Posee tus agentes. Elimina tu overhead.',
      sections: {
        solutions: 'Infraestructura',
        company: 'Empresa',
        resources: 'Recursos',
      },
      links: {
        solutions: [
          { label: 'El Guardia de Ingresos', href: '#pricing' },
          { label: 'Protocolo de Flujo de Trabajo Soberano', href: '#pricing' },
          { label: 'Operaciones con Barandillas de Responsabilidad', href: '#pricing' },
          { label: 'Fortaleza Empresarial', href: '#pricing' },
        ],
        company: [
          { label: 'Acerca de', href: '#how-it-works' },
          { label: 'Casos de Estudio', href: '#case-studies' },
          { label: 'Precios', href: '#pricing' },
          { label: 'Contacto', href: '#get-started' },
        ],
        resources: [
          { label: 'Calculadora de ROI', href: '#roi-calculator' },
          { label: 'Blog', href: '#case-studies' },
          { label: 'Preguntas Frecuentes', href: '#faq' },
          { label: 'Soporte', href: '#get-started' },
        ],
      },
      copyright: 'elev8tion. Todos los derechos reservados.',
      privacyPolicy: 'Politica de Privacidad',
      termsOfService: 'Terminos de Servicio',
      aiDisclosure: 'Divulgacion de IA',
      refundPolicy: 'Politica de Reembolso',
    },

    voiceAgent: {
      states: {
        idle: { title: 'Listo para Ayudar', description: 'Haz clic para hacer una pregunta' },
        listening: { title: 'Escuchando...', description: 'Di tu pregunta' },
        processing: {
          title: 'Procesando Tu Pregunta...',
          description: 'Analizando y preparando respuesta...'
        },
        speaking: {
          title: 'Respuesta de IA',
          description: 'Escucha o lee abajo ↓'
        },
      },
      transcript: 'Preguntaste:',
      aiResponse: 'Respuesta de IA:',
      yourQuestion: 'Tu Pregunta:',
      autoClose: {
        prompt: 'Necesitas mas informacion o tienes otra pregunta?',
        seconds: 'segundos hasta cierre automatico',
        askAnother: 'Hacer Otra Pregunta',
        stayOpen: 'Mantener Abierto',
      },
      buttons: {
        stop: 'Detener',
        close: 'Cerrar',
      },
      hint: '¡Chatea Por Voz Conmigo!',
      errors: {
        notSupported: 'La grabacion de voz no es compatible con este navegador.',
      },
      textInput: {
        email: 'Correo Electrónico',
        name: 'Nombre Completo',
        phone: 'Número de Teléfono',
        company: 'Nombre de la Empresa',
        industry: 'Industria',
      },
    },

    languageSwitcher: {
      label: 'Idioma',
    },

    booking: {
      title: 'Agenda una Llamada',
      selectDate: 'Selecciona una fecha para tu llamada estrategica',
      selectTime: 'Elige tu horario preferido',
      enterDetails: 'Ingresa tus datos para confirmar',
      typeSelection: {
        heading: 'Como te gustaria conectar?',
        orDivider: 'o',
        alreadyCertain: 'Ya estas seguro de que quieres IA para tu negocio?',
        consultation: {
          title: 'Llamada Estrategica Gratuita',
          description: 'Una videollamada de 30 minutos para discutir tus objetivos de negocio y explorar oportunidades de IA.',
          price: 'Gratis',
          duration: 'Videollamada de 30 min',
        },
        assessment: {
          title: 'Evaluacion de Operaciones en Sitio',
          description: 'Salta la llamada. Voy a tu lugar de negocio para acompanar a ti o a un miembro de tu equipo y entender tus operaciones de primera mano.',
          price: '$250',
          duration: 'Visita presencial de 3 horas',
          includes: 'Reporte estrategico completo incluido',
          process: [
            'Te acompano a ti o a un miembro de tu equipo durante 3 horas — recorridos, flujos de trabajo, operaciones diarias',
            'Identifico donde los sistemas de IA agentica pueden optimizar y hacer crecer tu negocio',
            'Nos sentamos juntos a revisar un resumen de las oportunidades que identifique',
            'Tu decides si deseas invertir en la implementacion y eliges un nivel de asociacion',
          ],
          whyPaid: 'La tarifa de $250 asegura que mi experiencia y tiempo sean compensados sin importar el resultado. Si decides no continuar, igual recibes un reporte estrategico completo con todas las recomendaciones — es tuyo.',
          cta: 'Reservar Evaluacion en Sitio — $250',
        },
      },
      form: {
        name: 'Nombre Completo',
        namePlaceholder: 'Juan Garcia',
        email: 'Correo Electronico',
        emailPlaceholder: 'juan@empresa.com',
        phone: 'Numero de Telefono (opcional)',
        phonePlaceholder: '+52 (55) 1234-5678',
        companyName: 'Empresa / Nombre del Negocio',
        companyNamePlaceholder: 'Plomeria Acme LLC',
        industry: 'Industria',
        industryPlaceholder: 'ej. HVAC, Bienes Raices, Construccion',
        employeeCount: 'Numero de Empleados',
        employeeCountPlaceholder: 'ej. 12',
        challenge: 'Mayor Desafio Operacional (opcional)',
        challengePlaceholder: 'Que es lo que mas retrasa a tu equipo o te cuesta mas tiempo?',
        referralSource: 'Como te enteraste de nosotros? (opcional)',
        referralSourcePlaceholder: 'Google, referencia, redes sociales, etc.',
        websiteUrl: 'URL del Sitio Web (opcional)',
        websiteUrlPlaceholder: 'https://tuempresa.com',
        yourInfo: 'Tu Informacion',
        aboutBusiness: 'Sobre Tu Negocio',
        submit: 'Confirmar Reserva',
        submitting: 'Reservando...',
        submitAssessment: 'Continuar al Pago ($250)',
        submittingAssessment: 'Redirigiendo al pago...',
        assessmentDuration: '3 hrs',
        required: 'Campos requeridos',
        termsAgreement: 'Acepto los <terms>Terminos de Servicio</terms> y la <refund>Politica de Reembolso</refund>',
        termsRequired: 'Debe aceptar los Terminos de Servicio y la Politica de Reembolso',
      },
      confirmation: {
        title: 'Reserva Confirmada!',
        subtitle: 'Todo listo. Esperamos hablar contigo pronto.',
        date: 'Fecha',
        time: 'Hora',
        duration: '30 minutos',
        email: 'Confirmacion enviada a',
        addToCalendar: 'Agregar a tu calendario',
        googleCalendar: 'Google',
        appleCalendar: 'Apple',
        outlookCalendar: 'Outlook',
        done: 'Listo',
        confirmationSent: 'Se ha enviado un correo de confirmacion a tu bandeja de entrada.',
      },
      paymentSuccess: {
        title: 'Evaluacion Confirmada y Pagada!',
        subtitle: 'Tu evaluacion de operaciones en sitio ha sido reservada. Esperamos visitar tu negocio.',
        amount: 'Monto Pagado',
        whatToExpect: 'Que Esperar',
        expectItems: [
          'Una visita presencial de 3 horas — acompanare a ti o a un miembro de tu equipo para entender las operaciones del dia a dia',
          'Recorridos, observacion de flujos de trabajo y tiempo practico con tu equipo',
          'Una revision en persona de las oportunidades de IA que identifique para tu negocio',
          'Discusion de niveles de asociacion si decides avanzar con la implementacion',
        ],
        strategyDocNote: 'Despues de la evaluacion, recibiras un reporte estrategico completo con todas las recomendaciones — ya sea que decidas continuar con nuestros servicios o no. Es tuyo.',
        addToCalendar: 'Agregar a tu calendario',
        googleCalendar: 'Google',
        appleCalendar: 'Apple',
        outlookCalendar: 'Outlook',
        backToHome: 'Volver al Inicio',
        error: 'Algo salio mal. Por favor contactanos si se te cobro.',
        processing: 'Verificando tu pago...',
      },
    },
  },
};
