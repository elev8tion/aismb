# Voice Agent FAB - Implementation Plan

## Project: AI SMB Partners Voice Assistant with Animated Logo

**Goal:** Create a floating action button (FAB) with LiquidMorphLogo that acts as a voice agent to answer business questions using OpenAI APIs.

---

## 🎯 Requirements

### Functional
- ✅ FAB with animated logo (LiquidMorphLogo from kc_pf)
- ✅ Voice-only interaction (no text chat UI)
- ✅ Answer questions about AI SMB Partners services
- ✅ Use OpenAI API keys (user will supply)
- ✅ Optimize for cost-effectiveness
- ✅ Voice caching for common questions
- ✅ Stays on ai-smb-partners site only

### Technical Constraints
- Next.js 16 with App Router
- TypeScript + React 19
- Framer Motion (already in kc_pf)
- OpenAI API integration
- Browser-based deployment

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Voice Agent FAB                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LiquidMorphLogo (Animated)                     │   │
│  │  + Click Handler + Voice States                 │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Voice Processing Pipeline                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. Speech Input (User speaks)                   │  │
│  │     ↓ OpenAI Whisper API                         │  │
│  │  2. Text Transcription                           │  │
│  │     ↓ Check Voice Cache                          │  │
│  │  3. Question Matching                            │  │
│  │     ├─ Cache Hit → Play MP3                      │  │
│  │     └─ Cache Miss → OpenAI API                   │  │
│  │  4. Generate Response                            │  │
│  │     ↓ OpenAI TTS API                             │  │
│  │  5. Speak Response                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Components & Files Structure

```
ai-smb-partners/
├── components/
│   ├── VoiceAgentFAB/
│   │   ├── index.tsx                    # Main FAB component
│   │   ├── VoiceInterface.tsx           # Voice interaction UI
│   │   ├── AnimatedLogo.tsx             # LiquidMorphLogo wrapper
│   │   └── styles.module.css            # FAB-specific styles
│   │
├── lib/
│   ├── openai/
│   │   ├── whisper.ts                   # Speech-to-text
│   │   ├── chat.ts                      # GPT response generation
│   │   ├── tts.ts                       # Text-to-speech
│   │   └── config.ts                    # API configuration
│   │
│   ├── voiceAgent/
│   │   ├── knowledgeBase.ts             # Structured business info
│   │   ├── voiceCache.ts                # Cache matching logic
│   │   ├── questionMatcher.ts           # Fuzzy matching
│   │   └── responseGenerator.ts         # Format responses for voice
│   │
├── app/
│   └── api/
│       └── voice-agent/
│           ├── transcribe/route.ts      # Whisper endpoint
│           ├── chat/route.ts            # GPT endpoint
│           └── speak/route.ts           # TTS endpoint
│
├── public/
│   └── voice-cache/
│       ├── pricing.mp3                  # Pre-generated responses
│       ├── how-it-works.mp3
│       ├── roi.mp3
│       └── ... (20 total)
│
└── docs/
    └── VOICE_AGENT_IMPLEMENTATION_PLAN.md  # This file
```

---

## 🎙️ Voice Caching Strategy

### Top 20 Common Questions (Pre-cached)

**Category: Pricing (5 questions)**
1. "What are your pricing options?"
2. "How much does it cost?"
3. "What's included in each tier?"
4. "Do you have a starter package?"
5. "Is there a free trial?"

**Category: Process (5 questions)**
6. "How does your partnership work?"
7. "What's the timeline?"
8. "How long until I see results?"
9. "Will I be independent after?"
10. "What happens during onboarding?"

**Category: ROI/Results (4 questions)**
11. "What ROI can I expect?"
12. "How much time will I save?"
13. "Do you have case studies?"
14. "What results do other businesses see?"

**Category: Capabilities (3 questions)**
15. "What can AI systems do?"
16. "Can you help with my specific business?"
17. "Do you work with my industry?"

**Category: Getting Started (3 questions)**
18. "Do I need technical skills?"
19. "How do I get started?"
20. "What if I have questions?"

### Cache Matching Logic
- Use fuzzy string matching (Levenshtein distance)
- Match threshold: 80% similarity
- Fallback to OpenAI API if no match

---

## 🔑 OpenAI API Integration

### APIs to Use (Research Agent will provide specifics)

**1. Whisper API (Speech-to-Text)**
- Endpoint: `/v1/audio/transcriptions`
- Model: `whisper-1`
- Input: Audio file (webm, mp3, wav)
- Cost: TBD (Research Agent)

**2. Chat Completions API (Response Generation)**
- Endpoint: `/v1/chat/completions`
- Model: TBD (Research Agent - GPT-4o-mini vs GPT-3.5)
- Input: User question + knowledge base
- Cost: TBD (Research Agent)

**3. TTS API (Text-to-Speech)**
- Endpoint: `/v1/audio/speech`
- Model: `tts-1` or `tts-1-hd`
- Voice: TBD (Research Agent - alloy, echo, fable, onyx, nova, shimmer)
- Cost: TBD (Research Agent)

---

## 💰 Cost Optimization Strategy

### Tier 1: Cached Responses (FREE)
- 20 pre-generated responses
- Estimated coverage: 80-90% of questions
- One-time generation cost only

### Tier 2: Real-time Generation (Pay-per-use)
- Whisper: $0.006 per minute (estimated)
- GPT: ~$0.002 per question (estimated)
- TTS: ~$0.015 per 1000 chars (estimated)
- **Total per unique question: ~$0.02-$0.05**

