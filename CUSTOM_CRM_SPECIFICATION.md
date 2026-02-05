# Custom CRM Specification for AI KRE8TION Partners

## Executive Summary

This document outlines the requirements for building a custom CRM tailored specifically for **AI KRE8TION Partners (ELEV8TION)** — an AI partnership platform that helps small-medium businesses build custom agentic systems and automation solutions. The CRM must support the unique sales cycle of AI consulting services, track voice agent interactions, manage multi-tier partnership programs, and provide AI readiness scoring.

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Core Data Entities](#2-core-data-entities)
3. [Lead Management](#3-lead-management)
4. [Sales Pipeline](#4-sales-pipeline)
5. [Partnership Lifecycle](#5-partnership-lifecycle)
6. [Voice Agent Integration](#6-voice-agent-integration)
7. [ROI Calculator Integration](#7-roi-calculator-integration)
8. [Industry-Specific Features](#8-industry-specific-features)
9. [Automations & Workflows](#9-automations--workflows)
10. [Reporting & Analytics](#10-reporting--analytics)
11. [Technical Architecture](#11-technical-architecture)
12. [Database Schema](#12-database-schema)
13. [API Integrations](#13-api-integrations)
14. [User Roles & Permissions](#14-user-roles--permissions)
15. [Implementation Roadmap](#15-implementation-roadmap)

---

## 1. Business Context

### Target Market
- **Company Size:** 5-50 employees
- **Industries:** HVAC, Plumbing, Property Management, Construction, Retail/E-commerce, Professional Services, Real Estate
- **AI Maturity:** Low (78% feel behind on AI adoption)
- **Pain Points:** Expensive consultants ($120K+/year), lack of internal AI capability, dependency on external solutions

### Sales Model
- Education-first approach
- Three partnership tiers (Discovery, Foundation, Architect)
- Month-to-month contracts with setup fees
- 8-24 week implementation cycles
- Value metric: Hours saved per week × hourly rate

### Unique CRM Requirements
1. Track **AI readiness scores** for each prospect
2. Capture **voice agent conversation transcripts**
3. Store **ROI calculator submissions** with detailed metrics
4. Manage **multi-system partnerships** (1-6 systems per engagement)
5. Track **knowledge transfer milestones** (building independence)
6. Industry-specific **use case matching**

---

## 2. Core Data Entities

### 2.1 Companies (Accounts)

```typescript
interface Company {
  id: string;
  name: string;
  website?: string;

  // Business Info
  industry: Industry; // HVAC, Plumbing, Property Management, etc.
  employeeCount: '1-5' | '5-10' | '10-25' | '25-50' | '50+';
  annualRevenue?: number;
  businessModel: 'service' | 'professional' | 'retail' | 'construction' | 'real-estate';

  // AI Readiness
  aiMaturityScore: number; // 1-10
  currentAITools: string[];
  aiPainPoints: string[];

  // Location
  address: Address;
  timezone: string;
  preferredLanguage: 'en' | 'es';

  // Engagement Tracking
  firstTouchDate: Date;
  lastActivityDate: Date;
  totalInteractions: number;

  // Relationships
  contacts: Contact[];
  opportunities: Opportunity[];
  partnerships: Partnership[];

  // Metadata
  source: LeadSource;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type Industry =
  | 'HVAC'
  | 'Plumbing'
  | 'Property Management'
  | 'Construction'
  | 'Retail'
  | 'E-commerce'
  | 'Professional Services'
  | 'Real Estate'
  | 'Other';
```

### 2.2 Contacts

```typescript
interface Contact {
  id: string;
  companyId: string;

  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Professional Info
  title: string;
  role: ContactRole;
  decisionMaker: boolean;

  // Preferences
  preferredContactMethod: 'email' | 'phone' | 'voice-agent';
  preferredLanguage: 'en' | 'es';
  timezone: string;

  // Engagement
  voiceAgentSessions: VoiceSession[];
  roiCalculations: ROICalculation[];
  emailInteractions: EmailInteraction[];

  // Scoring
  engagementScore: number; // 0-100
  lastEngagement: Date;

  createdAt: Date;
  updatedAt: Date;
}

type ContactRole =
  | 'Owner'
  | 'CEO'
  | 'COO'
  | 'Operations Manager'
  | 'IT Manager'
  | 'Office Manager'
  | 'Other';
```

### 2.3 Opportunities (Deals)

```typescript
interface Opportunity {
  id: string;
  companyId: string;
  primaryContactId: string;

  // Deal Info
  name: string;
  tier: 'discovery' | 'foundation' | 'architect';
  stage: PipelineStage;

  // Financials
  setupFee: number; // $4,000 | $9,500 | $30,000
  monthlyFee: number;
  estimatedContractLength: number; // months
  totalContractValue: number;

  // ROI Projections
  projectedWeeklyHoursSaved: number;
  projectedWeeklyValueCreated: number;
  projectedROI: number; // percentage
  paybackPeriodWeeks: number;

  // Timeline
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  implementationStartDate?: Date;

  // Systems
  proposedSystems: ProposedSystem[];
  systemCount: number; // 1, 3, or 6

  // Tracking
  probability: number; // 0-100
  lostReason?: string;
  competitorInfo?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface ProposedSystem {
  id: string;
  name: string;
  category: SystemCategory;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHoursSaved: number;
  description: string;
}

type SystemCategory =
  | 'Lead Capture & Qualification'
  | 'Scheduling & Dispatch'
  | 'Quote Generation'
  | 'Customer Communications'
  | 'Invoice Processing'
  | 'Inventory Management'
  | 'Reporting & Analytics'
  | 'Quality Control'
  | 'Custom';
```

### 2.4 Partnerships (Active Engagements)

```typescript
interface Partnership {
  id: string;
  opportunityId: string;
  companyId: string;

  // Contract Details
  tier: 'discovery' | 'foundation' | 'architect';
  startDate: Date;
  targetEndDate: Date;
  status: PartnershipStatus;

  // Financial
  setupFeePaid: boolean;
  monthlyPayments: Payment[];
  totalRevenue: number;

  // Delivery
  systems: DeliveredSystem[];
  currentPhase: 'discover' | 'co-create' | 'deploy' | 'independent';
  weeklyMeetingSchedule: string;

  // Knowledge Transfer
  knowledgeTransferScore: number; // 0-100 (independence readiness)
  trainingModulesCompleted: string[];
  documentationDelivered: string[];

  // Health Metrics
  satisfactionScore?: number; // 1-10
  engagementLevel: 'high' | 'medium' | 'low';
  atRisk: boolean;
  riskReasons?: string[];

  // Outcomes
  actualHoursSaved?: number;
  actualROI?: number;
  testimonialProvided: boolean;
  caseStudyCreated: boolean;
  referralsMade: number;

  createdAt: Date;
  updatedAt: Date;
}

interface DeliveredSystem {
  id: string;
  name: string;
  category: SystemCategory;
  status: 'planning' | 'building' | 'testing' | 'deployed' | 'optimizing';
  deploymentDate?: Date;
  hoursSavedPerWeek: number;
  clientCanManageIndependently: boolean;
}

type PartnershipStatus =
  | 'onboarding'
  | 'active'
  | 'completing'
  | 'graduated'
  | 'paused'
  | 'churned';
```

---

## 3. Lead Management

### 3.1 Lead Sources

Track and attribute leads from all touchpoints:

| Source | Priority | Expected Conversion |
|--------|----------|---------------------|
| Voice Agent (Website) | High | 25-35% |
| ROI Calculator | High | 20-30% |
| Calendar Booking (Direct) | Highest | 40-50% |
| Organic Search | Medium | 15-20% |
| Paid Ads | Medium | 10-15% |
| Referral | Highest | 50-60% |
| LinkedIn Outreach | Low | 5-10% |
| Industry Event | Medium | 20-25% |

### 3.2 Lead Capture Data

```typescript
interface Lead {
  id: string;

  // Basic Info
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;

  // Source Tracking
  source: LeadSource;
  sourceDetail?: string; // e.g., "Voice Agent - Spanish", "ROI Calc - HVAC"
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  referrer?: string;

  // Engagement Context
  voiceAgentSessionId?: string;
  roiCalculationId?: string;
  calendarBookingId?: string;

  // Qualification
  industry?: Industry;
  employeeCount?: string;
  aiMaturityIndicators?: string[];

  // Status
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  assignedTo?: string; // user ID

  // Scoring
  leadScore: number; // 0-100
  scoringFactors: ScoringFactor[];

  createdAt: Date;
  updatedAt: Date;
  convertedAt?: Date;
  convertedToCompanyId?: string;
}

interface ScoringFactor {
  factor: string;
  weight: number;
  value: number;
  contribution: number;
}
```

### 3.3 Lead Scoring Model

| Factor | Weight | Score Range |
|--------|--------|-------------|
| Industry match | 20% | 0-100 |
| Employee count (5-50) | 15% | 0-100 |
| Voice agent engagement | 20% | 0-100 |
| ROI calculator completed | 15% | 0-100 |
| Multiple sessions | 10% | 0-100 |
| Calendar booking | 10% | 0-100 |
| Email engagement | 5% | 0-100 |
| Referral source | 5% | 0-100 |

**Automatic Qualification Triggers:**
- Lead score > 70 → MQL (Marketing Qualified Lead)
- Calendar booking + Lead score > 50 → SQL (Sales Qualified Lead)
- Voice agent > 5 questions + ROI calc → MQL
- Referral with industry match → SQL

---

## 4. Sales Pipeline

### 4.1 Pipeline Stages

```
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐   ┌─────────┐
│   New   │ → │ Contacted │ → │ Discovery│ → │  Proposal  │ → │ Negotiate│ → │  Closed │
│  Lead   │   │           │   │   Call   │   │   Sent     │   │          │   │ Won/Lost│
└─────────┘   └───────────┘   └──────────┘   └────────────┘   └──────────┘   └─────────┘
    5%            15%             30%            50%              75%          100%/0%
```

### 4.2 Stage Definitions

| Stage | Description | Exit Criteria | Avg Duration |
|-------|-------------|---------------|--------------|
| New Lead | Fresh lead captured | First outreach made | < 24 hours |
| Contacted | Initial contact made | Discovery call scheduled | 1-3 days |
| Discovery Call | Understanding needs | Call completed, tier identified | 1 week |
| Proposal Sent | Custom proposal delivered | Proposal reviewed, feedback received | 1-2 weeks |
| Negotiation | Terms discussion | Agreement on tier and start date | 1 week |
| Closed Won | Contract signed | Payment received | - |
| Closed Lost | Deal lost | Reason documented | - |

### 4.3 Required Activities per Stage

```typescript
interface StageRequirements {
  'new-lead': {
    maxDaysInStage: 1;
    requiredActions: ['assign_owner', 'review_lead_data'];
  };
  'contacted': {
    maxDaysInStage: 3;
    requiredActions: ['initial_email', 'follow_up_call_attempt'];
  };
  'discovery-call': {
    maxDaysInStage: 7;
    requiredActions: ['schedule_discovery', 'complete_discovery', 'identify_tier'];
  };
  'proposal-sent': {
    maxDaysInStage: 14;
    requiredActions: ['send_proposal', 'proposal_walkthrough_call'];
  };
  'negotiation': {
    maxDaysInStage: 7;
    requiredActions: ['address_objections', 'final_pricing', 'contract_prep'];
  };
}
```

---

## 5. Partnership Lifecycle

### 5.1 Partnership Phases

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PARTNERSHIP LIFECYCLE                              │
├─────────────┬─────────────┬──────────────┬─────────────┬─────────────────┤
│  Onboarding │  Discover   │   Co-Create  │   Deploy    │   Independent   │
│  (Week 1)   │ (Week 1-2)  │  (Week 3-6)  │ (Week 7+)   │   (Ongoing)     │
├─────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│ - Kickoff   │ - Audit     │ - Build      │ - Launch    │ - Self-manage   │
│ - Access    │ - Prioritize│ - Train      │ - Optimize  │ - Expand        │
│ - Goals     │ - Roadmap   │ - Document   │ - Measure   │ - Refer         │
└─────────────┴─────────────┴──────────────┴─────────────┴─────────────────┘
```

### 5.2 Health Scoring

```typescript
interface PartnershipHealthScore {
  overall: number; // 0-100
  components: {
    engagement: number;      // Meeting attendance, responsiveness
    progress: number;        // Milestones completed vs planned
    adoption: number;        // System usage metrics
    satisfaction: number;    // NPS/feedback scores
    paymentHealth: number;   // Payment timeliness
  };
  alerts: HealthAlert[];
}

interface HealthAlert {
  severity: 'critical' | 'warning' | 'info';
  type: string;
  message: string;
  recommendedAction: string;
  createdAt: Date;
}
```

### 5.3 Success Milestones

| Tier | Duration | Systems | Key Milestones |
|------|----------|---------|----------------|
| Discovery | 8 weeks | 1 | Week 4: System live, Week 8: Independence check |
| Foundation | 12 weeks | 3 | Week 4: First system, Week 8: Second, Week 12: Third + graduation |
| Architect | 24 weeks | 6 | Every 4 weeks: New system, Monthly: ROI review |

---

## 6. Voice Agent Integration

### 6.1 Session Tracking

```typescript
interface VoiceAgentSession {
  id: string;
  leadId?: string;
  contactId?: string;

  // Session Info
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  language: 'en' | 'es';

  // Device/Context
  userAgent: string;
  device: 'mobile' | 'desktop';
  referrerPage: string;

  // Conversation
  messages: VoiceMessage[];
  totalQuestions: number;
  actionsTaken: string[]; // e.g., ['SCROLL_TO_ROI', 'SCROLL_TO_PRICING']

  // Analysis
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: VoiceIntent[];
  painPointsMentioned: string[];
  objectionsMentioned: string[];

  // Outcome
  outcome: 'continued_browsing' | 'roi_calculator' | 'calendar_booking' | 'left_site';

  createdAt: Date;
}

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string; // optional: store audio recordings
  transcriptionConfidence?: number;
}

type VoiceIntent =
  | 'pricing_inquiry'
  | 'industry_use_case'
  | 'timeline_question'
  | 'capability_question'
  | 'objection'
  | 'comparison_to_competitor'
  | 'ready_to_proceed'
  | 'general_info';
```

### 6.2 Conversation Analytics

Track and analyze:
- **Common questions** by industry
- **Objection patterns** and successful responses
- **Drop-off points** in conversation
- **Language preferences** by region
- **Peak usage times**
- **Session-to-conversion correlation**

### 6.3 Sync Logic

```
Voice Agent Session Created
         │
         ▼
  ┌──────────────────┐
  │ Check for email  │
  │ in conversation  │
  └────────┬─────────┘
           │
     ┌─────┴─────┐
     │           │
   Found      Not Found
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ Match   │  │ Create anon  │
│ to Lead │  │ session for  │
│ /Contact│  │ later merge  │
└─────────┘  └──────────────┘
```

---

## 7. ROI Calculator Integration

### 7.1 ROI Calculation Data

```typescript
interface ROICalculation {
  id: string;
  leadId?: string;
  contactId?: string;

  // Inputs
  industry: Industry;
  employeeCount: string;
  hourlyRate: number;
  weeklyAdminHours: number;

  // Calculated Outputs
  weeklyHoursSaved: {
    discovery: number;  // ~5-8 hours
    foundation: number; // ~12-18 hours
    architect: number;  // ~20-30 hours
  };

  weeklyValueCreated: {
    discovery: number;
    foundation: number;
    architect: number;
  };

  annualROI: {
    discovery: { value: number; percentage: number };
    foundation: { value: number; percentage: number };
    architect: { value: number; percentage: number };
  };

  paybackPeriod: {
    discovery: number; // weeks
    foundation: number;
    architect: number;
  };

  // Selection
  selectedTier?: 'discovery' | 'foundation' | 'architect';

  // Lead Capture
  emailCaptured: boolean;
  email?: string;
  reportRequested: boolean;
  reportSentAt?: Date;

  // Tracking
  timeOnCalculator: number; // seconds
  adjustmentsCount: number; // how many times they changed inputs

  createdAt: Date;
}
```

### 7.2 ROI Report Generation

Automatically generate and send PDF reports containing:
- Personalized ROI breakdown by tier
- Industry-specific use cases
- Implementation timeline
- Next steps CTA

---

## 8. Industry-Specific Features

### 8.1 Industry Profiles

```typescript
interface IndustryProfile {
  id: Industry;
  displayName: string;

  // Common Pain Points
  painPoints: string[];

  // Typical Systems Built
  recommendedSystems: {
    category: SystemCategory;
    description: string;
    typicalHoursSaved: number;
  }[];

  // Benchmarks
  avgEmployeeCount: number;
  avgHourlyRate: number;
  avgWeeklyAdminHours: number;
  avgROI: number;

  // Content
  caseStudyIds: string[];
  useCaseDescriptions: string[];

  // Sales Guidance
  commonObjections: string[];
  objectionResponses: string[];
  discoveryQuestions: string[];
}
```

### 8.2 Pre-configured Industry Data

| Industry | Typical Pain Points | Top Systems |
|----------|---------------------|-------------|
| HVAC/Plumbing | Scheduling chaos, quote delays, follow-up drops | Dispatch AI, Quote Generator, Follow-up Bot |
| Property Mgmt | Tenant comms, maintenance tracking, rent collection | Tenant Portal AI, Maintenance Bot, Collection Automation |
| Construction | Bid management, subcontractor comms, timeline tracking | Bid Assistant, Project Comms, Timeline AI |
| Professional Services | Client intake, scheduling, billing | Intake Bot, Calendar AI, Invoice Automation |
| Real Estate | Lead qualification, showing scheduling, follow-ups | Lead Qualifier, Showing Scheduler, Nurture Bot |

---

## 9. Automations & Workflows

### 9.1 Lead Nurture Sequences

#### Voice Agent Follow-up (No Email Captured)
```
Session ends without email
        │
        ▼
    Wait 24 hours
        │
        ▼
    Retargeting pixel fires
    (for ad campaigns)
```

#### Voice Agent Follow-up (Email Captured)
```
Session ends with email
        │
        ▼
  Immediately: Thank you email with transcript summary
        │
        ▼
  +2 hours: ROI calculator link if not completed
        │
        ▼
  +24 hours: Industry case study
        │
        ▼
  +72 hours: Calendar booking CTA
        │
        ▼
  +7 days: "Questions?" check-in
```

#### ROI Calculator Follow-up
```
ROI calculation completed + email captured
        │
        ▼
  Immediately: ROI report PDF via email
        │
        ▼
  +4 hours: "Have questions about your report?"
        │
        ▼
  +24 hours: Calendar booking CTA
        │
        ▼
  +3 days: Industry case study
        │
        ▼
  +7 days: "Ready to discuss?" final push
```

### 9.2 Sales Activity Reminders

| Trigger | Action | Timing |
|---------|--------|--------|
| Lead in 'New' > 24h | Alert owner to follow up | Real-time |
| Discovery call scheduled | Prep reminder with lead data | -1 day |
| Proposal sent > 7 days | Follow-up reminder | Daily |
| Deal stalled > 14 days | Manager notification | Real-time |
| High-value lead (score > 80) | Priority notification | Real-time |

### 9.3 Partnership Health Automations

| Trigger | Action |
|---------|--------|
| Meeting missed | Alert owner + email to client |
| Health score < 50 | Escalate to manager |
| System not used in 7 days | Check-in email |
| Approaching graduation | Testimonial request sequence |
| Payment overdue | Automatic reminder sequence |

---

## 10. Reporting & Analytics

### 10.1 Executive Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│                     EXECUTIVE DASHBOARD                                 │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│   New Leads      │  Pipeline Value  │  Active Partners │    MRR        │
│   This Month     │                  │                  │               │
│     127          │    $245,000      │      18          │   $12,500     │
│   (+23% MoM)     │   (+15% MoM)     │   (+2 MoM)       │  (+8% MoM)    │
├──────────────────┴──────────────────┴──────────────────┴───────────────┤
│                        CONVERSION FUNNEL                                │
│  Leads → MQL → SQL → Opportunity → Closed Won                          │
│  127  →  89  →  45  →    28      →    12                               │
│       (70%)  (51%)     (62%)        (43%)                              │
├────────────────────────────────────────────────────────────────────────┤
│  PIPELINE BY STAGE          │  REVENUE BY TIER                         │
│  ■■■■■■■ Discovery ($45K)   │  Discovery:   $48,000 (32%)              │
│  ■■■■■ Proposal ($68K)      │  Foundation: $76,000 (51%)               │
│  ■■■ Negotiation ($132K)    │  Architect:  $30,000 (17%)               │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Key Metrics to Track

**Lead Metrics:**
- Lead volume by source
- Lead-to-MQL conversion rate
- MQL-to-SQL conversion rate
- Cost per lead by source
- Voice agent engagement rate
- ROI calculator completion rate

**Sales Metrics:**
- Win rate by tier
- Average deal size
- Sales cycle length
- Pipeline velocity
- Proposal-to-close rate
- Lost deal reasons

**Partnership Metrics:**
- Customer health scores
- Net Revenue Retention (NRR)
- Average partnership duration
- Graduation rate
- Referral rate
- Testimonial collection rate

**Voice Agent Metrics:**
- Sessions per day
- Avg session duration
- Questions per session
- Language distribution
- Session-to-lead conversion
- Common topics/intents

### 10.3 Reports

| Report | Frequency | Audience |
|--------|-----------|----------|
| Lead Source Performance | Weekly | Marketing |
| Pipeline Status | Daily | Sales |
| Voice Agent Analytics | Weekly | Product/Sales |
| Partnership Health | Weekly | Customer Success |
| Revenue Forecast | Monthly | Executive |
| Industry Breakdown | Monthly | Strategy |
| ROI Calculator Analytics | Weekly | Marketing |

---

## 11. Technical Architecture

### 11.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js CRM Application                              │ │
│  │   - Dashboard Views       - Lead Management       - Pipeline Board      │ │
│  │   - Contact Management    - Partnership Portal    - Analytics           │ │
│  │   - Voice Session Viewer  - ROI Report Builder    - Admin Settings      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ API Calls
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js API Routes / tRPC                            │ │
│  │   /api/leads/*        /api/companies/*      /api/opportunities/*        │ │
│  │   /api/contacts/*     /api/partnerships/*   /api/analytics/*            │ │
│  │   /api/voice-sessions/* /api/roi-calculations/*  /api/workflows/*       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────────┐
│     DATABASE         │ │    INTEGRATIONS      │ │    BACKGROUND JOBS       │
│  ┌────────────────┐  │ │ ┌────────────────┐   │ │ ┌──────────────────────┐ │
│  │   PostgreSQL   │  │ │ │ Email (Resend) │   │ │ │  Inngest / Trigger   │ │
│  │   + Prisma     │  │ │ │ Calendar (Cal) │   │ │ │  - Nurture sequences │ │
│  │                │  │ │ │ Voice Agent    │   │ │ │  - Health checks     │ │
│  │ Tables:        │  │ │ │ Payments       │   │ │ │  - Report generation │ │
│  │ - companies    │  │ │ │ Analytics      │   │ │ │  - Data sync         │ │
│  │ - contacts     │  │ │ └────────────────┘   │ │ └──────────────────────┘ │
│  │ - leads        │  │ │                      │ │                          │
│  │ - opportunities│  │ │                      │ │                          │
│  │ - partnerships │  │ │                      │ │                          │
│  │ - voice_sessions│ │ │                      │ │                          │
│  │ - roi_calcs    │  │ │                      │ │                          │
│  │ - activities   │  │ │                      │ │                          │
│  └────────────────┘  │ │                      │ │                          │
└──────────────────────┘ └──────────────────────┘ └──────────────────────────┘
```

### 11.2 Technology Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 15 + React 18 | Matches existing stack |
| Styling | Tailwind CSS 4 + shadcn/ui | Rapid UI development |
| State | Zustand or Jotai | Lightweight, fits project |
| API | tRPC or REST API Routes | Type-safe, fast development |
| Database | PostgreSQL + Prisma | Relational data, great ORM |
| Auth | Clerk or NextAuth | Easy setup, secure |
| Email | Resend | Developer-friendly, reliable |
| Calendar | Cal.com API | Open source, embeddable |
| Background Jobs | Inngest or Trigger.dev | Event-driven workflows |
| Analytics | Plausible + Custom | Privacy-focused |
| Hosting | Vercel or Cloudflare | Matches existing infra |
| File Storage | Cloudflare R2 | Cost-effective, S3-compatible |

### 11.3 Existing Integration Points

Connect to current AI KRE8TION Partners landing page:

```typescript
// From landing page to CRM:

// 1. Voice Agent Sessions
POST /api/crm/voice-sessions
{
  sessionId: string,
  messages: VoiceMessage[],
  metadata: { device, language, etc. }
}

// 2. ROI Calculator Submissions
POST /api/crm/roi-calculations
{
  email: string,
  industry: string,
  employeeCount: string,
  calculations: ROIResults
}

// 3. Calendar Bookings (webhook)
POST /api/crm/webhooks/calendar
{
  event: 'booking.created',
  booking: CalendarBooking
}

// 4. Lead Creation (direct form submissions)
POST /api/crm/leads
{
  source: 'website',
  email: string,
  ...leadData
}
```

---

## 12. Database Schema

### 12.1 Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ CORE ENTITIES ============

model Company {
  id                String   @id @default(cuid())
  name              String
  website           String?
  industry          Industry
  employeeCount     String
  annualRevenue     Float?
  businessModel     String
  aiMaturityScore   Int      @default(1)
  currentAITools    String[] @default([])
  aiPainPoints      String[] @default([])

  // Address
  street            String?
  city              String?
  state             String?
  zipCode           String?
  country           String   @default("US")
  timezone          String   @default("America/New_York")
  preferredLanguage String   @default("en")

  // Tracking
  source            String
  tags              String[] @default([])
  firstTouchDate    DateTime @default(now())
  lastActivityDate  DateTime @default(now())
  totalInteractions Int      @default(0)

  // Relations
  contacts          Contact[]
  opportunities     Opportunity[]
  partnerships      Partnership[]
  activities        Activity[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Contact {
  id                    String   @id @default(cuid())
  companyId             String
  company               Company  @relation(fields: [companyId], references: [id])

  firstName             String
  lastName              String
  email                 String   @unique
  phone                 String?
  title                 String?
  role                  String?
  decisionMaker         Boolean  @default(false)

  preferredContactMethod String  @default("email")
  preferredLanguage     String   @default("en")
  timezone              String?

  engagementScore       Int      @default(0)
  lastEngagement        DateTime?

  // Relations
  voiceSessions         VoiceSession[]
  roiCalculations       ROICalculation[]
  opportunities         Opportunity[]
  activities            Activity[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Lead {
  id                String   @id @default(cuid())

  // Basic Info
  email             String
  firstName         String?
  lastName          String?
  phone             String?
  companyName       String?

  // Source
  source            String
  sourceDetail      String?
  utmSource         String?
  utmMedium         String?
  utmCampaign       String?
  landingPage       String?
  referrer          String?

  // Context
  voiceSessionId    String?
  roiCalculationId  String?

  // Qualification
  industry          String?
  employeeCount     String?

  // Status
  status            LeadStatus @default(NEW)
  assignedToId      String?
  assignedTo        User?      @relation(fields: [assignedToId], references: [id])

  // Scoring
  leadScore         Int        @default(0)

  // Conversion
  convertedAt       DateTime?
  convertedToId     String?

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
}

model Opportunity {
  id                    String      @id @default(cuid())
  companyId             String
  company               Company     @relation(fields: [companyId], references: [id])
  primaryContactId      String
  primaryContact        Contact     @relation(fields: [primaryContactId], references: [id])

  name                  String
  tier                  Tier
  stage                 PipelineStage @default(NEW_LEAD)

  // Financials
  setupFee              Float
  monthlyFee            Float       @default(0)
  estimatedMonths       Int         @default(12)
  totalContractValue    Float

  // ROI Projections
  projectedHoursSaved   Float?
  projectedWeeklyValue  Float?
  projectedROI          Float?
  paybackWeeks          Float?

  // Timeline
  expectedCloseDate     DateTime?
  actualCloseDate       DateTime?
  implementationStart   DateTime?

  // Tracking
  probability           Int         @default(10)
  lostReason            String?
  competitorInfo        String?

  // Relations
  proposedSystems       ProposedSystem[]
  partnership           Partnership?
  activities            Activity[]
  ownerId               String?
  owner                 User?       @relation(fields: [ownerId], references: [id])

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

model Partnership {
  id                    String      @id @default(cuid())
  opportunityId         String      @unique
  opportunity           Opportunity @relation(fields: [opportunityId], references: [id])
  companyId             String
  company               Company     @relation(fields: [companyId], references: [id])

  tier                  Tier
  startDate             DateTime
  targetEndDate         DateTime
  status                PartnershipStatus @default(ONBOARDING)

  // Financial
  setupFeePaid          Boolean     @default(false)
  totalRevenue          Float       @default(0)

  // Delivery
  currentPhase          Phase       @default(DISCOVER)
  weeklyMeetingDay      String?
  weeklyMeetingTime     String?

  // Knowledge Transfer
  knowledgeTransferScore Int        @default(0)
  trainingCompleted     String[]    @default([])
  docsDelivered         String[]    @default([])

  // Health
  satisfactionScore     Int?
  engagementLevel       String      @default("high")
  atRisk                Boolean     @default(false)
  riskReasons           String[]    @default([])

  // Outcomes
  actualHoursSaved      Float?
  actualROI             Float?
  testimonialProvided   Boolean     @default(false)
  caseStudyCreated      Boolean     @default(false)
  referralsMade         Int         @default(0)

  // Relations
  systems               DeliveredSystem[]
  payments              Payment[]
  activities            Activity[]

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

// ============ SUPPORTING ENTITIES ============

model VoiceSession {
  id                String   @id @default(cuid())
  contactId         String?
  contact           Contact? @relation(fields: [contactId], references: [id])

  externalSessionId String   @unique // From Cloudflare KV
  startTime         DateTime
  endTime           DateTime?
  duration          Int      @default(0)
  language          String   @default("en")

  userAgent         String?
  device            String?
  referrerPage      String?

  messages          Json     // Array of VoiceMessage
  totalQuestions    Int      @default(0)
  actionsTaken      String[] @default([])

  topics            String[] @default([])
  sentiment         String?
  intents           String[] @default([])
  painPoints        String[] @default([])
  objections        String[] @default([])

  outcome           String?

  createdAt         DateTime @default(now())
}

model ROICalculation {
  id                String   @id @default(cuid())
  contactId         String?
  contact           Contact? @relation(fields: [contactId], references: [id])

  // Inputs
  industry          String
  employeeCount     String
  hourlyRate        Float
  weeklyAdminHours  Float

  // Outputs (stored as JSON for flexibility)
  calculations      Json

  selectedTier      String?
  emailCaptured     Boolean  @default(false)
  email             String?
  reportRequested   Boolean  @default(false)
  reportSentAt      DateTime?

  timeOnCalculator  Int      @default(0)
  adjustmentsCount  Int      @default(0)

  createdAt         DateTime @default(now())
}

model ProposedSystem {
  id                String      @id @default(cuid())
  opportunityId     String
  opportunity       Opportunity @relation(fields: [opportunityId], references: [id])

  name              String
  category          String
  complexity        String
  estimatedHours    Float
  description       String?

  createdAt         DateTime    @default(now())
}

model DeliveredSystem {
  id                String      @id @default(cuid())
  partnershipId     String
  partnership       Partnership @relation(fields: [partnershipId], references: [id])

  name              String
  category          String
  status            SystemStatus @default(PLANNING)
  deploymentDate    DateTime?
  hoursSavedPerWeek Float       @default(0)
  clientIndependent Boolean     @default(false)

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Payment {
  id                String      @id @default(cuid())
  partnershipId     String
  partnership       Partnership @relation(fields: [partnershipId], references: [id])

  type              String      // 'setup' | 'monthly'
  amount            Float
  dueDate           DateTime
  paidDate          DateTime?
  status            String      @default("pending")

  createdAt         DateTime    @default(now())
}

model Activity {
  id                String      @id @default(cuid())

  // Polymorphic relations
  companyId         String?
  company           Company?    @relation(fields: [companyId], references: [id])
  contactId         String?
  contact           Contact?    @relation(fields: [contactId], references: [id])
  opportunityId     String?
  opportunity       Opportunity? @relation(fields: [opportunityId], references: [id])
  partnershipId     String?
  partnership       Partnership? @relation(fields: [partnershipId], references: [id])

  type              ActivityType
  subject           String
  description       String?
  outcome           String?

  scheduledAt       DateTime?
  completedAt       DateTime?

  userId            String?
  user              User?       @relation(fields: [userId], references: [id])

  createdAt         DateTime    @default(now())
}

model User {
  id                String        @id @default(cuid())
  email             String        @unique
  name              String
  role              UserRole      @default(SALES_REP)

  leads             Lead[]
  opportunities     Opportunity[]
  activities        Activity[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

// ============ ENUMS ============

enum Industry {
  HVAC
  PLUMBING
  PROPERTY_MANAGEMENT
  CONSTRUCTION
  RETAIL
  ECOMMERCE
  PROFESSIONAL_SERVICES
  REAL_ESTATE
  OTHER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  UNQUALIFIED
  CONVERTED
}

enum Tier {
  DISCOVERY
  FOUNDATION
  ARCHITECT
}

enum PipelineStage {
  NEW_LEAD
  CONTACTED
  DISCOVERY_CALL
  PROPOSAL_SENT
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum PartnershipStatus {
  ONBOARDING
  ACTIVE
  COMPLETING
  GRADUATED
  PAUSED
  CHURNED
}

enum Phase {
  DISCOVER
  CO_CREATE
  DEPLOY
  INDEPENDENT
}

enum SystemStatus {
  PLANNING
  BUILDING
  TESTING
  DEPLOYED
  OPTIMIZING
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  VOICE_SESSION
  ROI_CALCULATION
  NOTE
  TASK
  SYSTEM_EVENT
}

enum UserRole {
  ADMIN
  SALES_MANAGER
  SALES_REP
  CUSTOMER_SUCCESS
  VIEWER
}
```

---

## 13. API Integrations

### 13.1 Required Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Email (Resend/SendGrid) | Transactional emails, nurture sequences | P0 |
| Calendar (Cal.com) | Booking, availability, reminders | P0 |
| Existing Voice Agent | Session sync, conversation history | P0 |
| Existing ROI Calculator | Calculation data sync | P0 |
| Payment (Stripe) | Setup fees, monthly billing | P1 |
| Document Generation (PDFKit) | ROI reports, proposals | P1 |
| Analytics (Segment/Plausible) | Event tracking | P1 |
| SMS (Twilio) | Appointment reminders | P2 |
| Video (Cal.com/Zoom) | Meeting links | P2 |

### 13.2 Webhook Endpoints

```typescript
// Incoming webhooks to CRM

// Calendar events
POST /api/webhooks/calendar
- booking.created
- booking.cancelled
- booking.rescheduled

// Payment events
POST /api/webhooks/stripe
- payment_intent.succeeded
- invoice.paid
- subscription.updated

// Voice agent events
POST /api/webhooks/voice-agent
- session.started
- session.ended
- session.message

// ROI calculator events
POST /api/webhooks/roi-calculator
- calculation.completed
- report.requested
```

---

## 14. User Roles & Permissions

### 14.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|--------------|
| Admin | System administrator | Full access |
| Sales Manager | Team lead | All data + team metrics |
| Sales Rep | Individual contributor | Own leads/opps + assigned |
| Customer Success | Partnership manager | Partnerships + contacts |
| Viewer | Read-only access | Dashboard + reports only |

### 14.2 Permission Matrix

| Resource | Admin | Sales Mgr | Sales Rep | CS | Viewer |
|----------|-------|-----------|-----------|-----|--------|
| Leads (all) | CRUD | CRUD | Read own | Read | Read |
| Companies | CRUD | CRUD | CRUD | Read | Read |
| Contacts | CRUD | CRUD | CRUD | CRUD | Read |
| Opportunities | CRUD | CRUD | CRUD own | Read | Read |
| Partnerships | CRUD | CRUD | Read | CRUD | Read |
| Voice Sessions | CRUD | Read | Read own | Read | Read |
| Analytics | Full | Full | Limited | Limited | Limited |
| Settings | Full | Limited | None | None | None |
| Users | CRUD | Read | None | None | None |

---

## 15. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Core data model + basic CRUD

- [ ] Database setup (PostgreSQL + Prisma)
- [ ] Authentication (Clerk)
- [ ] Company management
- [ ] Contact management
- [ ] Lead management
- [ ] Basic pipeline view
- [ ] Activity logging

**Deliverable:** Working CRM with manual data entry

### Phase 2: Voice Agent Integration (Weeks 5-6)
**Goal:** Sync voice sessions to CRM

- [ ] Voice session model
- [ ] Webhook endpoint for session sync
- [ ] Session viewer UI
- [ ] Auto-lead creation from sessions
- [ ] Conversation transcript display
- [ ] Topic/intent tagging

**Deliverable:** Voice sessions visible in CRM, auto-lead creation

### Phase 3: ROI Calculator Integration (Weeks 7-8)
**Goal:** Sync ROI data + reporting

- [ ] ROI calculation model
- [ ] Webhook endpoint for calc sync
- [ ] ROI data in lead/contact views
- [ ] PDF report generation
- [ ] Auto-email report delivery
- [ ] ROI comparison on opportunities

**Deliverable:** Full ROI data in CRM, automated reports

### Phase 4: Email & Calendar (Weeks 9-10)
**Goal:** Communication automation

- [ ] Resend integration
- [ ] Email templates
- [ ] Nurture sequence builder
- [ ] Cal.com integration
- [ ] Calendar booking webhooks
- [ ] Meeting scheduling from CRM

**Deliverable:** Email automation + calendar sync

### Phase 5: Partnership Management (Weeks 11-12)
**Goal:** Post-sale tracking

- [ ] Partnership model
- [ ] System delivery tracking
- [ ] Health scoring
- [ ] Phase progression
- [ ] Knowledge transfer tracking
- [ ] Customer portal (basic)

**Deliverable:** Full partnership lifecycle in CRM

### Phase 6: Analytics & Reporting (Weeks 13-14)
**Goal:** Business intelligence

- [ ] Executive dashboard
- [ ] Lead source analytics
- [ ] Pipeline reports
- [ ] Voice agent analytics
- [ ] Partnership health dashboard
- [ ] Export functionality

**Deliverable:** Comprehensive reporting suite

### Phase 7: Automation & Polish (Weeks 15-16)
**Goal:** Workflow automation + UX refinement

- [ ] Inngest/Trigger.dev setup
- [ ] Lead scoring automation
- [ ] Stage transition automation
- [ ] Alert system
- [ ] Mobile responsiveness
- [ ] Performance optimization

**Deliverable:** Production-ready CRM

---

## Appendix A: UI Wireframes

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                    🔔  👤  Settings │
│ │ AI SMB  │  Dashboard  Leads  Pipeline  Partnerships  Reports  │
│ │ CRM     │                                                     │
│ └─────────┘─────────────────────────────────────────────────────│
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ New Leads│  │ Pipeline │  │ Partners │  │   MRR    │        │
│  │   127    │  │ $245,000 │  │    18    │  │ $12,500  │        │
│  │ +23% ↑   │  │  +15% ↑  │  │  +2 ↑    │  │  +8% ↑   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ RECENT ACTIVITY                                             ││
│  │ ────────────────────────────────────────────────────────    ││
│  │ 🎤 Voice session - ABC Plumbing (5 questions, es)   2m ago ││
│  │ 📊 ROI calc completed - XYZ HVAC ($45K projected)   15m ago ││
│  │ 📞 Call logged - Johnson Construction              30m ago ││
│  │ 📧 Email opened - Smith Property Mgmt               1h ago ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │ TASKS DUE TODAY          │  │ VOICE AGENT INSIGHTS         ││
│  │ ─────────────────────    │  │ ─────────────────────        ││
│  │ ☐ Follow up: ABC Plumb   │  │ Top topics: pricing, ROI     ││
│  │ ☐ Discovery: XYZ HVAC    │  │ Sessions today: 12           ││
│  │ ☐ Proposal: 123 Const    │  │ Conversion rate: 28%         ││
│  └──────────────────────────┘  └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Board
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Pipeline  │  + New Opportunity  │  Filter: All Industries ▼  │ $245,000│
├───────────┴─────────────────────┴────────────────────────────┴──────────┤
│                                                                         │
│ New Lead    Contacted    Discovery    Proposal    Negotiate    Won      │
│ $15,000     $28,000      $45,000      $68,000     $89,000      -        │
│                                                                         │
│ ┌────────┐  ┌────────┐  ┌────────┐   ┌────────┐  ┌────────┐            │
│ │ABC HVAC│  │XYZ Prop│  │Smith   │   │Johnson │  │Brown   │            │
│ │$4,000  │  │$9,500  │  │$30,000 │   │$9,500  │  │$30,000 │            │
│ │Disc.   │  │Found.  │  │Arch.   │   │Found.  │  │Arch.   │            │
│ │🎤 3    │  │📊 Yes  │  │📞 2    │   │📧 5    │  │🗓 Thur │            │
│ └────────┘  └────────┘  └────────┘   └────────┘  └────────┘            │
│                                                                         │
│ ┌────────┐  ┌────────┐  ┌────────┐   ┌────────┐                        │
│ │DEF Plmb│  │123 Cons│  │Miller  │   │Davis   │                        │
│ │$9,500  │  │$9,500  │  │$9,500  │   │$4,000  │                        │
│ │Found.  │  │Found.  │  │Found.  │   │Disc.   │                        │
│ └────────┘  └────────┘  └────────┘   └────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Estimated Costs

### Development Costs
| Component | Estimate |
|-----------|----------|
| Phase 1-2: Core + Voice Integration | 80-120 hours |
| Phase 3-4: ROI + Email/Calendar | 60-80 hours |
| Phase 5-6: Partnerships + Analytics | 60-80 hours |
| Phase 7: Automation + Polish | 40-60 hours |
| **Total Development** | **240-340 hours** |

### Monthly Operating Costs (Estimated)
| Service | Cost/Month |
|---------|------------|
| Vercel Pro (or Cloudflare) | $20-50 |
| PostgreSQL (Neon/Supabase) | $25-50 |
| Resend (Email) | $20-50 |
| Cal.com | $15-30 |
| Clerk (Auth) | $25-50 |
| Inngest (Jobs) | $0-25 |
| **Total Monthly** | **$105-255** |

---

## Appendix C: Alternative Approaches

### Option 1: Build Custom (This Document)
- **Pros:** Fully tailored, owns data, no per-seat licensing
- **Cons:** Development time, maintenance burden
- **Best for:** Long-term scaling, unique workflows

### Option 2: Extend Existing CRM (HubSpot/Pipedrive)
- **Pros:** Faster to start, built-in features
- **Cons:** Per-seat costs, limited customization, data lock-in
- **Best for:** Quick start, standard sales process

### Option 3: Low-Code Platform (Airtable/Notion + Integrations)
- **Pros:** Very fast setup, flexible
- **Cons:** Limited scale, complex workflows harder
- **Best for:** MVP/validation phase

### Recommendation
Start with **Option 1 (Custom Build)** given:
1. Unique voice agent integration requirement
2. Industry-specific ROI calculator data
3. Partnership lifecycle complexity
4. Long-term cost efficiency (no per-seat fees)
5. Alignment with existing Next.js/Cloudflare stack

---

*Document Version: 1.0*
*Created: February 2026*
*For: AI KRE8TION Partners (ELEV8TION)*
