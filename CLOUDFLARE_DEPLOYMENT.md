# Cloudflare Pages Deployment Guide

## 🌐 Deployment Platform: Cloudflare Pages

**Target Platform:** Cloudflare Pages
**Runtime:** Cloudflare Workers
**Framework:** Next.js 16 (App Router)

---

## ✅ Why Cloudflare Pages is Perfect for This Project

### Voice Agent Benefits
- ⚡ **Edge compute** - Low latency worldwide
- 🔒 **Built-in security** - DDoS protection, SSL
- 💰 **Cost-effective** - Generous free tier
- 🌍 **Global CDN** - Fast everywhere
- 🔧 **Serverless API routes** - Auto-scaling

### Available Services for Voice Agent

#### 1. **Cloudflare Workers** ✅ (Already using)
- Serverless functions for API routes
- `/api/voice-agent/*` runs on Workers
- Fast, auto-scaling
- **Current use:** All voice agent APIs

#### 2. **Cloudflare KV** ⭐ (For conversation memory)
- Key-value storage
- Perfect for session data
- Fast reads (low latency)
- **Use for:** Conversation history, user sessions

**Cost:**
- Free tier: 100,000 reads/day
- $0.50 per million reads
- $5.00 per million writes
- 1 GB storage free

#### 3. **Cloudflare Durable Objects** (Advanced)
- Stateful storage
- Real-time coordination
- **Use for:** Live conversation sessions, WebSocket support

#### 4. **Cloudflare D1** (Future)
- Serverless SQL database
- **Use for:** User data, analytics, conversation logs

#### 5. **Cloudflare R2** (Future)
- Object storage (like S3)
- **Use for:** Audio recordings (if needed), large files

---

## 🎯 Updated Conversation Memory Recommendation

### ⭐ **BEST OPTION: Cloudflare KV Sessions**

With Cloudflare Pages, we should use **Cloudflare KV** for conversation memory!

**Why KV is Perfect:**
- ✅ Already available (no extra setup)
- ✅ Fast edge storage
- ✅ Simple API
- ✅ Very low cost
- ✅ Auto-expiration (cleanup built-in)
- ✅ Global replication

**Implementation:**
```typescript
// Store conversation in KV
await env.VOICE_SESSIONS.put(
  `session:${sessionId}`,
  JSON.stringify(conversationHistory),
  { expirationTtl: 3600 } // Auto-expire after 1 hour
);

// Retrieve conversation
const history = await env.VOICE_SESSIONS.get(`session:${sessionId}`);
```

---

## 📋 Conversation Memory - Cloudflare Approach

### **Phase 1: Client-Side (NOW)** ⭐
**Implementation:** Store in component state
**Timeline:** 1-2 hours
**Cost:** Token usage only (~3x)

**Why Start Here:**
- No infrastructure changes
- Works immediately
- Test before adding KV
- Can deploy to Cloudflare today

### **Phase 2: Add Cloudflare KV (NEXT)** ⭐⭐⭐
**Implementation:** Session storage in KV
**Timeline:** 2-3 hours
**Cost:** Minimal (free tier covers most usage)

**Why This is Perfect:**
- ✅ Native to Cloudflare
- ✅ Survives page refresh
- ✅ Efficient (no redundant data)
- ✅ Auto-cleanup (TTL)
- ✅ Fast edge access

