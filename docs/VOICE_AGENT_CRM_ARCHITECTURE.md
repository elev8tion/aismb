# Voice Agent CRM Operator — Architecture Report

**Project**: AI KRE8TION Partners — Agentic CRM Voice Operator
**Date**: February 6, 2026
**Status**: Architecture Proposal
**AI Stack**: OpenAI (GPT-4.1-mini, GPT-4.1-nano, o4-mini, Whisper, gpt-4o-mini-tts, Function Calling)
**Updated**: February 6, 2026 — Model optimization pass (GPT-4.1 family + o4-mini)

---

## 1. Executive Vision

A voice-first AI partner that operates the CRM on behalf of the user. The user speaks naturally — the system understands intent, orchestrates specialized agents via OpenAI function calling, executes operations across the CRM, and speaks back results. No clicks, no navigation, no learning curve.

**Target interaction:**

```
User:  "What happened today?"
Agent: "You got 3 new leads — two from the voice agent and one referral.
        The Martinez HVAC deal moved to proposal-sent, worth $12,000.
        You have a booking at 2pm with Sarah Chen. Want me to pull up
        her company details?"
User:  "Yeah, and move that new referral lead to contacted."
Agent: "Done. The referral lead from Apex Plumbing is now marked as
        contacted. Sarah Chen is the Operations Manager at Chen
        Properties — 25 employees, foundation tier prospect. Anything
        else before your 2 o'clock?"
```

---

## 2. Current State Assessment

### What Already Exists

| Component | Location | Status |
|-----------|----------|--------|
| Voice STT (Whisper) | `app/api/voice-agent/transcribe` | Production |
| Voice TTS (OpenAI TTS-1) | `app/api/voice-agent/speak` | Production — upgrade to gpt-4o-mini-tts |
| Chat LLM (GPT-4o-mini) | `app/api/voice-agent/chat` | Production — upgrade to GPT-4.1-nano |
| Session Memory (KV) | `lib/voiceAgent/sessionStorage.ts` | Production |
| Rate Limiting | `lib/security/rateLimiter.ts` | Production |
| Cost Monitoring | `lib/security/costMonitor.ts` | Production |
| Response Caching | `lib/voiceAgent/responseCache.ts` | Production |
| Input Validation | `lib/security/requestValidator.ts` | Production |
| Browser Recording | `components/VoiceAgentFAB/` | Production |
| iOS Audio Handling | `IOSAudioPlayer.ts` | Production |
| Action Tag System | `[ACTION:SCROLL_TO_*]` parsing | Production |
| CRM API Proxy | `app/api/data/[...path]/route.ts` | Production |
| Auth System | `contexts/AuthContext.tsx` | Production |
| NCB Data Layer | 10+ tables fully modeled | Production |
| Email Worker | `kre8tion-email-worker` | Production |

**Key advantage**: The entire OpenAI integration (Whisper STT, GPT chat, TTS) is already battle-tested in production. The CRM operator extends what's already running — no new AI vendor, no new SDK, no new billing account.

### What Needs to Be Built

| Component | Complexity | Notes |
|-----------|-----------|-------|
| Orchestrator Agent (GPT-4.1-mini + function calling) | High | Intent classification, agent routing, context management |
| CRM Tool Layer (OpenAI function definitions) | Medium | Typed functions wrapping NCB CRUD operations |
| Specialist Agents (5-6) | Medium | Domain-specific system prompts + function bindings |
| Voice Interface in CRM | Medium | Port FAB from landing page, add auth context |
| Streaming TTS | Medium | Start speaking before full response is ready |
| Confirmation Protocol | Low | "I'll do X — sound good?" for write operations |
| Agent Memory | Medium | Cross-session context, user preferences, entity resolution |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CRM FRONTEND                             │
│                                                              │
│   ┌──────────────────────────────────────────────────┐       │
│   │           Voice Interface (FAB)                  │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │       │
│   │  │ Record   │→ │ Whisper  │→ │ Orchestrator │   │       │
│   │  │ (Browser)│  │ (STT)    │  │(GPT-4.1-mini)│   │       │
│   │  └──────────┘  └──────────┘  └──────┬───────┘   │       │
│   │                                      │           │       │
│   │       ┌──────────────────────────────┤           │       │
│   │       │  Function Calling Router     │           │       │
│   │       ▼          ▼         ▼         ▼           │       │
│   │  ┌─────────┐┌────────┐┌────────┐┌─────────┐     │       │
│   │  │Booking  ││Pipeline││Lead    ││Analytics│     │       │
│   │  │Tools    ││Tools   ││Tools   ││Tools    │     │       │
│   │  └────┬────┘└───┬────┘└───┬────┘└────┬────┘     │       │
│   │       │         │         │          │           │       │
│   │       └─────────┴─────────┴──────────┘           │       │
│   │                      │                           │       │
│   │              ┌───────▼───────┐                   │       │
│   │              │  CRM Tool     │                   │       │
│   │              │  Executor     │                   │       │
│   │              └───────┬───────┘                   │       │
│   │                      │                           │       │
│   │              ┌───────▼───────┐  ┌────────────┐   │       │
│   │              │  NCB API      │  │ TTS Stream │   │       │
│   │              │  Proxy        │  │ (OpenAI)   │   │       │
│   │              └───────┬───────┘  └──────┬─────┘   │       │
│   │                      │                 │         │       │
│   │                      ▼                 ▼         │       │
│   │              ┌─────────────┐    ┌──────────┐     │       │
│   │              │ NoCodeBack  │    │ Speaker  │     │       │
│   │              │ end (NCB)   │    │ (Audio)  │     │       │
│   │              └─────────────┘    └──────────┘     │       │
│   └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Why Single-Vendor (OpenAI) Works Best Here

