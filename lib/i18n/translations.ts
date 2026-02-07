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
    yourBusinessDetails: string;
    labels: {
      industry: string;
      businessSize: string;
      timeValue: string;
      partnershipTier: string;
    };
    industryNote: string;
    timeValueNote: string;
    industries: Array<{ id: string; name: string }>;
    employeeSizes: Array<{ id: string; name: string }>;
    tiers: Array<{ id: string; name: string }>;
    results: {
      heading: string;
      timeSaved: string;
      weeklyValue: string;
      investment: string;
      systemsBuilt: string;
      totalValueCreated: string;
      over: string;
      weeks: string;
      yourRoi: string;
      paysForItself: string;
      continuesGenerating: string;
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
      doneForYou: string;
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
  };

  voiceAgent: {
    states: {
      idle: { title: string; description: string };
      listening: { title: string; description: string };
      processing: { title: string; description: string };
      speaking: { title: string; description: string };
    };
    transcript: string;
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
    errors: {
      notSupported: string;
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
      };
    };
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      notes: string;
      notesPlaceholder: string;
      submit: string;
      submitting: string;
      submitAssessment: string;
      submittingAssessment: string;
      assessmentNotesPlaceholder: string;
      assessmentDuration: string;
      required: string;
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
      badge: '50+ SMBs Building Their Own AI Systems',
      titlePart1: 'Build',
      titleHighlight: 'Intelligent AI Systems',
      titlePart2: 'That Transform Your Business',
      description:
        "Your creative partner for building agentic systems. Learn where in your business the opportunities are to design, deploy, and master AI that works for you—not just with you now and for future industry leading changes. We can guide and stick with you every step of the way.",
      ctaPrimary: 'Start Building Together',
      ctaSecondary: 'See Our Partnership',
      stats: {
        agentsBuilt: { value: '100+', label: 'AI Agents Built' },
        toMastery: { value: '8 weeks', label: 'To System Mastery' },
        smbsBuilding: { value: '50+', label: 'SMBs Building AI' },
        buildIndependently: { value: '95%', label: 'Build Independently' },
      },
    },

    socialProof: {
      heading: 'Trusted by service businesses across industries',
      companies: [
        { name: 'Peak HVAC', industry: 'HVAC' },
        { name: 'Metro Property', industry: 'Property' },
        { name: 'ProFlow Plumbing', industry: 'Plumbing' },
        { name: 'Elite Construction', industry: 'Construction' },
        { name: 'Spark Electric', industry: 'Electrical' },
      ],
    },

    problem: {
      tag: 'The Real Challenge',
      heading: "The opportunity isn't just efficiency—it's capability",
      description:
        "You don't just need AI tools. You need to understand where the opportunities are and how to build intelligent systems that transform your business for the future.",
      painPoints: [
        {
          title: 'You know AI is the future, but where do you start?',
          description:
            "The AI revolution is happening now. Your competitors are building systems while you're still researching. You need a partner who can show you the opportunities in YOUR business.",
          stat: '78% feel behind',
        },
        {
          title: 'Tired of expensive consultants that leave you dependent',
          description:
            "Done-for-you services cost $10K+/month and disappear when you stop paying. You want to BUILD capability, not rent it. Learn to create systems that you own and control.",
          stat: '$120K+/year cost',
        },
        {
          title: "Generic AI tools don't fit your unique business",
          description:
            "ChatGPT and off-the-shelf software can't handle your specific workflows. You need custom intelligent systems designed around YOUR operations, built to adapt as your industry changes.",
          stat: '65% poor fit',
        },
        {
          title: 'You want to learn and build, not just buy',
          description:
            "You're a builder at heart. You want to understand how AI systems work, identify opportunities yourself, and create intelligent solutions that grow with your business for years to come.",
          stat: 'Learning = ownership',
        },
      ],
    },

    howItWorks: {
      tag: 'Our Partnership',
      heading: 'Build intelligent systems together—your way',
      description:
        'A collaborative journey from discovering opportunities to mastering AI systems that transform your business for the future.',
      subDescription:
        "Whether you want to build systems yourself, understand how AI works, or train your team—we'll guide and stick with you every step of the way.",
      steps: [
        {
          step: '01',
          title: 'Discover Opportunities Together',
          description:
            'Learn agentic systems fundamentals while we explore YOUR business together. Identify where AI can transform your operations now and prepare for future industry changes.',
          duration: 'Week 1-2',
          deliverable: 'Your AI roadmap + foundational knowledge',
        },
        {
          step: '02',
          title: 'Co-Create Your Systems',
          description:
            'Build your first intelligent systems side-by-side. Learn how to design agents, integrate existing AI tools, and create solutions tailored to your unique workflows.',
          duration: 'Week 3-6',
          deliverable: 'Working AI systems + technical capability',
        },
        {
          step: '03',
          title: 'Deploy & Master Independence',
          description:
            'Launch your systems with ongoing partnership support. Learn to monitor, optimize, and expand on your own. Master the skills to identify and build new systems independently.',
          duration: 'Week 7+',
          deliverable: 'Production systems + independent mastery',
        },
      ],
      youllGet: "You'll Get:",
      features: ['Collaborative building', 'Continuous learning', 'Tools & templates', 'Ongoing support'],
    },

    useCases: {
      tag: 'Intelligent Systems',
      heading: 'Agentic systems that learn and adapt',
      description:
        "Build intelligent systems tailored to YOUR business—regardless of industry. Each system type teaches you new capabilities you can apply across your operations. These are examples, not limits.",
      complexityLevels: [
        { id: 'all', name: 'All Systems' },
        { id: 'beginner', name: 'Beginner' },
        { id: 'intermediate', name: 'Intermediate' },
        { id: 'advanced', name: 'Advanced' },
      ],
      systems: [
        {
          id: 1,
          complexity: 'beginner',
          name: 'Customer Communication Agent',
          description:
            'Intelligent systems that handle inquiries, schedule appointments, send follow-ups, and maintain conversation context across channels.',
          whatYouLearn: 'Natural language processing, calendar integration, CRM connections',
          industries: 'Any customer-facing business',
          capabilities: ['24/7 availability', 'Context retention', 'Multi-channel'],
        },
        {
          id: 2,
          complexity: 'beginner',
          name: 'Task Automation Agent',
          description:
            'Smart agents that automate repetitive workflows like data entry, email responses, and status updates based on triggers you define.',
          whatYouLearn: 'Workflow automation, trigger design, API integrations',
          industries: 'Operations-heavy businesses',
          capabilities: ['Trigger-based', 'Rule learning', 'Error handling'],
        },
        {
          id: 3,
          complexity: 'intermediate',
          name: 'Intelligent Document Processor',
          description:
            'Advanced systems that read proposals, invoices, contracts; extract critical data; route for action; and learn from patterns over time.',
          whatYouLearn: 'Document AI, data extraction, pattern recognition',
          industries: 'Construction, legal, property management',
          capabilities: ['OCR + Understanding', 'Smart routing', 'Learning system'],
        },
        {
          id: 4,
          complexity: 'intermediate',
          name: 'Predictive Business Analyst',
          description:
            'Data-driven agents that analyze sales patterns, forecast cash flow, identify opportunities, and alert you to trends before they become problems.',
          whatYouLearn: 'Data analysis, forecasting models, business intelligence',
          industries: 'Any data-driven business',
          capabilities: ['Trend detection', 'Forecasting', 'Opportunity alerts'],
        },
        {
          id: 5,
          complexity: 'advanced',
          name: 'Multi-Agent Orchestration',
          description:
            'Coordinated systems where multiple specialized agents work together, delegating tasks and sharing information to handle complex workflows.',
          whatYouLearn: 'Agent collaboration, task delegation, system architecture',
          industries: 'Complex operations businesses',
          capabilities: ['Agent coordination', 'Dynamic routing', 'Scalable'],
        },
        {
          id: 6,
          complexity: 'advanced',
          name: 'Adaptive Learning System',
          description:
            'Intelligent systems that continuously learn from your business operations, adapt to changes, and suggest optimizations based on what works.',
          whatYouLearn: 'Machine learning integration, feedback loops, optimization',
          industries: 'Future-focused businesses',
          capabilities: ['Self-improving', 'Adaptive behavior', 'Optimization'],
        },
      ],
      youllLearn: "You'll Learn:",
      bottomNote:
        "These are system types, not rigid templates. We'll work together to adapt them to your unique business needs and opportunities—no matter what industry you're in.",
    },

    caseStudies: {
      tag: 'Real Results',
      heading: 'Small businesses building big capabilities',
      description:
        'Real SMBs across diverse industries achieving 150-450% ROI within 2-6 months by building intelligent systems together. Your business can too.',
      cases: [
        {
          company: 'Local HVAC Company',
          industry: 'Home Services',
          revenue: '$1.2M annual revenue',
          employees: '8 employees',
          tier: 'Foundation Builder',
          investment: '$9,500',
          timeline: '3 months',
          challenge:
            'Owner spending 15 hours/week on scheduling and admin. Missing maintenance contract opportunities.',
          systemsBuilt: [
            'Customer Communication Agent - 24/7 appointment scheduling',
            'Job Data Automation - Automatic QuickBooks entry',
            'Maintenance Contract Agent - Proactive renewal offers',
          ],
          results: {
            timeSaved: '20 hours/week',
            revenueImpact: '23% increase in maintenance contracts',
            customerSat: 'Response time: 4 hours \u2192 15 minutes',
            roi: '153%',
            roiPeriod: '3 months',
            totalValue: '$24,000',
          },
          quote:
            "I learned how to build these systems myself. Now I'm thinking about what else we can automate. This changed how I think about running my business.",
          owner: 'Mike T.',
        },
        {
          company: 'Boutique Marketing Agency',
          industry: 'Professional Services',
          revenue: '$850K annual revenue',
          employees: '5 employees',
          tier: 'AI Discovery',
          investment: '$4,000',
          timeline: '2 months',
          challenge: 'Spending 10+ hours/week writing similar proposals. Limited capacity for new clients.',
          systemsBuilt: [
            'Intelligent Proposal Generator - AI-powered proposal creation',
            'Past project analysis and case study matching',
            'Automated pricing and timeline generation',
          ],
          results: {
            timeSaved: '14 hours/week',
            revenueImpact: 'Increased proposals from 3/week to 8/week',
            customerSat: 'Maintained 35% win rate with 2.5x more proposals',
            roi: '450%',
            roiPeriod: '2 months',
            totalValue: '$22,000',
          },
          quote:
            'We started small to test it. After seeing how this one system changed our proposal process, we immediately upgraded to Foundation Builder.',
          owner: 'Sarah K.',
        },
        {
          company: 'Regional Property Management',
          industry: 'Real Estate Services',
          revenue: '$3.2M annual revenue',
          employees: '12 employees',
          tier: 'Systems Architect',
          investment: '$30,000',
          timeline: '6 months',
          challenge: 'Managing 180 units with manual processes. Reactive maintenance. High tenant turnover.',
          systemsBuilt: [
            'Intelligent Maintenance Coordinator - Auto-triage and routing',
            'Lease Renewal Agent - Predictive pricing and automation',
            'Predictive Maintenance System - Prevent failures before they happen',
            'Tenant Screening Automation - Consistent, fast decisions',
            'Multi-Agent Orchestration - All systems working together',
          ],
          results: {
            timeSaved: '35 hours/week',
            revenueImpact: 'Lease renewal rate: 68% \u2192 81%',
            customerSat: 'Tenant NPS: 42 \u2192 67',
            roi: '198%',
            roiPeriod: '6 months',
            totalValue: '$89,520',
          },
          quote:
            "We didn't just buy software—we learned how to think like AI builders. Now our team identifies automation opportunities everywhere. This is a competitive advantage that will last for years.",
          owner: 'James L.',
        },
      ],
      labels: {
        challenge: 'Challenge:',
        partnershipTier: 'Partnership Tier',
        systemsBuiltTogether: 'Systems Built Together',
        measurableResults: 'Measurable Results',
        timeSaved: 'Time Saved',
        roiIn: 'ROI in',
        totalValueCreated: 'Total Value Created',
        revenueImpact: 'Revenue Impact',
        customerExperience: 'Customer Experience',
        owner: 'Owner',
      },
      bottomStats: {
        heading: 'Industry-Backed Results',
        description:
          'Based on documented agentic system outcomes and conservative ROI estimates across all business types',
        stats: [
          { stat: '10-35 hrs/week', label: 'Typical Time Savings' },
          { stat: '150-300%', label: 'Average ROI (3-6 months)' },
          { stat: '68%', label: 'SMBs Now Using AI' },
          { stat: '$10K+', label: 'Avg Annual AI Spend' },
        ],
        note: "These examples span home services, professional services, and real estate. We build systems for any business type—your industry is next.",
      },
    },

    roiCalculator: {
      tag: 'Calculate Your ROI',
      heading: 'See your capability return on investment',
      description:
        'We build intelligent systems for ANY business type. Based on real data from 68% of SMBs already using AI. Conservative estimates show most businesses achieve 150-300% ROI within 3-6 months.',
      yourBusinessDetails: 'Your Business Details',
      labels: {
        industry: 'Industry',
        businessSize: 'Business Size',
        timeValue: 'Your Time Value (per hour)',
        partnershipTier: 'Partnership Tier',
      },
      industryNote: 'Don\'t see your industry? We work with all business types—select "Other" for general estimates.',
      timeValueNote: 'Industry average: Service businesses $50-100/hr, Professional services $100-200/hr',
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
      results: {
        heading: 'Your Projected Results',
        timeSaved: 'Time Saved',
        weeklyValue: 'Weekly Value',
        investment: 'Investment',
        systemsBuilt: 'Systems Built',
        totalValueCreated: 'Total Value Created',
        over: 'Over',
        weeks: 'weeks',
        yourRoi: 'Your ROI',
        paysForItself: 'Pays for itself in ~',
        continuesGenerating: 'weeks, then continues generating value',
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
        heading: 'Compare Alternatives',
        traditionalConsultant: 'Traditional Consultant',
        doneForYou: 'Done-for-you Service',
        aiSmbPartners: 'AI KRE8TION Partners',
        savePercent: 'Save',
        ownCapability: '% vs alternatives + you own the capability forever',
      },
      cta: 'Start Building Your Systems',
      disclaimer:
        'Calculations based on conservative estimates from industry data (McKinsey, Gartner, SBA reports). Actual results vary by business. Time savings data from documented agentic system implementations across 68% of SMBs currently using AI in 2025.',
    },

    pricing: {
      tag: 'Partnership Investment',
      heading: 'Invest in capability, not dependency',
      description:
        'One-time capability transfer fee + ongoing partnership support. Our goal is your independence, not your ongoing payments.',
      afterMinimum:
        "After minimum term: You're independent! Extend sessions month-to-month if you want continued guidance on new projects.",
      tiers: [
        {
          name: 'AI Discovery',
          subtitle: 'Perfect starter',
          setupFee: '$2,500',
          monthlyFee: '$750',
          minimumTerm: '2 months',
          description: 'Discover where AI can transform YOUR business and build your first intelligent system',
          includes: 'Includes custom voice agent + 2 core systems',
          features: [
            '4-week AI opportunity assessment',
            'Custom voice agent for your website (or your customer’s website)',
            'Build 2 core agentic systems',
            'Flexible learning: learn as little or as much as you want (we can also train a team member)',
            'Bi-weekly co-creation sessions (video calls)',
            'Email support between sessions',
            'Starter templates & frameworks',
            'Documentation & resources',
            "You'll learn: AI fundamentals, system design basics",
          ],
          outcome: 'First working AI system + clear roadmap',
          cta: 'Start Your Journey',
          highlighted: false,
          roiText: '200-450% in 2 months',
        },
        {
          name: 'Foundation Builder',
          subtitle: 'Most popular',
          setupFee: '$5,000',
          monthlyFee: '$1,500',
          minimumTerm: '3 months',
          description: 'Build multiple intelligent systems and master AI fundamentals',
          includes: 'Includes custom voice agent + 5 systems',
          features: [
            'Everything in AI Discovery',
            '8-week comprehensive AI training',
            'Custom voice agent for your website (or your customer’s website)',
            'Build 5 agentic systems',
            'Flexible learning: learn as little or as much as you want (we can also train a team member)',
            'Weekly co-creation sessions (video calls)',
            'Priority email & messaging support',
            'Full template library & tools',
            "You'll learn: System design, deployment, integration",
          ],
          outcome: 'Independent with foundational systems',
          cta: 'Build Your Foundation',
          highlighted: true,
          roiText: '150-250% in 3 months',
        },
        {
          name: 'Systems Architect',
          subtitle: 'Advanced capability',
          setupFee: '$12,000',
          monthlyFee: '$3,000',
          minimumTerm: '6 months',
          description: 'Transform your operations with advanced intelligent systems',
          includes: 'Includes custom voice agent + 8 systems',
          features: [
            'Everything in Foundation Builder',
            'Custom voice agent for your website (or your customer’s website)',
            'Build 8 agentic systems',
            'Flexible learning: learn as little or as much as you want (we can also train a team member)',
            'Custom system architecture design',
            'Advanced training: Multi-agent orchestration',
            'Priority email & messaging support',
            'Monthly strategy sessions (dedicated)',
            "You'll learn: Advanced patterns, scaling, optimization",
          ],
          outcome: 'Master builder with production systems',
          cta: 'Transform Your Business',
          highlighted: false,
          roiText: '180-300% in 6 months',
        },
        {
          name: 'AI-Native Enterprise',
          subtitle: 'Full transformation',
          setupFee: 'Custom',
          monthlyFee: 'Custom',
          minimumTerm: 'Custom',
          description: 'Become an AI-first organization with enterprise capabilities',
          features: [
            'Everything in Systems Architect',
            'Unlimited agentic systems development',
            'Dedicated partnership manager',
            'Train your entire team as AI builders',
            'White-glove implementation support',
            'Multi-location/complex integration',
            "You'll learn: Enterprise architecture, team training, governance",
          ],
          outcome: 'AI-native business with internal capability',
          cta: 'Contact Us',
          highlighted: false,
        },
      ],
    labels: {
      capabilityTransfer: 'Capability Transfer',
      monthPartnership: '/month partnership',
      minimumForLearning: 'minimum for learning completion',
      recommended: 'RECOMMENDED',
      typicalRoi: 'Typical ROI',
      yourOutcome: 'Your Outcome',
      seeCapabilityRoi: 'See Capability ROI',
      flexibleLearning: 'Flexible learning',
      flexibleLearningText: 'Learn a lot or a little — we can train you or a team member',
      includes: 'Includes',
    },
      guarantee: {
        title: '30-Day Results Guarantee',
        description: "If you don't see measurable time savings within 30 days, we work for free until you do.",
        items: ['No long-term contracts', 'Cancel anytime', 'Your data stays yours'],
      },
    },

    faq: {
      tag: 'FAQ',
      heading: 'Common questions',
      description: 'Everything you need to know about agentic systems.',
      items: [
        {
          question: 'Do I need technical skills to use agentic systems?',
          answer:
            "No. We handle all the technical implementation. Your team will use simple interfaces—most look like the tools you already use. We provide training and ongoing support.",
        },
        {
          question: 'How long does it take to see results?',
          answer:
            'Most clients see measurable time savings within 2-4 weeks of their first workflow going live. Full ROI typically happens within 6-12 weeks depending on the package.',
        },
        {
          question: 'What happens to my data?',
          answer:
            'Your data stays yours. We use enterprise-grade security and never share or sell your information. All data processing follows strict privacy standards.',
        },
        {
          question: "What if it doesn't work for my business?",
          answer:
            "We offer a 30-day results guarantee. If you don't see measurable time savings, we'll work for free until you do. Plus, you can cancel after the initial 3-month period.",
        },
        {
          question: 'Can AI handle complex customer interactions?',
          answer:
            'Yes, with human oversight. Our AI handles routine tasks and escalates complex situations to your team. You stay in control of important decisions.',
        },
        {
          question: 'What systems do you integrate with?',
          answer:
            'We integrate with most popular business tools including QuickBooks, ServiceTitan, Jobber, Google Workspace, Microsoft 365, and many more. Custom integrations are available for Enterprise clients.',
        },
      ],
      contact: {
        question: 'Still have questions?',
        cta: 'Get in touch',
      },
    },

    finalCta: {
      badge: 'Limited availability',
      heading: 'Ready to get 30% of your time back?',
      description:
        'Join 50+ SMBs already saving time with agentic systems. Start with a comprehension meeting to identify your opportunities.',
      ctaPrimary: 'Schedule Comprehension Meeting',
      ctaSecondary: 'Calculate Your ROI',
      trustSignals: [
        { icon: 'shield', label: '30-day guarantee' },
        { icon: 'lock', label: 'No commitment' },
        { icon: 'clock', label: '30-min call' },
      ],
    },

    footer: {
      tagline: 'Agentic systems for SMBs. Get 30% of your time back in 30 days.',
      sections: {
        solutions: 'Solutions',
        company: 'Company',
        resources: 'Resources',
      },
      links: {
        solutions: [
          { label: 'Customer Communication Agents', href: '#solutions' },
          { label: 'Intelligent Document Processing', href: '#solutions' },
          { label: 'Predictive Business Analytics', href: '#solutions' },
          { label: 'Multi-Agent Orchestration', href: '#solutions' },
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
    },

    voiceAgent: {
      states: {
        idle: { title: 'Ready to Help', description: 'Click to ask a question' },
        listening: { title: 'Listening...', description: 'Speak your question' },
        processing: { title: 'Processing...', description: 'Thinking...' },
        speaking: { title: 'Speaking...', description: 'Playing response' },
      },
      transcript: 'You asked:',
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
      errors: {
        notSupported: 'Voice recording is not supported in this browser.',
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
        consultation: {
          title: 'Free Strategy Call',
          description: 'A 30-minute video call to discuss your business goals and explore AI opportunities.',
          price: 'Free',
          duration: '30 min video call',
        },
        assessment: {
          title: 'Onsite Assessment',
          description: 'An in-person walkthrough of your business operations to identify AI opportunities.',
          price: '$250',
          duration: '60 min onsite visit',
          includes: 'Includes strategy document',
        },
      },
      form: {
        name: 'Full Name',
        namePlaceholder: 'John Smith',
        email: 'Email Address',
        emailPlaceholder: 'john@company.com',
        phone: 'Phone Number (optional)',
        phonePlaceholder: '+1 (555) 123-4567',
        notes: 'Anything you want us to know? (optional)',
        notesPlaceholder: 'Tell us about your business or what you hope to discuss...',
        submit: 'Confirm Booking',
        submitting: 'Booking...',
        submitAssessment: 'Continue to Payment ($250)',
        submittingAssessment: 'Redirecting to payment...',
        assessmentNotesPlaceholder: 'Tell us about your business operations, team size, and what challenges you face...',
        assessmentDuration: '60 min',
        required: 'Required fields',
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
        subtitle: 'Your onsite AI assessment has been booked. We look forward to visiting your business.',
        amount: 'Amount Paid',
        whatToExpect: 'What to Expect',
        expectItems: [
          'A 60-minute walkthrough of your business operations',
          'Identification of specific AI automation opportunities',
          'Discussion of agentic systems tailored to your workflows',
          'A detailed strategy document delivered after the visit',
        ],
        strategyDocNote: 'After the assessment, you will receive a detailed strategy document with all implementation recommendations, whether or not you proceed with our services.',
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
      badge: '50+ PYMEs Construyendo Sus Propios Sistemas de IA',
      titlePart1: 'Construye',
      titleHighlight: 'Sistemas de IA Inteligentes',
      titlePart2: 'Que Transforman Tu Negocio',
      description:
        'Tu socio creativo para construir sistemas agenticos. Aprende donde estan las oportunidades en tu negocio para disenar, implementar y dominar la IA que trabaja para ti, no solo contigo ahora y para futuros cambios lideres en la industria. Podemos guiarte y acompanarte en cada paso del camino.',
      ctaPrimary: 'Comienza a Construir Juntos',
      ctaSecondary: 'Ver Nuestra Alianza',
      stats: {
        agentsBuilt: { value: '100+', label: 'Agentes IA Construidos' },
        toMastery: { value: '8 semanas', label: 'Hasta el Dominio' },
        smbsBuilding: { value: '50+', label: 'PYMEs Construyendo IA' },
        buildIndependently: { value: '95%', label: 'Construyen Independientemente' },
      },
    },

    socialProof: {
      heading: 'Confianza de empresas de servicios en diversas industrias',
      companies: [
        { name: 'Peak HVAC', industry: 'Climatizacion' },
        { name: 'Metro Property', industry: 'Propiedades' },
        { name: 'ProFlow Plumbing', industry: 'Plomeria' },
        { name: 'Elite Construction', industry: 'Construccion' },
        { name: 'Spark Electric', industry: 'Electricidad' },
      ],
    },

    problem: {
      tag: 'El Verdadero Desafio',
      heading: 'La oportunidad no es solo eficiencia, es capacidad',
      description:
        'No solo necesitas herramientas de IA. Necesitas entender donde estan las oportunidades y como construir sistemas inteligentes que transformen tu negocio para el futuro.',
      painPoints: [
        {
          title: 'Sabes que la IA es el futuro, pero donde empiezas?',
          description:
            'La revolucion de la IA esta sucediendo ahora. Tus competidores estan construyendo sistemas mientras tu todavia investigas. Necesitas un socio que te muestre las oportunidades en TU negocio.',
          stat: '78% se sienten atrasados',
        },
        {
          title: 'Cansado de consultores caros que te dejan dependiente',
          description:
            'Los servicios "llave en mano" cuestan $10K+/mes y desaparecen cuando dejas de pagar. Quieres CONSTRUIR capacidad, no rentarla. Aprende a crear sistemas que posees y controlas.',
          stat: '$120K+/ano de costo',
        },
        {
          title: 'Las herramientas genericas de IA no se adaptan a tu negocio unico',
          description:
            'ChatGPT y el software estandar no pueden manejar tus flujos de trabajo especificos. Necesitas sistemas inteligentes personalizados disenados alrededor de TUS operaciones, construidos para adaptarse a medida que tu industria cambia.',
          stat: '65% mala adaptacion',
        },
        {
          title: 'Quieres aprender y construir, no solo comprar',
          description:
            'Eres un constructor de corazon. Quieres entender como funcionan los sistemas de IA, identificar oportunidades tu mismo y crear soluciones inteligentes que crezcan con tu negocio por anos.',
          stat: 'Aprender = propiedad',
        },
      ],
    },

    howItWorks: {
      tag: 'Nuestra Alianza',
      heading: 'Construye sistemas inteligentes juntos, a tu manera',
      description:
        'Un viaje colaborativo desde descubrir oportunidades hasta dominar sistemas de IA que transforman tu negocio para el futuro.',
      subDescription:
        'Ya sea que quieras construir sistemas tu mismo, entender como funciona la IA, o entrenar a tu equipo, te guiaremos y acompanaremos en cada paso del camino.',
      steps: [
        {
          step: '01',
          title: 'Descubre Oportunidades Juntos',
          description:
            'Aprende los fundamentos de sistemas agenticos mientras exploramos TU negocio juntos. Identifica donde la IA puede transformar tus operaciones ahora y preparte para futuros cambios en la industria.',
          duration: 'Semana 1-2',
          deliverable: 'Tu hoja de ruta de IA + conocimiento fundamental',
        },
        {
          step: '02',
          title: 'Co-Crea Tus Sistemas',
          description:
            'Construye tus primeros sistemas inteligentes lado a lado. Aprende a disenar agentes, integrar herramientas de IA existentes y crear soluciones adaptadas a tus flujos de trabajo unicos.',
          duration: 'Semana 3-6',
          deliverable: 'Sistemas de IA funcionando + capacidad tecnica',
        },
        {
          step: '03',
          title: 'Implementa y Domina la Independencia',
          description:
            'Lanza tus sistemas con soporte continuo de la alianza. Aprende a monitorear, optimizar y expandir por tu cuenta. Domina las habilidades para identificar y construir nuevos sistemas independientemente.',
          duration: 'Semana 7+',
          deliverable: 'Sistemas en produccion + dominio independiente',
        },
      ],
      youllGet: 'Obtendras:',
      features: ['Construccion colaborativa', 'Aprendizaje continuo', 'Herramientas y plantillas', 'Soporte continuo'],
    },

    useCases: {
      tag: 'Sistemas Inteligentes',
      heading: 'Sistemas agenticos que aprenden y se adaptan',
      description:
        'Construye sistemas inteligentes adaptados a TU negocio, sin importar la industria. Cada tipo de sistema te ensena nuevas capacidades que puedes aplicar en todas tus operaciones. Estos son ejemplos, no limites.',
      complexityLevels: [
        { id: 'all', name: 'Todos los Sistemas' },
        { id: 'beginner', name: 'Principiante' },
        { id: 'intermediate', name: 'Intermedio' },
        { id: 'advanced', name: 'Avanzado' },
      ],
      systems: [
        {
          id: 1,
          complexity: 'beginner',
          name: 'Agente de Comunicacion con Clientes',
          description:
            'Sistemas inteligentes que manejan consultas, programan citas, envian seguimientos y mantienen contexto de conversacion a traves de canales.',
          whatYouLearn: 'Procesamiento de lenguaje natural, integracion de calendario, conexiones CRM',
          industries: 'Cualquier negocio orientado al cliente',
          capabilities: ['Disponibilidad 24/7', 'Retencion de contexto', 'Multi-canal'],
        },
        {
          id: 2,
          complexity: 'beginner',
          name: 'Agente de Automatizacion de Tareas',
          description:
            'Agentes inteligentes que automatizan flujos de trabajo repetitivos como entrada de datos, respuestas de correo y actualizaciones de estado basadas en disparadores que tu defines.',
          whatYouLearn: 'Automatizacion de flujos, diseno de disparadores, integraciones API',
          industries: 'Negocios con operaciones intensivas',
          capabilities: ['Basado en disparadores', 'Aprendizaje de reglas', 'Manejo de errores'],
        },
        {
          id: 3,
          complexity: 'intermediate',
          name: 'Procesador Inteligente de Documentos',
          description:
            'Sistemas avanzados que leen propuestas, facturas, contratos; extraen datos criticos; enrutan para accion; y aprenden de patrones con el tiempo.',
          whatYouLearn: 'IA de documentos, extraccion de datos, reconocimiento de patrones',
          industries: 'Construccion, legal, administracion de propiedades',
          capabilities: ['OCR + Comprension', 'Enrutamiento inteligente', 'Sistema de aprendizaje'],
        },
        {
          id: 4,
          complexity: 'intermediate',
          name: 'Analista de Negocios Predictivo',
          description:
            'Agentes basados en datos que analizan patrones de ventas, pronostican flujo de caja, identifican oportunidades y te alertan sobre tendencias antes de que se conviertan en problemas.',
          whatYouLearn: 'Analisis de datos, modelos de pronostico, inteligencia de negocios',
          industries: 'Cualquier negocio basado en datos',
          capabilities: ['Deteccion de tendencias', 'Pronostico', 'Alertas de oportunidades'],
        },
        {
          id: 5,
          complexity: 'advanced',
          name: 'Orquestacion Multi-Agente',
          description:
            'Sistemas coordinados donde multiples agentes especializados trabajan juntos, delegando tareas y compartiendo informacion para manejar flujos de trabajo complejos.',
          whatYouLearn: 'Colaboracion de agentes, delegacion de tareas, arquitectura de sistemas',
          industries: 'Negocios con operaciones complejas',
          capabilities: ['Coordinacion de agentes', 'Enrutamiento dinamico', 'Escalable'],
        },
        {
          id: 6,
          complexity: 'advanced',
          name: 'Sistema de Aprendizaje Adaptativo',
          description:
            'Sistemas inteligentes que aprenden continuamente de las operaciones de tu negocio, se adaptan a cambios y sugieren optimizaciones basadas en lo que funciona.',
          whatYouLearn: 'Integracion de machine learning, ciclos de retroalimentacion, optimizacion',
          industries: 'Negocios enfocados en el futuro',
          capabilities: ['Auto-mejora', 'Comportamiento adaptativo', 'Optimizacion'],
        },
      ],
      youllLearn: 'Aprenderas:',
      bottomNote:
        'Estos son tipos de sistemas, no plantillas rigidas. Trabajaremos juntos para adaptarlos a las necesidades y oportunidades unicas de tu negocio, sin importar en que industria estes.',
    },

    caseStudies: {
      tag: 'Resultados Reales',
      heading: 'Pequenos negocios construyendo grandes capacidades',
      description:
        'PYMEs reales en diversas industrias logrando 150-450% de ROI en 2-6 meses construyendo sistemas inteligentes juntos. Tu negocio tambien puede.',
      cases: [
        {
          company: 'Empresa Local de HVAC',
          industry: 'Servicios del Hogar',
          revenue: '$1.2M ingresos anuales',
          employees: '8 empleados',
          tier: 'Constructor de Base',
          investment: '$9,500',
          timeline: '3 meses',
          challenge:
            'Dueno pasando 15 horas/semana en programacion y administracion. Perdiendo oportunidades de contratos de mantenimiento.',
          systemsBuilt: [
            'Agente de Comunicacion con Clientes - Programacion de citas 24/7',
            'Automatizacion de Datos de Trabajo - Entrada automatica a QuickBooks',
            'Agente de Contratos de Mantenimiento - Ofertas proactivas de renovacion',
          ],
          results: {
            timeSaved: '20 horas/semana',
            revenueImpact: '23% aumento en contratos de mantenimiento',
            customerSat: 'Tiempo de respuesta: 4 horas \u2192 15 minutos',
            roi: '153%',
            roiPeriod: '3 meses',
            totalValue: '$24,000',
          },
          quote:
            'Aprendi a construir estos sistemas yo mismo. Ahora estoy pensando en que mas podemos automatizar. Esto cambio como pienso sobre administrar mi negocio.',
          owner: 'Mike T.',
        },
        {
          company: 'Agencia de Marketing Boutique',
          industry: 'Servicios Profesionales',
          revenue: '$850K ingresos anuales',
          employees: '5 empleados',
          tier: 'Descubrimiento de IA',
          investment: '$4,000',
          timeline: '2 meses',
          challenge:
            'Pasando 10+ horas/semana escribiendo propuestas similares. Capacidad limitada para nuevos clientes.',
          systemsBuilt: [
            'Generador Inteligente de Propuestas - Creacion de propuestas con IA',
            'Analisis de proyectos pasados y coincidencia de casos de estudio',
            'Generacion automatizada de precios y cronogramas',
          ],
          results: {
            timeSaved: '14 horas/semana',
            revenueImpact: 'Aumento de propuestas de 3/semana a 8/semana',
            customerSat: 'Mantuvo 35% de tasa de exito con 2.5x mas propuestas',
            roi: '450%',
            roiPeriod: '2 meses',
            totalValue: '$22,000',
          },
          quote:
            'Empezamos pequeno para probarlo. Despues de ver como este sistema cambio nuestro proceso de propuestas, inmediatamente actualizamos a Constructor de Base.',
          owner: 'Sarah K.',
        },
        {
          company: 'Administracion de Propiedades Regional',
          industry: 'Servicios Inmobiliarios',
          revenue: '$3.2M ingresos anuales',
          employees: '12 empleados',
          tier: 'Arquitecto de Sistemas',
          investment: '$30,000',
          timeline: '6 meses',
          challenge:
            'Administrando 180 unidades con procesos manuales. Mantenimiento reactivo. Alta rotacion de inquilinos.',
          systemsBuilt: [
            'Coordinador Inteligente de Mantenimiento - Triaje y enrutamiento automatico',
            'Agente de Renovacion de Contratos - Precios predictivos y automatizacion',
            'Sistema de Mantenimiento Predictivo - Prevenir fallas antes de que ocurran',
            'Automatizacion de Evaluacion de Inquilinos - Decisiones consistentes y rapidas',
            'Orquestacion Multi-Agente - Todos los sistemas trabajando juntos',
          ],
          results: {
            timeSaved: '35 horas/semana',
            revenueImpact: 'Tasa de renovacion: 68% \u2192 81%',
            customerSat: 'NPS de inquilinos: 42 \u2192 67',
            roi: '198%',
            roiPeriod: '6 meses',
            totalValue: '$89,520',
          },
          quote:
            'No solo compramos software, aprendimos a pensar como constructores de IA. Ahora nuestro equipo identifica oportunidades de automatizacion en todas partes. Esta es una ventaja competitiva que durara anos.',
          owner: 'James L.',
        },
      ],
      labels: {
        challenge: 'Desafio:',
        partnershipTier: 'Nivel de Alianza',
        systemsBuiltTogether: 'Sistemas Construidos Juntos',
        measurableResults: 'Resultados Medibles',
        timeSaved: 'Tiempo Ahorrado',
        roiIn: 'ROI en',
        totalValueCreated: 'Valor Total Creado',
        revenueImpact: 'Impacto en Ingresos',
        customerExperience: 'Experiencia del Cliente',
        owner: 'Propietario',
      },
      bottomStats: {
        heading: 'Resultados Respaldados por la Industria',
        description:
          'Basado en resultados documentados de sistemas agenticos y estimaciones conservadoras de ROI en todos los tipos de negocios',
        stats: [
          { stat: '10-35 hrs/semana', label: 'Ahorro de Tiempo Tipico' },
          { stat: '150-300%', label: 'ROI Promedio (3-6 meses)' },
          { stat: '68%', label: 'PYMEs Usando IA' },
          { stat: '$10K+', label: 'Gasto Anual Promedio en IA' },
        ],
        note: 'Estos ejemplos abarcan servicios del hogar, servicios profesionales y bienes raices. Construimos sistemas para cualquier tipo de negocio, tu industria es la siguiente.',
      },
    },

    roiCalculator: {
      tag: 'Calcula Tu ROI',
      heading: 'Ve tu retorno de inversion en capacidad',
      description:
        'Construimos sistemas inteligentes para CUALQUIER tipo de negocio. Basado en datos reales del 68% de PYMEs que ya usan IA. Estimaciones conservadoras muestran que la mayoria de negocios logran 150-300% de ROI en 3-6 meses.',
      yourBusinessDetails: 'Detalles de Tu Negocio',
      labels: {
        industry: 'Industria',
        businessSize: 'Tamano del Negocio',
        timeValue: 'Valor de Tu Tiempo (por hora)',
        partnershipTier: 'Nivel de Alianza',
      },
      industryNote:
        'No ves tu industria? Trabajamos con todos los tipos de negocios, selecciona "Otro" para estimaciones generales.',
      timeValueNote: 'Promedio de la industria: Negocios de servicios $50-100/hr, Servicios profesionales $100-200/hr',
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
        { id: 'discovery', name: 'Descubrimiento de IA' },
        { id: 'foundation', name: 'Constructor de Base' },
        { id: 'architect', name: 'Arquitecto de Sistemas' },
      ],
      results: {
        heading: 'Tus Resultados Proyectados',
        timeSaved: 'Tiempo Ahorrado',
        weeklyValue: 'Valor Semanal',
        investment: 'Inversion',
        systemsBuilt: 'Sistemas Construidos',
        totalValueCreated: 'Valor Total Creado',
        over: 'Durante',
        weeks: 'semanas',
        yourRoi: 'Tu ROI',
        paysForItself: 'Se paga solo en ~',
        continuesGenerating: 'semanas, luego continua generando valor',
      },
      emailCapture: {
        heading: 'Enviame este reporte completo',
        placeholder: 'Ingresa tu email',
        send: 'Enviar',
        sending: 'Enviando...',
        note: 'Te enviaremos un desglose detallado de tu ROI potencial. Sin spam.',
        success: 'Reporte enviado exitosamente! Revisa tu bandeja de entrada.',
      },
      comparison: {
        heading: 'Compara Alternativas',
        traditionalConsultant: 'Consultor Tradicional',
        doneForYou: 'Servicio Llave en Mano',
        aiSmbPartners: 'AI KRE8TION Partners',
        savePercent: 'Ahorra',
        ownCapability: '% vs alternativas + eres dueno de la capacidad para siempre',
      },
      cta: 'Comienza a Construir Tus Sistemas',
      disclaimer:
        'Calculos basados en estimaciones conservadoras de datos de la industria (McKinsey, Gartner, reportes SBA). Los resultados reales varian por negocio. Datos de ahorro de tiempo de implementaciones documentadas de sistemas agenticos en el 68% de PYMEs que actualmente usan IA en 2025.',
    },

    pricing: {
      tag: 'Inversion en la Alianza',
      heading: 'Invierte en capacidad, no en dependencia',
      description:
        'Tarifa unica de transferencia de capacidad + soporte continuo de alianza. Nuestro objetivo es tu independencia, no tus pagos continuos.',
      afterMinimum:
        'Despues del termino minimo: Eres independiente! Extiende sesiones mes a mes si quieres guia continua en nuevos proyectos.',
      tiers: [
        {
          name: 'Descubrimiento de IA',
          subtitle: 'Inicio perfecto',
          setupFee: '$2,500',
          monthlyFee: '$750',
          minimumTerm: '2 meses',
          description: 'Descubre donde la IA puede transformar TU negocio y construye tu primer sistema inteligente',
          includes: 'Incluye agente de voz personalizado + 2 sistemas',
          features: [
            'Evaluacion de oportunidades de IA de 4 semanas',
            'Agente de voz personalizado para tu sitio web (o el de tu cliente)',
            'Construye 2 sistemas agenticos centrales',
            'Aprendizaje flexible: aprende tanto o tan poco como quieras (tambien podemos entrenar a un miembro de tu equipo)',
            'Sesiones de co-creacion quincenales (videollamadas)',
            'Soporte por email entre sesiones',
            'Plantillas y frameworks iniciales',
            'Documentacion y recursos',
            'Aprenderas: Fundamentos de IA, basicos de diseno de sistemas',
          ],
          outcome: 'Primer sistema de IA funcionando + hoja de ruta clara',
          cta: 'Comienza Tu Viaje',
          highlighted: false,
          roiText: '200-450% en 2 meses',
        },
        {
          name: 'Constructor de Base',
          subtitle: 'Mas popular',
          setupFee: '$5,000',
          monthlyFee: '$1,500',
          minimumTerm: '3 meses',
          description: 'Construye multiples sistemas inteligentes y domina los fundamentos de IA',
          includes: 'Incluye agente de voz personalizado + 5 sistemas',
          features: [
            'Todo en Descubrimiento de IA',
            'Entrenamiento integral de IA de 8 semanas',
            'Agente de voz personalizado para tu sitio web (o el de tu cliente)',
            'Construye 5 sistemas agenticos',
            'Aprendizaje flexible: aprende tanto o tan poco como quieras (tambien podemos entrenar a un miembro de tu equipo)',
            'Sesiones de co-creacion semanales (videollamadas)',
            'Soporte prioritario por email y mensajeria',
            'Biblioteca completa de plantillas y herramientas',
            'Aprenderas: Diseno de sistemas, implementacion, integracion',
          ],
          outcome: 'Independiente con sistemas fundamentales',
          cta: 'Construye Tu Base',
          highlighted: true,
          roiText: '150-250% en 3 meses',
        },
        {
          name: 'Arquitecto de Sistemas',
          subtitle: 'Capacidad avanzada',
          setupFee: '$12,000',
          monthlyFee: '$3,000',
          minimumTerm: '6 meses',
          description: 'Transforma tus operaciones con sistemas inteligentes avanzados',
          includes: 'Incluye agente de voz personalizado + 8 sistemas',
          features: [
            'Todo en Constructor de Base',
            'Agente de voz personalizado para tu sitio web (o el de tu cliente)',
            'Construye 8 sistemas agenticos',
            'Aprendizaje flexible: aprende tanto o tan poco como quieras (tambien podemos entrenar a un miembro de tu equipo)',
            'Diseno de arquitectura de sistemas personalizado',
            'Entrenamiento avanzado: Orquestacion multi-agente',
            'Soporte prioritario por email y mensajeria',
            'Sesiones de estrategia mensuales (dedicadas)',
            'Aprenderas: Patrones avanzados, escalamiento, optimizacion',
          ],
          outcome: 'Constructor maestro con sistemas en produccion',
          cta: 'Transforma Tu Negocio',
          highlighted: false,
          roiText: '180-300% en 6 meses',
        },
        {
          name: 'Empresa IA-Nativa',
          subtitle: 'Transformacion completa',
          setupFee: 'Personalizado',
          monthlyFee: 'Personalizado',
          minimumTerm: 'Personalizado',
          description: 'Conviertete en una organizacion IA-primero con capacidades empresariales',
          features: [
            'Todo en Arquitecto de Sistemas',
            'Desarrollo ilimitado de sistemas agenticos',
            'Gerente de alianza dedicado',
            'Entrena a todo tu equipo como constructores de IA',
            'Soporte de implementacion premium',
            'Integracion multi-ubicacion/compleja',
            'Aprenderas: Arquitectura empresarial, entrenamiento de equipos, gobernanza',
          ],
          outcome: 'Negocio IA-nativo con capacidad interna',
          cta: 'Contactanos',
          highlighted: false,
        },
      ],
    labels: {
      capabilityTransfer: 'Transferencia de Capacidad',
      monthPartnership: '/mes alianza',
      minimumForLearning: 'minimo para completar aprendizaje',
      recommended: 'RECOMENDADO',
      typicalRoi: 'ROI Tipico',
      yourOutcome: 'Tu Resultado',
      seeCapabilityRoi: 'Ver ROI de Capacidad',
      flexibleLearning: 'Aprendizaje flexible',
      flexibleLearningText: 'Aprende mucho o poco — podemos entrenarte a ti o a un miembro de tu equipo',
      includes: 'Incluye',
    },
      guarantee: {
        title: 'Garantia de Resultados de 30 Dias',
        description: 'Si no ves ahorro de tiempo medible en 30 dias, trabajamos gratis hasta que lo logres.',
        items: ['Sin contratos a largo plazo', 'Cancela cuando quieras', 'Tus datos son tuyos'],
      },
    },

    faq: {
      tag: 'Preguntas Frecuentes',
      heading: 'Preguntas comunes',
      description: 'Todo lo que necesitas saber sobre sistemas agenticos.',
      items: [
        {
          question: 'Necesito habilidades tecnicas para usar sistemas agenticos?',
          answer:
            'No. Nosotros manejamos toda la implementacion tecnica. Tu equipo usara interfaces simples, la mayoria se parecen a las herramientas que ya usas. Proporcionamos entrenamiento y soporte continuo.',
        },
        {
          question: 'Cuanto tiempo toma ver resultados?',
          answer:
            'La mayoria de clientes ven ahorro de tiempo medible dentro de 2-4 semanas de que su primer flujo de trabajo este activo. El ROI completo tipicamente ocurre dentro de 6-12 semanas dependiendo del paquete.',
        },
        {
          question: 'Que pasa con mis datos?',
          answer:
            'Tus datos son tuyos. Usamos seguridad de nivel empresarial y nunca compartimos o vendemos tu informacion. Todo el procesamiento de datos sigue estandares estrictos de privacidad.',
        },
        {
          question: 'Que pasa si no funciona para mi negocio?',
          answer:
            'Ofrecemos una garantia de resultados de 30 dias. Si no ves ahorro de tiempo medible, trabajaremos gratis hasta que lo logres. Ademas, puedes cancelar despues del periodo inicial de 3 meses.',
        },
        {
          question: 'Puede la IA manejar interacciones complejas con clientes?',
          answer:
            'Si, con supervision humana. Nuestra IA maneja tareas rutinarias y escala situaciones complejas a tu equipo. Tu mantienes el control de decisiones importantes.',
        },
        {
          question: 'Con que sistemas se integran?',
          answer:
            'Nos integramos con la mayoria de herramientas de negocio populares incluyendo QuickBooks, ServiceTitan, Jobber, Google Workspace, Microsoft 365 y muchas mas. Integraciones personalizadas disponibles para clientes empresariales.',
        },
      ],
      contact: {
        question: 'Aun tienes preguntas?',
        cta: 'Ponte en contacto',
      },
    },

    finalCta: {
      badge: 'Disponibilidad limitada',
      heading: 'Listo para recuperar el 30% de tu tiempo?',
      description:
        'Unete a 50+ PYMEs que ya ahorran tiempo con automatizacion de IA. Comienza con una reunion de comprension para identificar tus oportunidades.',
      ctaPrimary: 'Agenda Reunion de Comprension',
      ctaSecondary: 'Calcula Tu ROI',
      trustSignals: [
        { icon: 'shield', label: 'Garantia de 30 dias' },
        { icon: 'lock', label: 'Sin compromiso' },
        { icon: 'clock', label: 'Llamada de 30 min' },
      ],
    },

    footer: {
      tagline: 'Sistemas agenticos para PYMEs. Recupera el 30% de tu tiempo en 30 dias.',
      sections: {
        solutions: 'Soluciones',
        company: 'Empresa',
        resources: 'Recursos',
      },
      links: {
        solutions: [
          { label: 'Agentes de Comunicacion con Clientes', href: '#solutions' },
          { label: 'Procesamiento Inteligente de Documentos', href: '#solutions' },
          { label: 'Analitica Predictiva de Negocios', href: '#solutions' },
          { label: 'Orquestacion Multi-Agente', href: '#solutions' },
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
    },

    voiceAgent: {
      states: {
        idle: { title: 'Listo para Ayudar', description: 'Haz clic para hacer una pregunta' },
        listening: { title: 'Escuchando...', description: 'Di tu pregunta' },
        processing: { title: 'Procesando...', description: 'Pensando...' },
        speaking: { title: 'Hablando...', description: 'Reproduciendo respuesta' },
      },
      transcript: 'Preguntaste:',
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
      errors: {
        notSupported: 'La grabacion de voz no es compatible con este navegador.',
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
        consultation: {
          title: 'Llamada Estrategica Gratuita',
          description: 'Una videollamada de 30 minutos para discutir tus objetivos de negocio y explorar oportunidades de IA.',
          price: 'Gratis',
          duration: 'Videollamada de 30 min',
        },
        assessment: {
          title: 'Evaluacion en Sitio',
          description: 'Un recorrido presencial de las operaciones de tu negocio para identificar oportunidades de IA.',
          price: '$250',
          duration: 'Visita presencial de 60 min',
          includes: 'Incluye documento de estrategia',
        },
      },
      form: {
        name: 'Nombre Completo',
        namePlaceholder: 'Juan Garcia',
        email: 'Correo Electronico',
        emailPlaceholder: 'juan@empresa.com',
        phone: 'Numero de Telefono (opcional)',
        phonePlaceholder: '+52 (55) 1234-5678',
        notes: 'Algo que quieras que sepamos? (opcional)',
        notesPlaceholder: 'Cuentanos sobre tu negocio o que te gustaria discutir...',
        submit: 'Confirmar Reserva',
        submitting: 'Reservando...',
        submitAssessment: 'Continuar al Pago ($250)',
        submittingAssessment: 'Redirigiendo al pago...',
        assessmentNotesPlaceholder: 'Cuentanos sobre las operaciones de tu negocio, tamano del equipo y que desafios enfrentas...',
        assessmentDuration: '60 min',
        required: 'Campos requeridos',
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
        subtitle: 'Tu evaluacion presencial de IA ha sido reservada. Esperamos visitar tu negocio.',
        amount: 'Monto Pagado',
        whatToExpect: 'Que Esperar',
        expectItems: [
          'Un recorrido de 60 minutos por las operaciones de tu negocio',
          'Identificacion de oportunidades especificas de automatizacion con IA',
          'Discusion de sistemas agenticos adaptados a tus flujos de trabajo',
          'Un documento de estrategia detallado entregado despues de la visita',
        ],
        strategyDocNote: 'Despues de la evaluacion, recibiras un documento de estrategia detallado con todas las recomendaciones de implementacion, ya sea que procedas con nuestros servicios o no.',
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