**Implementation Steps:**
1. Create KV namespace in Cloudflare dashboard
2. Bind to Workers in wrangler.toml
3. Update API routes to use KV
4. Generate session ID on frontend
5. Store/retrieve conversation from KV

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Cloudflare Pages                │
│  ┌───────────────────────────────────┐  │
│  │   Next.js Static Assets           │  │
│  │   - React components              │  │
│  │   - Voice Agent UI                │  │
│  └───────────────────────────────────┘  │
│                  ↓                       │
│  ┌───────────────────────────────────┐  │
│  │   Cloudflare Workers              │  │
│  │   - /api/voice-agent/transcribe   │  │
│  │   - /api/voice-agent/chat         │  │
│  │   - /api/voice-agent/speak        │  │
│  └───────────────────────────────────┘  │
│                  ↓                       │
│  ┌───────────────────────────────────┐  │
│  │   Cloudflare KV                   │  │
│  │   - Conversation sessions         │  │
│  │   - User preferences              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         External APIs                   │
│   - OpenAI (Whisper, GPT, TTS)         │
└─────────────────────────────────────────┘
```

---

## 🔧 Setup: Cloudflare KV for Sessions

### 1. Create KV Namespace

**In Cloudflare Dashboard:**
```
Workers & Pages > KV > Create namespace
Name: voice-agent-sessions
```

**Or via Wrangler CLI:**
```bash
npx wrangler kv:namespace create "VOICE_SESSIONS"
```

### 2. Update Configuration

**Create/Update `wrangler.toml`:**
```toml
name = "ai-smb-partners"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "VOICE_SESSIONS"
id = "your_kv_namespace_id"
preview_id = "your_preview_kv_namespace_id"

[env.production]
vars = { }

[env.production.kv_namespaces]
binding = "VOICE_SESSIONS"
id = "your_production_kv_namespace_id"
```

### 3. Update API Route

**Type definition (`env.d.ts`):**
```typescript
interface Env {
  VOICE_SESSIONS: KVNamespace;
  OPENAI_API_KEY: string;
}
```

**API route (`app/api/voice-agent/chat/route.ts`):**
```typescript
export const runtime = 'edge'; // Important for Cloudflare Workers

export async function POST(request: NextRequest) {
  const env = process.env as unknown as Env;

  const { question, sessionId } = await request.json();

  // Retrieve conversation from KV
  const historyJson = await env.VOICE_SESSIONS.get(`session:${sessionId}`);
  const conversationHistory = historyJson ? JSON.parse(historyJson) : [];

  // Build messages with history
  const messages = [
    { role: 'system', content: KNOWLEDGE_BASE },
    ...conversationHistory,
    { role: 'user', content: question }
  ];

  // Get response from OpenAI
  const response = await openai.chat.completions.create({ messages });

  // Update conversation history
  const updatedHistory = [
    ...conversationHistory,
    { role: 'user', content: question },
    { role: 'assistant', content: response }
  ];

  // Store in KV with 1 hour expiration
  await env.VOICE_SESSIONS.put(
    `session:${sessionId}`,
    JSON.stringify(updatedHistory),
    { expirationTtl: 3600 }
  );

  return NextResponse.json({ response });
}
```

### 4. Frontend Changes

**Generate session ID:**
```typescript
const [sessionId] = useState(() => {
  // Generate or retrieve session ID
  const existing = sessionStorage.getItem('voice_session_id');
  if (existing) return existing;

  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('voice_session_id', newId);
  return newId;
});

// Send with requests
fetch('/api/voice-agent/chat', {
  method: 'POST',
  body: JSON.stringify({
    question: text,
    sessionId: sessionId
  })
});
```

---

## 💰 Cost Analysis - Cloudflare KV

### Free Tier (Generous!)
- 100,000 reads/day
- 1,000 writes/day
- 1 GB storage

### Paid (if needed)
- $0.50 per million reads
- $5.00 per million writes
- $0.50 per GB storage

### Voice Agent Usage
**Per conversation:**
- 1 write per question/answer pair
- 1 read per follow-up question
- ~5-10 KB per conversation

**Daily estimates (100 conversations/day):**
- Reads: ~300 (well within free tier)
- Writes: ~300 (well within free tier)
- Storage: ~3 MB (tiny)

**Monthly cost:** $0 (free tier covers it!) ✅

---

## 🔒 Security Considerations

### Environment Variables
**Set in Cloudflare Pages:**
```
Settings > Environment Variables

Production:
- OPENAI_API_KEY=sk-...
- VOICE_AGENT_ENABLED=true
- VOICE_CACHE_ENABLED=true

Preview:
- OPENAI_API_KEY=sk-...
- (same values)
```

### Session Security
```typescript
// Generate secure session ID
import { randomUUID } from 'crypto';
const sessionId = randomUUID();