1. **Already integrated** — Whisper, GPT chat, TTS are all live in production
2. **One SDK** — `openai` npm package handles STT, chat, function calling, and TTS
3. **One API key** — already configured, cost monitoring already tracks it
4. **Function calling is native** — GPT-4.1-mini's function calling is the orchestration mechanism; no external agent framework needed
5. **GPT-4.1 family** — 1M context, better benchmarks than GPT-4o, 84% cheaper
6. **Realtime API option** — OpenAI's Realtime API can eventually replace the STT→LLM→TTS chain with a single WebSocket for sub-second latency

---

## 4. Orchestrator Agent

The brain of the system. A single GPT-4.1-mini chat completion call with function definitions. The model decides which functions to call, processes results, and generates a spoken response.

### Model Selection (Optimized February 2026)

| Model | Role | Input $/1M | Output $/1M | Cached $/1M | Context | Use Case |
|-------|------|-----------|-------------|-------------|---------|----------|
| **GPT-4.1-mini** | Primary orchestrator | $0.40 | $1.60 | $0.10 | 1M | Multi-tool reasoning, write confirmations, complex queries |
| **GPT-4.1-nano** | Fast-path | $0.10 | $0.40 | $0.025 | 1M | Simple reads, single tool calls, greetings, classification |
| **o4-mini** | Heavy reasoning | $1.10 | $4.40 | $0.275 | 200K | Complex analytics, multi-step operations (on-demand only) |
| **Whisper** | STT | $0.006/min | — | — | — | Speech transcription (already in production) |
| **gpt-4o-mini-tts** | Speech | $0.60 (text in) | $12.00 (audio out) | — | — | ~$0.015/min — Voice responses |

#### Why GPT-4.1-mini Over GPT-4o

| Metric | GPT-4o | GPT-4.1-mini | Improvement |
|--------|--------|-------------|-------------|
| Input cost | $2.50/1M | $0.40/1M | **84% cheaper** |
| Output cost | $10.00/1M | $1.60/1M | **84% cheaper** |
| Cached input | $1.25/1M | $0.10/1M | **92% cheaper** |
| Context window | 128K | 1M | **8x larger** |
| Function calling | Good | Excellent — major improvement | Better tool use accuracy |
| Instruction following | Good | Excellent — beats GPT-4o benchmarks | More reliable outputs |
| Latency | ~600ms | ~300ms | **~50% faster** |

GPT-4.1-mini beats GPT-4o across the board while costing a fraction of the price. The 1M context window means entire conversation histories + CRM context fit easily — no need for aggressive context trimming.

#### Three-Tier Model Routing

| Tier | Model | Trigger | Example |
|------|-------|---------|---------|
| **Fast** | GPT-4.1-nano ($0.10/$0.40) | Simple reads, greetings, classification | "How many leads?" / "Good morning" |
| **Standard** | GPT-4.1-mini ($0.40/$1.60) | Multi-tool queries, writes, most operations | "What's my pipeline?" / "Move deal to negotiation" |
| **Reasoning** | o4-mini ($1.10/$4.40) | Complex analytics, multi-step reasoning | "Which leads from last month haven't been followed up and why?" |

**Recommended approach**: Three-tier model routing
- **GPT-4.1-nano** for simple reads, greetings, and single-function calls (fastest, cheapest)
- **GPT-4.1-mini** for standard operations, parallel function calls, write confirmations (best balance)
- **o4-mini** for deep reasoning queries that need chain-of-thought (on-demand only)

### How OpenAI Function Calling Powers the Orchestration

Instead of separate "agents", GPT-4.1-mini uses **function calling** to invoke CRM tools directly. The model receives all available functions in its context, decides which to call (including parallel calls), processes the results, and generates a natural response.

```typescript
// Single chat completion call — GPT-4.1-mini handles the orchestration
const response = await openai.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: conversationHistory,
  tools: ALL_CRM_FUNCTIONS,       // 30+ function definitions
  tool_choice: 'auto',            // Model decides what to call
  parallel_tool_calls: true,      // Can call multiple functions at once
});

// If model wants to call tools:
if (response.choices[0].finish_reason === 'tool_calls') {
  const toolResults = await executeToolCalls(response.choices[0].message.tool_calls);
  // Feed results back, get final spoken response
}
```

This is simpler than a multi-agent framework — GPT-4.1-mini IS the orchestrator, and the "specialist agents" are just groups of function definitions.

### Orchestrator System Prompt

```
You are the AI Operations Partner for {user.name} at {company_name}.
You manage their CRM through voice conversation. You are concise,
professional, and proactive.

RULES:
1. For READ operations: call the relevant function immediately and
   summarize results naturally in 1-3 sentences.
2. For WRITE operations: always describe what you're about to do and
   ask for confirmation before calling the function.
   — "I'll move the Johnson deal to negotiation. Sound good?"
3. For AMBIGUOUS references: ask for clarification.
   — "I see two leads named Johnson. Marcus at Apex HVAC or
      Jennifer at Johnson Electric?"
4. Keep spoken responses under 3 sentences unless asked for detail.
5. Track conversation context — resolve "that one", "the other",
   "him" from prior messages.
6. Batch related operations with parallel_tool_calls when possible.
   — User says "Update the lead and create a follow-up task"
   — You confirm both, then call both functions in parallel.
7. After completing actions, briefly confirm what was done.
8. Proactively surface relevant information when appropriate:
   — "By the way, the Chen booking is in 45 minutes."

RESPONSE FORMAT:
- Respond conversationally as if speaking aloud.
- Never use markdown, bullet points, or formatting — this is voice.
- Use natural pauses: "Let me check... You have 3 new leads today."
- Numbers: say "twelve thousand" not "$12,000".
```

