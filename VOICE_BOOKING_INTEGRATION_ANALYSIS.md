# Voice Agent Booking Integration Analysis

## Current Architecture

### 🎙️ Voice Agent System (Frontend → Backend)

#### Frontend: `components/VoiceAgentFAB/index.tsx`
- Floating action button (FAB) with voice modal interface
- Records audio → transcribes → sends to `/api/voice-agent/chat`
- Displays conversation history (transcript + AI response)
- Text-to-speech playback with iOS compatibility
- **Session Management**: Uses `sessionId` for conversation continuity

#### Backend: `/api/voice-agent/chat/route.ts` ❌ **NOT USING SPECIALIZED AGENTS**
```typescript
// Current implementation:
1. Receives question + sessionId + language
2. Uses simple OpenAI chat completion with KNOWLEDGE_BASE
3. Stores conversation in KV storage
4. Returns text response → converted to speech

// Problem: Does NOT route to specialized agents!
```

### 🤖 Specialized Agent System (EXISTS BUT NOT USED)

#### Intent Router: `lib/voiceAgent/intentRouter.ts`
- **Deterministic** keyword-based classification (no LLM call)
- Routes to: `'booking'` | `'roi'` | `'info'` | `'management'`
- Detects booking continuations (when agent asks for user details)

#### Booking Agent: `lib/voiceAgent/agents/bookingAgent.ts`
- Full tool-calling implementation with OpenAI function calls
- **Tools available**:
  - `get_available_dates` - Fetches next 30 days of availability
  - `get_available_slots` - Gets time slots for a specific date
  - `create_consultation_booking` - Books free 30-min call
  - `create_assessment_checkout` - Creates $250 Stripe checkout + emails link
  - `respond_to_user` - Asks for user details (escape valve)
- **Strategy**: First call forces availability check with `tool_choice: 'required'`
- **Shared Pipeline**: Calls `runBookingPipeline()` (same as manual UI)

#### ROI Agent: `lib/voiceAgent/agents/roiAgent.ts`
- Calculates ROI with `calculate_roi` tool

#### Info Agent: `lib/voiceAgent/agents/infoAgent.ts`
- General Q&A with knowledge base

### 📅 Manual Booking System (UI-Based)

#### Frontend: `components/Booking/BookingModal.tsx`
- 4-step wizard:
  1. Select booking type (consultation/assessment)
  2. Pick date
  3. Pick time slot
  4. Enter contact info + business details
- Calls `/api/booking/availability` and `/api/booking/create`

#### Backend: `/api/booking/create/route.ts`
- Validates booking request
- Checks slot availability (prevents race conditions)
- Creates booking in NCB database
- Calls `runBookingPipeline()` from `lib/booking/createBooking.ts`

#### Shared Pipeline: `lib/booking/createBooking.ts` → `runBookingPipeline()`
- Creates calendar event links (Google, Outlook, ICS)
- Sends confirmation emails (EmailIt API)
- Syncs to CRM (leads table)
- Sends admin dossier email
- **Used by both**:
  - ✅ Manual UI booking (`/api/booking/create`)
  - ✅ Voice agent tools (`handleCreateConsultation` in `tools.ts`)

---

## 🔗 Integration Points

### What's Already Integrated ✅
1. **Voice booking tools** (`lib/voiceAgent/tools.ts`) use the same:
   - Availability logic (`lib/booking/availability.ts`)
   - NCB database (`bookings`, `availability_settings`, `blocked_dates`)
   - `runBookingPipeline()` for confirmations/emails/CRM sync
2. **Shared validation** and slot conflict detection
3. **Stripe checkout** for assessments (voice agent creates checkout session)

### What's Missing ❌
1. **The `/api/voice-agent/chat` route doesn't use the specialized agents!**
   - Intent router is defined but not called
   - Booking agent is defined but not invoked
   - Voice chat just uses basic OpenAI completion with knowledge base
2. **No routing logic** in the chat endpoint to delegate to agents
3. **No tool execution** happening in the voice flow

---

## 📋 Implementation Plan

### Step 1: Integrate Intent Router into Voice Chat ✅
**File**: `app/api/voice-agent/chat/route.ts`

```typescript
import { classifyIntent } from '@/lib/voiceAgent/intentRouter';
import { runBookingAgent, runROIAgent, runInfoAgent } from '@/lib/voiceAgent/agents';

// In POST handler:
const conversationHistory = await sessionStorage.getConversationHistory(sessionId);
const intentResult = classifyIntent(sanitizedQuestion, conversationHistory);

console.log(`🎯 Intent: ${intentResult.intent} (confidence: ${intentResult.confidence})`);

let response: string;
const toolCtx = { env: env as Record<string, string> };

switch (intentResult.intent) {
  case 'booking':
    response = await runBookingAgent(openai, sanitizedQuestion, conversationHistory, toolCtx, {
      language,
      isContinuation: intentResult.isContinuation,
    });
    break;

  case 'roi':
    response = await runROIAgent(openai, sanitizedQuestion, conversationHistory, toolCtx, { language });
    break;

  case 'info':
  default:
    response = await runInfoAgent(openai, sanitizedQuestion, conversationHistory, toolCtx, { language });
    break;
}
```