// Validate session ID format
if (!/^[a-f0-9-]{36}$/i.test(sessionId)) {
  throw new Error('Invalid session ID');
}

// Add rate limiting per session
const sessionKey = `rate:${sessionId}`;
const requests = await env.VOICE_SESSIONS.get(sessionKey);
if (parseInt(requests || '0') > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## 📦 Deployment Steps

### 1. **Initial Setup**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "VOICE_SESSIONS"
```

### 2. **Configure Project**
```bash
# Update wrangler.toml with KV binding
# Add environment variables in Cloudflare dashboard
```

### 3. **Deploy**
```bash
# Build project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next/standalone

# Or connect GitHub for auto-deploy
# (Recommended - push to main = auto deploy)
```

### 4. **Verify**
```bash
# Test voice agent
# Check KV in dashboard: Workers & Pages > KV > VOICE_SESSIONS
# Monitor logs: Workers & Pages > Logs
```

---

## 🎯 Implementation Roadmap

### **Today: Deploy Basic Version**
- [x] Voice agent working locally
- [x] All APIs functional
- [ ] Deploy to Cloudflare Pages
- [ ] Test on production

### **Phase 1: Add Client-Side Memory (1-2 hours)**
- [ ] Implement conversation history in component state
- [ ] Test multi-turn conversations
- [ ] Deploy to Cloudflare
- [ ] Monitor token usage

### **Phase 2: Add KV Sessions (2-3 hours)**
- [ ] Create KV namespace
- [ ] Update API routes to use KV
- [ ] Add session ID generation
- [ ] Test session persistence
- [ ] Deploy to Cloudflare

### **Phase 3: Optimize & Monitor**
- [ ] Add conversation length limits
- [ ] Implement cleanup strategy
- [ ] Add analytics
- [ ] Monitor costs

---

## 🔍 Monitoring & Analytics

### Cloudflare Analytics
**Available in Dashboard:**
- Request volume
- Response times
- Error rates
- Geographic distribution
- Cache hit rates

### Voice Agent Metrics
**Track:**
- Sessions per day
- Questions per session
- Average conversation length
- Token usage per session
- Popular questions

### Cost Monitoring
**Watch:**
- OpenAI API costs (main cost)
- KV read/write operations (minimal)
- Worker compute time (minimal)
- Bandwidth (minimal)

**Expected monthly costs:**
- OpenAI: $10-50 (depends on usage)
- Cloudflare: $0 (free tier sufficient)
- **Total:** $10-50/month

---

## 🚀 Next Steps

### **Option A: Deploy Now (As-Is)**
Current voice agent works great without conversation memory.

**Commands:**
```bash
# Build
npm run build

# Deploy to Cloudflare Pages
# (Connect GitHub or use Wrangler)
```

### **Option B: Add Memory First, Then Deploy**
Implement client-side conversation history, then deploy.

**Timeline:** +1.5 hours before deployment

### **Option C: Deploy Now + Add KV Later**
Deploy current version, add KV sessions in Phase 2.

**Recommended!** ⭐
- Get to production faster
- Test real usage
- Add memory based on user feedback

---

## 📝 Cloudflare Pages Configuration

### **Build Settings**
```yaml
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 18

Environment variables:
- OPENAI_API_KEY: (your key)
- VOICE_AGENT_ENABLED: true
- VOICE_CACHE_ENABLED: true
```

### **Functions Configuration**
Next.js API routes automatically become Cloudflare Workers when deployed to Pages!

**No extra configuration needed!** ✅

---

## ✅ Summary

**Cloudflare Pages is perfect for this project:**
- ✅ Next.js 16 fully supported
- ✅ Voice agent APIs work as Cloudflare Workers
- ✅ KV available for conversation memory
- ✅ Cost-effective (mostly free tier)
- ✅ Global, fast, secure

**Recommended path:**
1. Deploy current version to Cloudflare Pages (today)
2. Add client-side conversation memory (Phase 1)
3. Add Cloudflare KV sessions (Phase 2)
4. Monitor and optimize (ongoing)

**Ready to deploy or implement memory first?** 🚀