### Intent Classification (Built Into Function Calling)

No separate classification step needed. GPT-4.1-mini naturally maps user utterances to the right function calls:

| User Says | Model Calls | Response |
|-----------|-------------|----------|
| "How are we doing this week?" | `get_dashboard_stats()` + `get_lead_summary()` | Summarizes stats conversationally |
| "Show me new leads" | `list_leads({status: "new"})` | Lists leads by name |
| "What's our pipeline value?" | `get_pipeline_summary()` | Reports total + breakdown |
| "What's on my calendar?" | `get_todays_bookings()` | Lists today's bookings |
| "Move Martinez to negotiation" | Confirms first, then `move_deal(id, "negotiation")` | Confirms completion |
| "Block off next Friday" | Confirms first, then `block_date("2026-02-13")` | Confirms date blocked |
| "Update the lead and create a deal" | Confirms, then parallel: `update_lead()` + `create_opportunity()` | Confirms both |
| "Good morning" | `get_daily_summary()` | Full daily briefing |

---

## 5. Function Definitions (OpenAI Tools)

All functions are defined in OpenAI's `tools` format and passed to every chat completion call. The model picks which to call based on user intent.

### 5A. Lead Functions

```typescript
const leadFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_leads',
      description: 'List leads with optional filters. Returns lead name, company, source, score, and status.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted'], description: 'Filter by lead status' },
          source: { type: 'string', enum: ['voice-agent', 'roi-calculator', 'referral', 'website', 'social-media', 'cold-outreach', 'other'] },
          industry: { type: 'string' },
          limit: { type: 'number', description: 'Max results to return. Default 10.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_leads',
      description: 'Search leads by name, email, or company name.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'count_leads',
      description: 'Count leads by status. Good for quick stats like "how many new leads?"',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_lead',
      description: 'Create a new lead. ALWAYS confirm with the user before calling.',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: 'string' },
          company_name: { type: 'string' },
          source: { type: 'string', enum: ['voice-agent', 'roi-calculator', 'referral', 'website', 'social-media', 'cold-outreach', 'other'] },
          industry: { type: 'string' }
        },
        required: ['email', 'source']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_lead_status',
      description: 'Update a lead status. ALWAYS confirm with the user before calling.',
      parameters: {
        type: 'object',
        properties: {
          lead_id: { type: 'string' },
          status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted'] }
        },
        required: ['lead_id', 'status']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'score_lead',
      description: 'Set a lead score (0-100). ALWAYS confirm with the user before calling.',
      parameters: {
        type: 'object',
        properties: {
          lead_id: { type: 'string' },
          score: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['lead_id', 'score']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_lead_summary',
      description: 'Get lead analytics: total count, breakdown by status and source, average score.',
      parameters: { type: 'object', properties: {} }
    }
  }
];
```

### 5B. Booking Functions

```typescript
const bookingFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_todays_bookings',
      description: 'Get all bookings for today. Includes guest name, time, status.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_bookings',
      description: 'Get upcoming bookings for the next N days.',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days ahead. Default 7.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_bookings',
      description: 'List bookings with optional status filter.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'confirm_booking',
      description: 'Confirm a pending booking. ALWAYS confirm with the user before calling.',
      parameters: {
        type: 'object',
        properties: { booking_id: { type: 'string' } },
        required: ['booking_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Cancel a booking. HIGH RISK — ALWAYS get explicit user confirmation.',
      parameters: {
        type: 'object',
        properties: { booking_id: { type: 'string' } },
        required: ['booking_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'block_date',
      description: 'Block a date from receiving bookings. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD format' },
          reason: { type: 'string' }
        },
        required: ['date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'unblock_date',
      description: 'Remove a blocked date. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: { blocked_date_id: { type: 'string' } },
        required: ['blocked_date_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_availability',
      description: 'Get available time slots for a specific date.',
      parameters: {
        type: 'object',
        properties: { date: { type: 'string', description: 'YYYY-MM-DD format' } },
        required: ['date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_booking_summary',
      description: 'Get booking analytics: totals, upcoming count, busiest day.',
      parameters: { type: 'object', properties: {} }
    }
  }
];
```

### 5C. Pipeline Functions

```typescript
const pipelineFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_opportunities',
      description: 'List pipeline opportunities with optional stage/tier filter.',
      parameters: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: ['new-lead', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'closed-won'] },
          tier: { type: 'string', enum: ['discovery', 'foundation', 'architect'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_pipeline_summary',
      description: 'Get pipeline analytics: total value, deal count, breakdown by stage and tier, average deal size.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_opportunity',
      description: 'Create a new deal in the pipeline. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Deal name' },
          tier: { type: 'string', enum: ['discovery', 'foundation', 'architect'] },
          stage: { type: 'string', enum: ['new-lead', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'closed-won'] },
          setup_fee: { type: 'number' },
          monthly_fee: { type: 'number' },
          expected_close_date: { type: 'string', description: 'YYYY-MM-DD' }
        },
        required: ['name', 'tier', 'setup_fee']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'move_deal',
      description: 'Move a deal to a different pipeline stage. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          opportunity_id: { type: 'string' },
          new_stage: { type: 'string', enum: ['new-lead', 'contacted', 'discovery-call', 'proposal-sent', 'negotiation', 'closed-won'] }
        },
        required: ['opportunity_id', 'new_stage']
      }
    }
  }
];
```