### Step 2: Testing Strategy 🧪

#### Test Scenarios:
1. **Basic Booking Flow**:
   ```
   User: "I'd like to schedule a consultation"
   → Intent: booking
   → Agent calls get_available_dates
   → Agent shows dates, asks user to pick one
   User: "February 15th"
   → Agent calls get_available_slots for 2026-02-15
   → Agent shows time slots
   User: "3pm works"
   → Agent asks for name, email, company, industry
   User: "John Doe, john@example.com, Acme Corp, retail"
   → Agent calls create_consultation_booking
   → Booking created, confirmation email sent
   ```

2. **Assessment Booking** (with $250 payment):
   ```
   User: "I want to skip the call and book an assessment"
   → Agent explains $250 charge
   → Collects details
   → Calls create_assessment_checkout
   → Stripe checkout link emailed to user
   ```

3. **ROI Questions**:
   ```
   User: "How much could I save with 15 employees?"
   → Intent: roi
   → Agent asks for task hours, revenue details
   → Calls calculate_roi
   → Returns ROI percentage, payback weeks, annual savings
   ```

4. **General Info**:
   ```
   User: "What's included in the Foundation tier?"
   → Intent: info
   → Agent uses knowledge base to explain
   ```

### Step 3: Edge Cases to Handle 🛡️
1. **Ambiguous Intent**: "Tell me about booking"
   - Currently routes to `info` (because "what is" keywords override weak booking signals)
   - Should explain booking process, not immediately check availability
2. **Booking Continuation Detection**:
   - If last assistant message asked "What's your email?", route to booking agent
   - Prevents re-classifying user's email as info query
3. **Slot Conflicts**:
   - Voice agent already checks availability before creating booking
   - Returns error: "That time slot is no longer available. Please pick another."
4. **Spanish Language**:
   - All agents support `language: 'es'` option
   - Intent router has Spanish keywords (`agendar`, `reservar`, `cita`, etc.)

---

## 🔧 Implementation Files

### Files to Modify:
1. ✏️ `app/api/voice-agent/chat/route.ts` - Add intent routing and agent delegation
2. ✏️ (Optional) Add test script to verify booking flow

### Files Already Ready:
- ✅ `lib/voiceAgent/intentRouter.ts` - Intent classification
- ✅ `lib/voiceAgent/agents/bookingAgent.ts` - Booking logic
- ✅ `lib/voiceAgent/agents/roiAgent.ts` - ROI calculations
- ✅ `lib/voiceAgent/agents/infoAgent.ts` - General Q&A
- ✅ `lib/voiceAgent/tools.ts` - Tool definitions and execution
- ✅ `lib/booking/createBooking.ts` - Shared booking pipeline

---

## 🎯 Expected Result

After integration:
1. User says: **"I want to book a meeting"**
   - Voice agent → Intent router → Booking agent
   - Agent calls `get_available_dates` tool
   - Returns: "I have availability on Feb 13, 14, 15... Which date works best?"

2. User says: **"February 14th at 2pm"**
   - Agent calls `get_available_slots` to confirm 2pm is open
   - Agent asks: "Great! What's your name and email?"

3. User provides details
   - Agent calls `create_consultation_booking`
   - Booking created in NCB database
   - Confirmation email sent via EmailIt
   - CRM lead synced
   - Admin dossier email sent
   - Agent responds: "✅ Your consultation is booked for Feb 14 at 2pm! Confirmation sent to your email."

---

## 📊 Benefits of This Approach

1. **Single Source of Truth**: Both voice and UI use same:
   - Availability logic
   - Booking creation pipeline
   - Email templates
   - CRM sync

2. **No Code Duplication**: `runBookingPipeline()` is shared

3. **Deterministic Routing**: Intent classification has zero latency (no LLM call)

4. **Tool-Based Architecture**: Booking agent uses OpenAI function calling for structured operations

5. **Conversation Context**: SessionId tracks multi-turn booking flows

---

## 🚀 Next Steps

1. **Implement Intent Routing** in `/api/voice-agent/chat/route.ts`
2. **Test Booking Flow** with voice agent
3. **Verify Email Delivery** (EmailIt API)
4. **Test Spanish Language** booking flow
5. **Monitor CRM Sync** to ensure leads are created
6. **Add Analytics** for voice booking completion rate

---

## 🔍 Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Voice Agent UI | ✅ Complete | FAB with recording, playback, session management |
| Intent Router | ✅ Complete | Keyword-based classification |
| Booking Agent | ✅ Complete | Tool-calling with availability checks |
| Booking Tools | ✅ Complete | 4 booking tools + respond_to_user |
| Booking Pipeline | ✅ Complete | Shared between voice + UI |
| Voice Chat API | ❌ Missing | Needs intent routing integration |
| End-to-End Testing | ⏳ Pending | After chat API integration |

**Action Required**: Wire up the intent router and agents in `/api/voice-agent/chat/route.ts` to enable voice-based booking.