### Expected Monthly Cost
- Assuming 100 voice interactions/month
- 85% cache hit rate
- 15 unique questions × $0.03 = **~$0.45/month**
- Very affordable! 🎉

---

## 🎨 User Experience Flow

### 1. Idle State
```
User sees: Small pulsing logo FAB (bottom-right corner)
```

### 2. Click to Activate
```
User clicks: Logo expands with liquid animation
Shows: "Listening..." with audio waveform
Starts: Whisper API recording
```

### 3. User Speaks
```
User says: "What are your pricing options?"
Visual: Animated waveform during speech
Audio: Records and sends to Whisper API
```

### 4. Processing
```
Transcription: Whisper converts speech to text
Matching: Check voice cache for similar question
Cache Hit: Load pricing.mp3
  OR
Cache Miss: Send to GPT + generate with TTS
```

### 5. Response
```
Logo animation: Morphs to "speaking" state
Audio plays: Pre-cached MP3 or generated response
Visual: Speaking indicator animation
```

### 6. Follow-up
```
After response: Returns to listening state
User can: Ask another question or close FAB
Timeout: Auto-close after 30 seconds of silence
```

---

## 🛠️ Implementation Phases

### Phase 1: Setup & Logo Integration (30 minutes)
**Tasks:**
- [ ] Copy LiquidMorphLogo component to ai-smb-partners
- [ ] Install dependencies (framer-motion if needed)
- [ ] Create VoiceAgentFAB basic structure
- [ ] Test logo animation in FAB

**Deliverable:** Clickable FAB with animated logo

---

### Phase 2: Knowledge Base Creation (45 minutes)
**Tasks:**
- [ ] Extract content from all page sections
- [ ] Structure as JSON knowledge base
- [ ] Create 20 Q&A pairs for caching
- [ ] Format responses for voice (concise, natural)

**Deliverable:** `/lib/voiceAgent/knowledgeBase.ts`

---

### Phase 3: OpenAI Integration (Research + Implementation)
**Tasks:**
- [ ] **Research Agent:** Analyze OpenAI API options (IN PROGRESS)
- [ ] Set up OpenAI client configuration
- [ ] Create Whisper API endpoint
- [ ] Create GPT Chat endpoint
- [ ] Create TTS API endpoint
- [ ] Test end-to-end pipeline

**Deliverable:** Working voice pipeline (no caching yet)

---

### Phase 4: Voice Caching System (1 hour)
**Tasks:**
- [ ] Generate 20 cached MP3 responses using OpenAI TTS
- [ ] Implement fuzzy question matching
- [ ] Create cache fallback logic
- [ ] Test cache hit/miss scenarios

**Deliverable:** `/public/voice-cache/` + matching logic

---

### Phase 5: UI/UX Polish (45 minutes)
**Tasks:**
- [ ] Add listening waveform animation
- [ ] Add speaking indicator
- [ ] Add error handling (API failures, no mic permission)
- [ ] Add loading states
- [ ] Mobile responsiveness testing

**Deliverable:** Production-ready FAB

---

### Phase 6: Testing & Optimization (30 minutes)
**Tasks:**
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices
- [ ] Verify cache hit rates
- [ ] Check API costs per interaction
- [ ] Security audit (API key protection)

**Deliverable:** Tested, optimized voice agent

---

## 🔒 Security Considerations

### API Key Protection
- ✅ Store OpenAI API key in `.env.local`
- ✅ Never expose in client-side code
- ✅ All API calls through Next.js API routes
- ✅ Add rate limiting to prevent abuse

### User Privacy
- ✅ Audio not stored on server (processed and discarded)
- ✅ No conversation logging (optional: anonymous analytics)
- ✅ Clear privacy notice in UI

---

## 📊 Success Metrics

### Performance
- Response time: < 3 seconds (transcribe + respond)
- Cache hit rate: > 80%
- API success rate: > 99%

### Cost
- Target: < $1/month for 100 interactions
- Monitor: Cost per question

### User Experience
- Time to first interaction: < 1 second (click → listening)
- Audio quality: Clear, natural voice
- Error rate: < 1%

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] OpenAI API key added to Netlify
- [ ] Voice cache files uploaded
- [ ] API routes secured with rate limiting
- [ ] Mobile microphone permissions tested
- [ ] HTTPS enabled (required for microphone access)
- [ ] Browser compatibility verified

---

## 📝 Next Steps

1. ✅ **Research Agent:** Investigate OpenAI APIs (IN PROGRESS)
   - Best models for each task
   - Exact pricing
   - Rate limits
   - Best practices

2. ⏳ **Phase 1:** Copy logo and create FAB structure

3. ⏳ **Phase 2:** Build knowledge base

4. ⏳ **Phase 3-6:** Implement based on research findings

---

## 🤝 Collaboration Points

**User will provide:**
- OpenAI API key (when ready to integrate)
- Feedback on voice quality/responses
- Testing on your devices

**Agent will deliver:**
- Complete implementation
- Documentation
- Cost reports
- Testing results

---

## 📚 References & Resources

- OpenAI API Docs: https://platform.openai.com/docs
- Whisper API: https://platform.openai.com/docs/guides/speech-to-text
- TTS API: https://platform.openai.com/docs/guides/text-to-speech
- Chat Completions: https://platform.openai.com/docs/guides/chat-completions
- Web Speech API (fallback): https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

**Status:** ✅ Plan Complete | 🔬 Research in Progress
**Estimated Total Time:** 4-5 hours implementation
**Estimated Cost:** < $1/month for typical usage

---

*Last Updated: February 3, 2026*