### 5D. Contact & Company Functions

```typescript
const contactFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_contacts',
      description: 'Search contacts by name, email, or company.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_contact',
      description: 'Get full details for a specific contact.',
      parameters: {
        type: 'object',
        properties: { contact_id: { type: 'string' } },
        required: ['contact_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_contact',
      description: 'Create a new contact. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          company_id: { type: 'string' },
          role: { type: 'string', enum: ['Owner', 'CEO', 'Operations Manager', 'IT Manager', 'Office Manager', 'CFO', 'Other'] },
          decision_maker: { type: 'boolean' }
        },
        required: ['first_name', 'last_name', 'email']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_companies',
      description: 'Search companies by name or industry.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_company',
      description: 'Create a new company record. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          industry: { type: 'string' },
          employee_count: { type: 'string', enum: ['1-5', '5-10', '10-25', '25-50', '50-100', '100+'] },
          website: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' }
        },
        required: ['name', 'industry', 'employee_count']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_company_contacts',
      description: 'Get all contacts associated with a company.',
      parameters: {
        type: 'object',
        properties: { company_id: { type: 'string' } },
        required: ['company_id']
      }
    }
  }
];
```

### 5E. Partnership Functions

```typescript
const partnershipFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_partnerships',
      description: 'List partnerships with optional status/tier filter.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['onboarding', 'active', 'graduated'] },
          tier: { type: 'string', enum: ['discovery', 'foundation', 'architect'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_partnership_summary',
      description: 'Get partnership analytics: active count, avg health, systems delivered, by phase.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_partnership_phase',
      description: 'Update a partnership phase. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          partnership_id: { type: 'string' },
          phase: { type: 'string', enum: ['discover', 'co-create', 'deploy', 'independent'] }
        },
        required: ['partnership_id', 'phase']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_health_score',
      description: 'Update a partnership health score (0-100). ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          partnership_id: { type: 'string' },
          score: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['partnership_id', 'score']
      }
    }
  }
];
```

### 5F. Analytics & Task Functions

```typescript
const analyticsFunctions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_dashboard_stats',
      description: 'Get high-level CRM stats: total leads, pipeline value, active partners, MRR.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_summary',
      description: 'Get a full daily briefing: new leads, deals moved, bookings today, tasks due. Use when user says "good morning" or "what\'s my day look like?"',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_activities',
      description: 'Get recent CRM activities (calls, emails, tasks, voice sessions).',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Max results. Default 10.' } }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_voice_session_insights',
      description: 'Get analytics on voice sessions: total, avg duration, sentiment breakdown, top topics.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_roi_calculation_insights',
      description: 'Get analytics on ROI calculator usage: total calculations, avg ROI, popular tier, emails captured.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a follow-up task or reminder. ALWAYS confirm with the user.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          due_date: { type: 'string', description: 'YYYY-MM-DD format' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_tasks',
      description: 'List tasks with optional status/priority filter.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'completed'] },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    }
  }
];
```

**Total: 33 functions** across 6 domains, all passed to GPT-4.1-mini as `tools`.

---

## 6. CRM Tool Layer Implementation

All functions are executed server-side through a unified tool layer that wraps NCB API calls.

### Architecture

```
GPT-4.1-mini function call
      │
      ▼
┌─────────────────────┐
│  Tool Executor      │  Maps function name → handler
│  lib/agent/tools/   │
│  index.ts           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Domain Handlers    │  Type-safe functions per domain
│  ├── leads.ts       │
│  ├── bookings.ts    │
│  ├── pipeline.ts    │
│  ├── contacts.ts    │
│  ├── partnerships.ts│
│  └── analytics.ts   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  NCB API Client     │  Authenticated fetch to NoCodeBackend
│  lib/agent/ncb.ts   │  Reuses same proxy pattern as CRM pages
└─────────────────────┘
```

### Tool Executor (Core Loop)

```typescript
// lib/agent/tools/index.ts
import { leadHandlers } from './leads';
import { bookingHandlers } from './bookings';
import { pipelineHandlers } from './pipeline';
import { contactHandlers } from './contacts';
import { partnershipHandlers } from './partnerships';
import { analyticsHandlers } from './analytics';

const TOOL_REGISTRY: Record<string, (params: any, userId: string) => Promise<any>> = {
  ...leadHandlers,
  ...bookingHandlers,
  ...pipelineHandlers,
  ...contactHandlers,
  ...partnershipHandlers,
  ...analyticsHandlers,
};

export async function executeTool(
  name: string,
  params: Record<string, unknown>,
  userId: string
): Promise<string> {
  const handler = TOOL_REGISTRY[name];
  if (!handler) return JSON.stringify({ error: `Unknown tool: ${name}` });

  const result = await handler(params, userId);
  return JSON.stringify(result);
}
```

### Orchestrator Chat Endpoint

```typescript
// POST /api/agent/chat — the main loop
export async function POST(req: NextRequest) {
  const { session_id, transcript } = await req.json();
  const user = await getAuthenticatedUser(req);
  const session = await getOrCreateSession(session_id, user.id);

  // Add user message to conversation
  session.conversation.push({ role: 'user', content: transcript });

  // Select model based on complexity (three-tier routing)
  const model = isSimpleQuery(transcript) ? 'gpt-4.1-nano'
    : isComplexReasoning(transcript) ? 'o4-mini'
    : 'gpt-4.1-mini';

  // Call GPT with all function definitions
  let response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt(user) },
      ...session.conversation,
    ],
    tools: ALL_CRM_FUNCTIONS,
    tool_choice: 'auto',
    parallel_tool_calls: true,
  });

  // Function calling loop — execute tools and feed results back
  while (response.choices[0].finish_reason === 'tool_calls') {
    const toolCalls = response.choices[0].message.tool_calls;
    const toolResults = await Promise.all(
      toolCalls.map(async (call) => ({
        tool_call_id: call.id,
        role: 'tool' as const,
        content: await executeTool(call.function.name, JSON.parse(call.function.arguments), user.id),
      }))
    );

    // Feed results back to GPT for final response
    response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt(user) },
        ...session.conversation,
        response.choices[0].message,  // The assistant's tool_calls message
        ...toolResults,               // The tool results
      ],
      tools: ALL_CRM_FUNCTIONS,
      tool_choice: 'auto',
    });
  }

  const assistantMessage = response.choices[0].message.content;
  session.conversation.push({ role: 'assistant', content: assistantMessage });
  await saveSession(session);

  return NextResponse.json({ response: assistantMessage });
}
```

---

## 7. Voice Pipeline — Latency Optimization

Target: **under 3 seconds** for simple queries.

### Current Pipeline (Landing Page)

```
Record → Stop → Upload blob → Whisper STT → GPT-4.1-nano → gpt-4o-mini-tts → Play
         [~500ms]  [~800ms]     [~600ms]       [~400ms]        [~300ms]
                                                  Total: ~2.6s
```

### Optimized Pipeline (CRM Operator)

```
Phase 1: Transcription
  Record → Stop → Whisper STT ──────────────────────┐
                                                      │
Phase 2: Reasoning + Function Calls                   │
  ┌───────────────────────────────────────────────────┘
  │
  ▼
  GPT-4.1-mini → Function calls (parallel) → Response tokens (streamed)
                                                │
Phase 3: Speaking (streamed)                    │
  ┌─────────────────────────────────────────────┘
  │
  ▼
  gpt-4o-mini-tts chunks → Play first chunk immediately
                            while generating remaining chunks
```

### Key Optimizations

1. **Streaming TTS**: Split response into sentences, send each to gpt-4o-mini-tts independently. Start playing sentence 1 while sentence 2 generates.

2. **Parallel function calls**: GPT-4.1-mini natively supports `parallel_tool_calls: true`. "How are we doing?" calls `get_dashboard_stats()` + `get_lead_summary()` + `get_booking_summary()` simultaneously.

3. **GPT-4.1-nano fast-path**: Simple queries ("How many new leads?") route to 4.1-nano with a single function call. Fastest available model.

4. **Prompt caching (92% savings)**: GPT-4.1-mini caches repeated input at $0.10/1M (vs $0.40 uncached). System prompt + function definitions are cached across requests — massive savings since 30+ function definitions are identical every call.

5. **Prefetch on mic tap**: When user opens the voice interface, prefetch `get_daily_summary()` in the background. Common first queries are instant.

6. **Context caching**: With 1M context window, entire conversation histories fit without trimming. Follow-up questions ("what about the referral one?") need no additional function call.

7. **Future: OpenAI Realtime API**: Replace the STT→LLM→TTS chain with a single WebSocket connection. Sub-second end-to-end latency. This is the endgame but requires Realtime API to support function calling (currently in beta).

### Latency Targets

| Query Type | Target | Example |
|------------|--------|---------|
| Simple read | < 2s | "How many new leads?" |
| Multi-domain read | < 3s | "Give me a daily summary" |
| Write + confirm | < 2s + user + < 1.5s | "Mark lead as contacted" |
| Complex multi-step | < 4s | "Create a deal from the Apex lead" |

---

## 8. Confirmation Protocol

Write operations require explicit user confirmation.

### Flow

```
User:  "Delete the Martinez booking"
Agent: "I'll cancel the booking with Martinez for Thursday at 3pm.
        Should I go ahead?"
User:  "Yes"
Agent: [calls cancel_booking()] "Done. The Martinez booking is cancelled."
```

### Risk Classification

| Risk Level | Operations | Confirmation Style |
|------------|-----------|-------------------|
| **None** | All reads, searches, summaries | Execute immediately |
| **Low** | Update status, score lead, add task | Quick: "I'll mark it contacted — yes?" |
| **Medium** | Create records, move deals, block dates | Detail: "I'll create an opportunity for Apex at five thousand, discovery tier. Sound good?" |
| **High** | Cancel bookings, change availability | Explicit: "This will cancel the confirmed booking with Sarah Chen for tomorrow at 2pm. Are you sure?" |

### Implementation

GPT-4.1-mini handles this naturally through the system prompt instruction "ALWAYS confirm before calling write functions." The model will describe the action and wait for the user's next message before making the function call.

When the user confirms, GPT-4.1-mini makes the function call in the next turn. When the user denies, the model acknowledges and moves on.

For additional safety, the tool executor can enforce a whitelist of "safe" (read-only) functions that execute without question, and require that write functions only execute when the prior assistant message contained a confirmation question.

---

## 9. Agent Memory & Context

### Session Context (Short-Term) — Cloudflare KV

Stored per conversation session. Includes:
- Full conversation history (last 20 turns)
- Resolved entity references ("the Johnson deal" → opportunity ID 47)
- Recently fetched data (avoid redundant API calls)
- Current focus area (leads, pipeline, bookings, etc.)

```typescript
interface AgentSession {
  session_id: string;
  user_id: string;
  conversation: ChatCompletionMessageParam[];  // OpenAI message format
  entities: { label: string; type: string; id: string; last_mentioned: number }[];
  cached_data: { key: string; data: unknown; fetched_at: number }[];
  focus: string | null;
  created_at: number;
  last_accessed: number;
}
```

### User Context (Long-Term) — NCB user_profiles

Persisted across sessions:
- Preferred name / how they want to be addressed
- Common operations (auto-suggest based on patterns)
- Business context (company name, industry, team size)
- Notification preferences
- Timezone

### Entity Resolution

GPT-4.1-mini resolves natural language references using conversation context + function calls:

```
"the Johnson deal"     → searches conversation for prior mentions, or calls search functions
"that new lead"        → most recently discussed or most recently created lead
"the HVAC partnership" → calls list_partnerships() and filters
"my 2 o'clock"         → calls get_todays_bookings() and finds 14:00 slot
"him"                  → resolves from last mentioned contact/lead in conversation
```

Strategy:
1. GPT-4.1-mini checks conversation context first (cheapest — no API call)
2. If ambiguous, model calls the relevant search function
3. If multiple matches, model asks for clarification
4. Resolved entities stay in conversation context for follow-ups (1M context means nothing gets trimmed)

---

## 10. Security Model

### Authentication
- Voice agent runs inside the authenticated CRM
- All tool calls go through the existing NCB proxy which enforces user_id scoping
- No cross-user data access possible

### Authorization
- Tool layer inherits the user's session — same permissions as the UI
- Write operations require voice confirmation (enforced by system prompt + tool executor)
- Destructive operations (cancel, delete) require explicit confirmation

### Input Validation
- Reuse existing `requestValidator.ts` for prompt injection detection
- Function parameters validated with TypeScript types before execution
- Rate limiting: 30 agent requests/minute (higher than public voice agent)
- Cost monitoring: existing `costMonitor.ts` tracks all OpenAI API calls

### Audit Trail
- All function executions logged to `agent_activity_log` table
- Fields: user_id, function_name, params, result_summary, model_used, timestamp
- Enables "what did I tell you to do yesterday?" queries

---

## 11. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| STT | OpenAI Whisper (`whisper-1`) | Already in production, $0.006/min |
| Orchestrator | OpenAI GPT-4.1-mini + function calling | Beats GPT-4o benchmarks, 84% cheaper, 1M context, excellent tool use |
| Fast-path | OpenAI GPT-4.1-nano + function calling | Fastest model available, $0.10/$0.40 per 1M tokens |
| Heavy reasoning | OpenAI o4-mini (on-demand) | Best reasoning model at $1.10/$4.40 — still 56% cheaper than GPT-4o |
| TTS | OpenAI gpt-4o-mini-tts | Token-based pricing ~$0.015/min, replaces character-based TTS-1 |
| Session Storage | Cloudflare KV | Already deployed, low-latency |
| Data Layer | NCB via existing proxy | No new infrastructure |
| Frontend | React (existing CRM) | Port VoiceAgentFAB component |
| Deployment | Cloudflare Pages (landing) / Vercel Edge (CRM) | Already deployed |
| Email | Cloudflare Email Worker | Already deployed |

### Dependencies

```json
{
  "openai": "^4.x"  // Already installed — no new dependencies
}
```

**Zero new dependencies**. The `openai` package already handles chat completions with function calling, Whisper, and TTS. Everything needed is already in `package.json`.

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Voice input/output working in the CRM with read-only functions.

- [ ] Port `VoiceAgentFAB` component to CRM frontend
- [ ] Add auth-aware voice recording (passes session cookies to API)
- [ ] Create `/api/agent/chat` endpoint with GPT-4.1-mini + function calling
- [ ] Define analytics functions (`get_dashboard_stats`, `get_daily_summary`)
- [ ] Implement tool executor with NCB client
- [ ] Wire STT → GPT-4.1-mini → gpt-4o-mini-tts pipeline
- [ ] Test: "How many leads do I have?" works end-to-end

**Deliverable**: User can ask questions about their CRM data via voice.

### Phase 2: All Read Functions (Week 2-3)

**Goal**: All 6 domains have read-only functions working.

- [ ] Implement all lead read functions (list, search, count, summary)
- [ ] Implement all booking read functions (today, upcoming, availability)
- [ ] Implement all pipeline read functions (list, summary, by stage)
- [ ] Implement contact/company search and list functions
- [ ] Implement partnership list and summary functions
- [ ] Implement activity and task list functions
- [ ] Add entity resolution via conversation context
- [ ] Test: "What's my day look like?" returns multi-domain summary

**Deliverable**: User can query any CRM data naturally by voice.

### Phase 3: Write Operations (Week 3-4)

**Goal**: Functions can create and update records with confirmation.

- [ ] Add all write functions (create lead, move deal, confirm booking, etc.)
- [ ] Implement confirmation enforcement in tool executor
- [ ] Implement audit logging (`agent_activity_log` table)
- [ ] Three-tier model routing (GPT-4.1-nano / GPT-4.1-mini / o4-mini)
- [ ] Test: "Move the deal to negotiation" → confirm → executed

**Deliverable**: User can operate their entire CRM by voice.

### Phase 4: Intelligence (Week 4-5)

**Goal**: Streaming TTS, parallel calls, proactive insights.

- [ ] Streaming TTS (sentence-by-sentence)
- [ ] Parallel function execution via `parallel_tool_calls: true`
- [ ] Prefetch on mic tap (dashboard stats in background)
- [ ] Cross-domain workflows ("Create a deal from this lead" → auto-populates)
- [ ] Daily briefing on "Good morning"
- [ ] Proactive surfacing ("By the way, booking in 30 minutes")

**Deliverable**: The agent feels like a real operations partner.

### Phase 5: Polish (Week 5-6)

**Goal**: Production hardening, personality tuning, mobile UX.

- [ ] Personality tuning (response length, tone, proactivity level)
- [ ] Error recovery ("I couldn't find that — can you be more specific?")
- [ ] Graceful degradation if OpenAI API is slow/down
- [ ] Usage analytics dashboard
- [ ] Cost optimization (cache frequent queries, batch calls)
- [ ] Mobile-optimized voice UX
- [ ] User onboarding flow for voice agent

### Future: Phase 6 — OpenAI Realtime API

- [ ] Replace STT→Chat→TTS chain with single WebSocket
- [ ] Sub-second end-to-end latency
- [ ] Interruption support (user can cut in mid-response)
- [ ] Server-side function calling via Realtime API events

---

## 13. Cost Projection

### Per-Interaction Cost Estimate (Updated with GPT-4.1 family)

| Component | Fast (4.1-nano) | Standard (4.1-mini) | Reasoning (o4-mini) |
|-----------|----------------|--------------------|--------------------|
| Whisper STT (5s audio) | $0.0005 | $0.0005 | $0.001 |
| LLM (~500 in / ~200 out tokens) | $0.00013 | $0.00052 | $0.00143 |
| Tool execution (NCB fetch) | $0.00 | $0.00 | $0.00 |
| gpt-4o-mini-tts (~200 chars) | $0.001 | $0.001 | $0.002 |
| **Total** | **~$0.0017** | **~$0.0020** | **~$0.0044** |

### Comparison with Previous Architecture (GPT-4o / GPT-4o-mini)

| | Old (GPT-4o-mini + GPT-4o) | New (GPT-4.1-nano + GPT-4.1-mini) | Savings |
|-|---------------------------|-----------------------------------|---------||
| Simple query | ~$0.004 | ~$0.0017 | **58% cheaper** |
| Complex query | ~$0.016 | ~$0.0020 | **88% cheaper** |
| Heavy reasoning | ~$0.016 | ~$0.0044 | **73% cheaper** |

### Monthly Projections

| Usage Level | Interactions/Day | Mix (60% fast / 30% standard / 10% reasoning) | Monthly Cost |
|-------------|-----------------|-----------------------------------------------|-------------|
| Light (solo) | 20 | 12 fast + 6 standard + 2 reasoning | ~$1.50 |
| Moderate | 50 | 30 fast + 15 standard + 5 reasoning | ~$3.50 |
| Heavy | 100 | 60 fast + 30 standard + 10 reasoning | ~$7.00 |

With prompt caching (system prompt + function definitions cached at 75% discount) and response caching for repeated queries, actual costs will be **40-50% lower** than projections.

### Prompt Caching Bonus

The 30+ function definitions are identical on every call (~2,000 tokens). With GPT-4.1-mini prompt caching:
- **Uncached**: 2,000 tokens × $0.40/1M = $0.0008/call
- **Cached**: 2,000 tokens × $0.10/1M = $0.0002/call (75% savings on system prompt)

---

## 14. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Agent executes wrong action | High | Medium | Confirmation protocol for all writes |
| Latency too high for voice UX | High | Low | Two-tier model routing, streaming TTS, caching |
| Entity resolution errors | Medium | Medium | Always confirm ambiguous references |
| Cost overruns | Medium | Low | Rate limiting, cost monitoring (already built) |
| Browser mic permissions | Low | Low | Already solved in landing page FAB |
| OpenAI API downtime | Medium | Low | Graceful degradation, retry logic |
| Function calling hallucination | Medium | Low | Parameter validation in tool executor, TypeScript types |

---

## 15. API Endpoint Structure (CRM)

New endpoints to be added to the CRM:

```
POST /api/agent/transcribe      → Whisper STT (port from landing page)
POST /api/agent/chat             → GPT-4.1-mini orchestrator + function calling
POST /api/agent/speak            → OpenAI TTS (port from landing page)
GET  /api/agent/session          → Get current session state
DELETE /api/agent/session         → Clear session
```

### `/api/agent/chat` Request

```typescript
{
  session_id: string;
  transcript: string;        // From STT
  // OR
  audio: File;               // Raw audio (server handles STT)
}
```

### `/api/agent/chat` Response

```typescript
{
  response: string;          // Text to speak
  audio_url?: string;        // Pre-generated TTS (if not streaming)
  actions_taken: {           // What functions were called
    function: string;
    result_summary: string;
  }[];
  pending_confirmation?: {   // Write op awaiting user yes/no
    description: string;
    risk_level: 'low' | 'medium' | 'high';
  };
  entities_mentioned: {      // For UI highlighting
    type: string;
    id: string;
    name: string;
  }[];
}
```

---

## 16. File Structure (New)

```
ai_smb_crm_frontend/
├── app/
│   └── api/
│       └── agent/
│           ├── chat/route.ts           # GPT-4.1-mini orchestrator + function calling loop
│           ├── session/route.ts        # Session management (GET/DELETE)
│           ├── transcribe/route.ts     # Whisper STT (port from landing page)
│           └── speak/route.ts          # OpenAI TTS (port from landing page)
├── components/
│   └── VoiceOperator/
│       ├── index.tsx                   # Main FAB component (auth-aware)
│       ├── VoiceRecorder.tsx           # Recording UI + hook
│       ├── TranscriptDisplay.tsx       # Shows conversation
│       ├── ActionFeed.tsx              # Shows executed function calls
│       └── ConfirmationPrompt.tsx      # Write confirmation UI
├── lib/
│   └── agent/
│       ├── orchestrator.ts             # GPT-4.1-mini chat + function calling loop
│       ├── functions.ts                # All 33 function definitions (OpenAI tools format)
│       ├── session.ts                  # KV session management
│       ├── modelRouter.ts             # Three-tier: 4.1-nano / 4.1-mini / o4-mini
│       ├── entityResolver.ts           # Natural language → record ID
│       └── tools/
│           ├── index.ts                # Tool registry + executor
│           ├── ncbClient.ts            # Authenticated NCB fetch wrapper
│           ├── leads.ts                # Lead CRUD handlers
│           ├── bookings.ts             # Booking CRUD handlers
│           ├── pipeline.ts             # Pipeline CRUD handlers
│           ├── contacts.ts             # Contact/Company handlers
│           ├── partnerships.ts         # Partnership handlers
│           └── analytics.ts            # Dashboard/summary/task handlers
└── contexts/
    └── VoiceAgentContext.tsx            # Global voice agent state
```

---

## 17. Landing Page Voice Agent — Model Upgrade

The landing page voice agent (`lib/openai/config.ts`) currently uses GPT-4o-mini + TTS-1. These should be upgraded to the same model family for consistency and cost savings.

### Current vs Recommended (Landing Page)

| Component | Current Model | Current Cost | Recommended | New Cost | Savings |
|-----------|-------------|-------------|-------------|----------|---------|
| Chat | `gpt-4o-mini` | $0.15/$0.60 per 1M | **`gpt-4.1-nano`** | $0.10/$0.40 per 1M | **33% cheaper** |
| TTS | `tts-1` | $15/1M chars | **`gpt-4o-mini-tts`** | ~$0.015/min (token-based) | **Cheaper for short responses** |
| STT | `whisper-1` | $0.006/min | **`whisper-1`** (keep) | $0.006/min | No change |
| Voice | `echo` | — | **`echo`** (keep) | — | No change |

### Why GPT-4.1-nano for the Landing Page

The landing page voice agent has a specific, constrained role:
- **No function calling** — uses regex-based action tags (`[ACTION:SCROLL_TO_*]`)
- **Fixed knowledge base** — 557-line system prompt injected every call
- **Short responses** — 150-200 token max (question classifier limits)
- **Simple classification** — FAQ matching, lead scoring, tier routing

GPT-4.1-nano is the optimal choice because:
1. **It excels at classification and instruction following** — exactly what the landing page needs
2. **1M context window** — the entire 557-line knowledge base fits easily, with room for full conversation history
3. **75% cheaper than GPT-4o-mini** on cached input ($0.025 vs $0.075) — and the knowledge base is cached on every call
4. **Faster latency** — lowest latency model available, improving voice round-trip time
5. **Better instruction adherence** — GPT-4.1 family outperforms GPT-4o on instruction following benchmarks

### Why gpt-4o-mini-tts for the Landing Page

- Token-based pricing is more predictable than character-based
- At typical response length (~100-200 chars), cost is ~$0.01-0.015 per response
- Same voice options available (`echo` still works)
- Newer model with better voice quality

### Config Change Required

```typescript
// lib/openai/config.ts — updated models
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4.1-nano',           // was: 'gpt-4o-mini'
  tts: 'gpt-4o-mini-tts',         // was: 'tts-1'
  voice: 'echo',
} as const;
```

### Landing Page Cost Impact

| Metric | Current (GPT-4o-mini + TTS-1) | Updated (GPT-4.1-nano + gpt-4o-mini-tts) |
|--------|------------------------------|------------------------------------------|
| Per interaction (chat only) | ~$0.0004 | ~$0.00013 |
| Per interaction (full: STT+chat+TTS) | ~$0.004 | ~$0.0017 |
| 100 interactions/day (monthly) | ~$12 | ~$5 |
| With prompt caching | ~$9 | ~$3 |

### Shared Model Config (Both Platforms)

After the upgrade, both the landing page and CRM voice agent use the same model family:

| Platform | Chat Model | TTS Model | STT Model |
|----------|-----------|-----------|-----------|
| Landing Page | GPT-4.1-nano | gpt-4o-mini-tts | whisper-1 |
| CRM (fast-path) | GPT-4.1-nano | gpt-4o-mini-tts | whisper-1 |
| CRM (standard) | GPT-4.1-mini | gpt-4o-mini-tts | whisper-1 |
| CRM (reasoning) | o4-mini | gpt-4o-mini-tts | whisper-1 |

---

## Summary

This architecture uses **OpenAI end-to-end** — Whisper for ears, GPT-4.1-mini for brain, gpt-4o-mini-tts for voice. The "multi-agent" pattern is implemented through **GPT-4.1-mini's native function calling** rather than a separate agent framework. This means:

- **One API call** can invoke multiple CRM functions in parallel
- **No agent routing overhead** — GPT-4.1-mini decides what to call based on user intent
- **Zero new dependencies** — the `openai` package already handles everything
- **Already proven** — the STT, chat, and TTS pipeline runs in production today
- **84% cheaper** than the previous GPT-4o-based architecture
- **1M token context** — no aggressive context trimming needed
- **Three-tier routing** — nano (fast), mini (standard), o4-mini (reasoning) for optimal cost/quality

### Total Platform Cost Savings

| | Old Architecture | New Architecture | Annual Savings |
|-|-----------------|-----------------|----------------|
| Landing page (100/day) | ~$144/year | ~$60/year | **~$84/year** |
| CRM operator (50/day) | ~$132/year | ~$42/year | **~$90/year** |
| **Combined** | **~$276/year** | **~$102/year** | **~$174/year (63%)** |

The phased rollout delivers value incrementally: read-only voice queries in week 2, full voice-operated CRM by week 4, polished AI partner by week 6.
