# OpenAI API Research for Voice Agent Implementation
## Cost-Optimized Voice Assistant for Small Business Website

**Research Date:** February 3, 2026
**Target Use Case:** Voice assistant FAB for small business website
**Expected Usage:** 100-200 interactions/month with 80% cache hit rate
**Budget Goal:** $1-2/month

---

## Executive Summary

For a small business voice assistant with 100-200 interactions/month and 80% caching, the **recommended configuration** will cost approximately **$0.50-$1.50/month**:

- **Speech-to-Text:** GPT-4o-mini-transcribe ($0.003/minute)
- **Text Generation:** GPT-4o-mini ($0.15 input/$0.60 output per 1M tokens)
- **Text-to-Speech:** TTS-1 standard ($15 per 1M characters)

This configuration stays well within the $1-2/month budget while providing excellent quality for business applications.

---

## 1. Speech-to-Text (Whisper/Transcription API)

### Available Models & Pricing (2026)

| Model | Cost per Minute | Best For | Notes |
|-------|----------------|----------|-------|
| **GPT-4o-mini-transcribe** | **$0.003** | **Cost-sensitive apps** | **RECOMMENDED** - 50% cheaper |
| GPT-4o-transcribe | $0.006 | Advanced accuracy | Standard pricing |
| GPT-4o-transcribe-diarize | $0.006 | Speaker identification | Same price, adds diarization |
| Whisper-1 (legacy) | $0.006 | Legacy support | Being phased out |

### Audio Format Requirements
- **Supported formats:** MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM
- **Maximum file size:** 25 MB
- **Optimal format:** MP3 or WAV for best compatibility

### Cost Optimization Best Practices

1. **Use GPT-4o-mini-transcribe** - 50% cheaper at $0.003/minute
2. **Trim silence** - Don't upload silent audio segments
3. **Use Voice Activity Detection (VAD)** - Only process when user is speaking
4. **Compress audio** - Use MP3 with moderate bitrate (64-128 kbps sufficient for voice)
5. **Batch processing** - If real-time isn't required, batch requests

### Rate Limits & Quotas
- Automatically adjusted based on usage tier
- New accounts start at Tier 1
- Limits increase automatically as you pay invoices
- Use exponential backoff for 429 errors

### Example Cost Calculation
- Average user question: 10 seconds (0.167 minutes)
- 200 interactions/month × 0.167 min × $0.003 = **$0.10/month**
- With 80% cache hit rate (40 API calls): **$0.02/month**

---

## 2. Chat Completions API (Text Generation)

### Model Comparison (2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Context Window | Best For |
|-------|----------------------|------------------------|----------------|----------|
| **GPT-4o-mini** | **$0.15** | **$0.60** | 128K | **RECOMMENDED** - Simple Q&A |
| GPT-4o | $2.50 | $10.00 | 128K | Complex reasoning |
| GPT-3.5-turbo | Deprecated | Deprecated | N/A | Replaced by GPT-4o-mini |

### Key Findings

**GPT-3.5-turbo Status:** DEPRECATED as of 2026. GPT-4o-mini is the replacement and is actually **60% cheaper** than GPT-3.5-turbo was.

**GPT-4o-mini is the clear winner** for simple business Q&A:
- 60% cheaper than GPT-3.5-turbo
- Better performance
- More capable than previous models
- 99% cost reduction since text-davinci-003 (2022)

### Token Usage Optimization

1. **Prompt Caching** - Can reduce input costs by up to **90%**
   - Automatically enabled for prompts >1,024 tokens
   - 50% discount on cached tokens
   - Cache TTL: 5-10 minutes (up to 1 hour)
   - Structure prompts with static content first, variable content last

2. **Minimize Token Usage**
   - Use concise system prompts
   - Limit context to relevant information only
   - Set `max_tokens` to actual needs (don't over-provision)
   - Use retrieval instead of large context windows

3. **Semantic Caching** - For repetitive questions
   - Cache common FAQ responses locally
   - 30-70% additional cost reduction
   - Perfect for business assistant with limited FAQ scope

### Example Cost Calculation (per interaction)

**Typical business Q&A:**
- System prompt: 200 tokens (cached)
- User question: 50 tokens
- Assistant response: 150 tokens
- Total: 100 input + 150 output (with caching)

**Cost per interaction:**
- Input: 100 tokens × $0.15/1M = $0.000015
- Output: 150 tokens × $0.60/1M = $0.000090
- **Total: $0.000105 per interaction**

**Monthly cost (200 interactions):**
- 200 × $0.000105 = **$0.021/month**
- With 80% cache hit rate (40 API calls): **$0.004/month**

---

## 3. Text-to-Speech (TTS API)

### Available Models & Pricing (2026)

| Model | Pricing Model | Cost | Quality | Latency | Best For |
|-------|--------------|------|---------|---------|----------|
| **TTS-1** | **Character-based** | **$15/1M chars** | **Good** | **Low** | **RECOMMENDED** |
| TTS-1-HD | Character-based | $30/1M chars | Excellent | Medium | Premium quality |
| GPT-4o-mini-tts | Token-based | $0.60 input + $12 audio output per 1M tokens (~$0.015/min) | Good | Low | Multimodal integration |

### Voice Options

All voices cost the same. Available voices include:
- **Alloy** - Neutral and balanced
- **Echo** - Clear and professional (**RECOMMENDED for business**)
- **Fable** - Warm and expressive
- **Onyx** - Deep and authoritative (alternative professional choice)
- **Nova** - Energetic and friendly
- **Shimmer** - Soft and conversational
- **Marin, Cedar** - Newest voices (best quality, only available with GPT-4o-mini-tts)

### Recommended Voice for Professional Business Assistant

**Primary Recommendation:** **Echo** - Clear, professional, and trustworthy
**Alternative:** **Onyx** - Deeper, authoritative tone

### Quality vs Cost Trade-offs

**TTS-1 (Standard)** - RECOMMENDED
- $15 per 1M characters
- Excellent quality for business applications
- Lower latency (faster response)
- 50% cheaper than TTS-1-HD
- **Cost-to-quality ratio is optimal**

**TTS-1-HD** - NOT RECOMMENDED for budget use
- 2× the cost
- Marginal quality improvement
- Only worth it for premium applications
- Higher latency

**GPT-4o-mini-tts** - Consider for advanced features
- Token-based pricing
- Similar cost to TTS-1
- Access to newest voices (marin, cedar)
- Can add custom instructions for tone
- Better for multimodal workflows

### Example Cost Calculation

**Average response: 100 characters (approximately 20 words)**

- 200 interactions/month × 100 chars = 20,000 characters
- 20,000 chars × $15/1M = **$0.30/month**
- With 80% cache hit rate (40 API calls): **$0.06/month**

---

## 4. Total Cost Analysis

### Cost Per Interaction Breakdown

| Component | Cost per Interaction | Notes |
|-----------|---------------------|-------|
| Speech-to-Text (10 sec) | $0.0005 | GPT-4o-mini-transcribe |
| Text Generation | $0.000105 | GPT-4o-mini with caching |
| Text-to-Speech (100 chars) | $0.0015 | TTS-1 standard |
| **Total per interaction** | **$0.002105** | **~$0.002** |

### Monthly Cost Projections

**Scenario 1: 100 interactions/month, 80% cached**
- 20 API calls × $0.002105 = **$0.042/month**

**Scenario 2: 200 interactions/month, 80% cached**
- 40 API calls × $0.002105 = **$0.084/month**

**Scenario 3: 200 interactions/month, NO caching**
- 200 × $0.002105 = **$0.421/month**

### Conclusion
**All scenarios are well within the $1-2/month budget.** Even without caching, costs remain under $0.50/month.

---

## 5. Cost Optimization Strategies

### Prompt Caching (Highest Impact)

**Automatic Caching:**
- Enabled automatically for prompts >1,024 tokens
- 50% discount on cached input tokens
- Cache TTL: 5-10 minutes (up to 1 hour for GPT-4.1)
- **90% input cost reduction** for cached prefixes

**Best Practices:**
1. Structure prompts with static content FIRST
   ```
   [System instructions - STATIC - gets cached]
   [Business information - STATIC - gets cached]
   [User question - VARIABLE - not cached]
   ```

2. Keep system prompts consistent
3. Use same context structure across requests
4. Cache activates at 1,024 tokens minimum

**Impact:** Can reduce overall GPT costs by 40-90%

### Semantic Caching (Application Level)

**Implementation:**
1. Hash or embed user questions
2. Check for semantically similar previous questions
3. Return cached responses for matches
4. Only call API for novel questions

**Impact:** 30-70% additional cost reduction

**Perfect for business FAQ where:**
- Limited question variety
- Many repeated questions
- Answers don't change frequently

### Rate Limiting Best Practices

1. **Exponential Backoff** - Retry with increasing delays on 429 errors
2. **Batch Requests** - Combine multiple tasks in single requests
3. **Optimize Token Usage** - Set `max_tokens` precisely, not too high
4. **Eliminate Silence** - Use VAD to avoid processing empty audio
5. **Trim Audio Output** - Keep TTS responses concise

### Prompt Engineering

1. **Be concise** - Shorter prompts = lower costs
2. **Use retrieval** - Don't ship 50K tokens every turn
3. **Summarize context** - Compress conversation history
4. **Set token limits** - Use intelligent truncation

---

## 6. Alternative & Cost Comparison

### Cheaper Alternatives to Consider

#### Speech-to-Text Alternatives

| Provider | Model | Cost | Notes |
|----------|-------|------|-------|
| **OpenAI** | GPT-4o-mini-transcribe | **$0.003/min** | **CHEAPEST & RECOMMENDED** |
| AssemblyAI | Universal-2 | $0.0025/min ($0.15/hour) | Slightly cheaper, excellent quality |
| Deepgram | Nova-3 | $0.0043/min | Fast, low latency |
| Mistral | Voxtral | <$0.003/min | Open source, less than half of OpenAI |

**Verdict:** OpenAI GPT-4o-mini-transcribe is competitive and simplifies vendor management.

#### Text-to-Speech Alternatives

| Provider | Model | Cost | Notes |
|----------|-------|------|-------|
| **Inworld** | TTS-1.5-Max | **$5-10/1M chars** | **CHEAPEST** - 25x cheaper than ElevenLabs |
| **OpenAI** | TTS-1 | **$15/1M chars** | **RECOMMENDED** - Good balance |
| OpenAI | GPT-4o-mini-tts | ~$15/1M chars equivalent | Token-based, newest voices |
| Amazon | Polly Generative | $30/1M chars | 100+ voices, 40+ languages |
| ElevenLabs | Various | $100+/1M chars | Premium quality, expensive |

**Verdict:**
- **OpenAI TTS-1** - Best for simplicity and quality
- **Inworld** - Consider if cost is critical (2-3x cheaper)

### Should You Use Realtime API?

**OpenAI Realtime API** (multimodal speech-to-speech):
- **Pricing:** $32/1M audio input + $64/1M audio output + text tokens
- **Effective cost:** $0.40-0.60 per minute
- **20-30× MORE EXPENSIVE** than chained approach

**Recommendation:** **NO, DO NOT USE for budget applications**

The traditional chained approach (STT → GPT → TTS) is dramatically cheaper:
- Chained: ~$0.002 per interaction
- Realtime: ~$0.40-0.60 per minute
- **200-300× more expensive**

Only use Realtime API if:
- Ultra-low latency is critical (<500ms)
- You need advanced voice features
- Budget is not a constraint

### Free Tier & Credits

**Current Status (2026):**
- **NO automatic free credits** for new accounts (discontinued mid-2025)
- Free tier limited to:
  - 3 requests per minute
  - GPT-3.5-turbo only (deprecated)
  - NO access to GPT-4, Whisper, TTS, or modern models

**Minimum Investment:**
- $5 prepayment required for full API access
- Mandatory payment method

**Alternative Free Options:**
- **Researcher Access Program** - Up to $1,000 credits for qualifying university/research/nonprofit projects

**Verdict:** No meaningful free tier for production use. Budget for $5-10 initial investment.

### Streaming Benefits

**Does streaming reduce costs?** **NO**
- Streaming improves perceived latency (faster user experience)
- Does NOT reduce token/character/minute costs
- All usage is billed regardless of streaming mode

**Use streaming for:**
- Better user experience
- Incremental response display
- NOT for cost reduction

---

## 7. Implementation Recommendations

### Recommended Configuration

```yaml
Voice Agent Stack:
  Speech-to-Text: GPT-4o-mini-transcribe ($0.003/min)
  Text Generation: GPT-4o-mini ($0.15 input / $0.60 output per 1M tokens)
  Text-to-Speech: TTS-1 ($15 per 1M characters)
  Voice: Echo (professional, clear)

Architecture:
  Type: Chained (STT → GPT → TTS)
  Caching: Enabled (80% hit rate target)
  Latency: ~2-3 seconds acceptable for web FAB

Cost Target:
  Per interaction: $0.002
  Monthly (200 interactions, 80% cached): $0.08
```

### Architecture Choice

**Use Chained Architecture** (STT → GPT → TTS):
- 200-300× cheaper than Realtime API
- Easier to debug and optimize
- Better for async/web applications
- Good enough latency for web FAB (<3 seconds)

**DO NOT use Realtime API** unless:
- You need <500ms latency
- Building phone-based conversational AI
- Budget is not a constraint

---

## 8. Code Examples

### Basic Voice Agent Implementation (Python)

```python
from openai import OpenAI
from pathlib import Path

client = OpenAI(api_key="your-api-key")

# 1. Speech-to-Text (User speaks)
def transcribe_audio(audio_file_path):
    """
    Transcribe user audio to text
    Cost: $0.003 per minute with GPT-4o-mini-transcribe
    """
    with open(audio_file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=audio_file
        )
    return transcript.text

# 2. Generate Response (GPT processes question)
def generate_response(user_message, system_prompt):
    """
    Generate intelligent response
    Cost: $0.15/1M input + $0.60/1M output tokens
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=200  # Limit output to control costs
    )
    return response.choices[0].message.content

# 3. Text-to-Speech (Speak response)
def speak_response(text, output_path="response.mp3"):
    """
    Convert text to speech
    Cost: $15 per 1M characters
    """
    response = client.audio.speech.create(
        model="tts-1",
        voice="echo",  # Professional voice
        input=text
    )
    response.stream_to_file(output_path)
    return output_path

# Full interaction flow
def handle_voice_interaction(audio_file_path):
    # Step 1: Convert speech to text
    user_text = transcribe_audio(audio_file_path)
    print(f"User said: {user_text}")

    # Step 2: Generate intelligent response
    system_prompt = """You are a helpful business assistant for [Company Name].
    Answer questions about our services, pricing, and contact information.
    Be concise and professional."""

    response_text = generate_response(user_text, system_prompt)
    print(f"Assistant responds: {response_text}")

    # Step 3: Convert response to speech
    audio_path = speak_response(response_text)
    print(f"Audio saved to: {audio_path}")

    return audio_path

# Usage
handle_voice_interaction("user_question.mp3")
```

### Advanced Implementation with Caching

```python
import hashlib
import json
from pathlib import Path

# Simple semantic cache
class ResponseCache:
    def __init__(self, cache_file="cache.json"):
        self.cache_file = cache_file
        self.cache = self._load_cache()

    def _load_cache(self):
        if Path(self.cache_file).exists():
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_cache(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f)

    def get(self, question):
        key = hashlib.md5(question.lower().strip().encode()).hexdigest()
        return self.cache.get(key)

    def set(self, question, response):
        key = hashlib.md5(question.lower().strip().encode()).hexdigest()
        self.cache[key] = response
        self._save_cache()

# Usage with caching
cache = ResponseCache()

def generate_cached_response(user_message, system_prompt):
    # Check cache first
    cached = cache.get(user_message)
    if cached:
        print("Cache hit! Saving API costs.")
        return cached

    # Cache miss - call API
    print("Cache miss - calling OpenAI API")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=200
    )

    response_text = response.choices[0].message.content

    # Save to cache
    cache.set(user_message, response_text)

    return response_text
```

### Optimized System Prompt with Caching Structure

```python
# Structure prompt for optimal caching
# Static content goes FIRST (gets cached)
# Variable content goes LAST (not cached)

STATIC_SYSTEM_CONTEXT = """You are a helpful business assistant for Smith & Associates.

COMPANY INFORMATION:
- Name: Smith & Associates
- Services: Legal consulting, business advisory, contract review
- Hours: Monday-Friday, 9 AM - 5 PM EST
- Phone: (555) 123-4567
- Email: info@smithassociates.com

PRICING:
- Initial consultation: $200/hour
- Contract review: $500 flat fee
- Retainer packages: Available, contact for details

COMMON QUESTIONS & ANSWERS:
Q: What services do you offer?
A: We provide legal consulting, business advisory services, and contract reviews.

Q: What are your hours?
A: We're open Monday through Friday, 9 AM to 5 PM Eastern Time.

Q: How much does a consultation cost?
A: Initial consultations are $200 per hour.

INSTRUCTIONS:
Answer user questions based on the information above.
Be concise, professional, and helpful.
If you don't know something, suggest they contact us directly.
"""

# This structure maximizes prompt caching benefits
def generate_response_optimized(user_question):
    messages = [
        {"role": "system", "content": STATIC_SYSTEM_CONTEXT},  # Cached
        {"role": "user", "content": user_question}  # Not cached (variable)
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=150
    )

    return response.choices[0].message.content
```

### Voice Options Testing Script

```python
# Test all professional voices to choose the best one
def test_all_voices(text="Hello, I'm your business assistant. How can I help you today?"):
    voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

    for voice in voices:
        print(f"Generating sample with voice: {voice}")
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text
        )
        response.stream_to_file(f"sample_{voice}.mp3")

    print("All samples generated. Listen and choose your favorite!")

# Run this once to hear all voices
test_all_voices()
```

### Rate Limiting with Exponential Backoff

```python
import time
import random

def api_call_with_retry(func, *args, max_retries=5, **kwargs):
    """
    Call OpenAI API with exponential backoff on rate limits
    """
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if "rate_limit" in str(e).lower() or "429" in str(e):
                if attempt < max_retries - 1:
                    # Exponential backoff: 1s, 2s, 4s, 8s, 16s
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    print(f"Rate limit hit. Retrying in {wait_time:.1f}s...")
                    time.sleep(wait_time)
                else:
                    raise
            else:
                raise

# Usage
def safe_generate_response(user_message, system_prompt):
    return api_call_with_retry(
        client.chat.completions.create,
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=200
    )
```

---

## 9. Final Recommendations

### Optimal Configuration Summary

```
✓ Speech-to-Text: GPT-4o-mini-transcribe
  - Cheapest option at $0.003/minute
  - Excellent accuracy for business applications

✓ Text Generation: GPT-4o-mini
  - Best cost-to-performance ratio
  - $0.15 input / $0.60 output per 1M tokens
  - 60% cheaper than deprecated GPT-3.5-turbo

✓ Text-to-Speech: TTS-1 with "Echo" voice
  - Good quality at $15 per 1M characters
  - Professional, clear voice
  - 2× cheaper than TTS-1-HD

✓ Architecture: Chained (STT → GPT → TTS)
  - 200-300× cheaper than Realtime API
  - Acceptable latency for web applications

✓ Caching Strategy:
  - Prompt caching (automatic, 90% input reduction)
  - Semantic caching (application level, 30-70% reduction)
  - Target 80% cache hit rate
```

### Expected Costs

| Scenario | API Calls/Month | Est. Cost |
|----------|-----------------|-----------|
| Low usage (100 interactions, 80% cached) | 20 | **$0.04/month** |
| Target usage (200 interactions, 80% cached) | 40 | **$0.08/month** |
| High usage (200 interactions, no cache) | 200 | **$0.42/month** |

**All scenarios are well within the $1-2/month budget.**

### Key Success Factors

1. **Implement caching** - Single biggest cost saver
2. **Use GPT-4o-mini** - Don't overpay for GPT-4o unless needed
3. **Keep responses concise** - Shorter = cheaper
4. **Monitor usage** - Track costs in OpenAI dashboard
5. **Start with $5 credit** - Enough for hundreds of interactions

### Implementation Checklist

- [ ] Sign up for OpenAI API account
- [ ] Add $5 initial credit
- [ ] Get API key
- [ ] Implement chained architecture (STT → GPT → TTS)
- [ ] Structure system prompt for caching (static first)
- [ ] Implement local semantic cache for FAQs
- [ ] Test all voice options, select "Echo" or "Onyx"
- [ ] Add exponential backoff for rate limits
- [ ] Set max_tokens to reasonable limits (150-200)
- [ ] Monitor usage in OpenAI dashboard
- [ ] Optimize based on actual usage patterns

---

## 10. Sources & References

### Whisper/Speech-to-Text
- [Whisper API Pricing 2026: $0.006/min Real Cost Breakdown](https://brasstranscripts.com/blog/openai-whisper-api-pricing-2025-self-hosted-vs-managed)
- [OpenAI Transcribe & Whisper API Pricing (Jan 2026)](https://costgoat.com/pricing/openai-transcription)
- [Pricing | OpenAI API](https://platform.openai.com/docs/pricing)
- [Best Speech to Text APIs 2025 (Pricing per Minute)](https://vocafuse.com/blog/best-speech-to-text-api-comparison-2025/)

### Chat Completions/GPT Models
- [Pricing | OpenAI](https://openai.com/api/pricing/)
- [OpenAI Pricing in 2026 for Individuals, Orgs & Developers](https://www.finout.io/blog/openai-pricing-in-2026)
- [GPT-4o mini: advancing cost-efficient intelligence | OpenAI](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/)
- [GPT 4o mini API Pricing 2026](https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini)
- [Complete LLM Pricing Comparison 2026](https://www.cloudidr.com/blog/llm-pricing-comparison-2026)

### Text-to-Speech
- [OpenAI TTS API Pricing Calculator (Jan 2026)](https://costgoat.com/pricing/openai-tts)
- [Pricing | OpenAI API](https://platform.openai.com/docs/pricing)
- [Precise pricing for TTS API - OpenAI Developer Community](https://community.openai.com/t/precise-pricing-for-tts-api/634297)
- [OpenAI TTS cost | S Anand](https://www.s-anand.net/blog/openai-tts-cost/)

### Rate Limits & Best Practices
- [Rate limits | OpenAI API](https://platform.openai.com/docs/guides/rate-limits)
- [How to handle rate limits | OpenAI Cookbook](https://cookbook.openai.com/examples/how_to_handle_rate_limits)
- [What are the best practices for managing my rate limits in the API?](https://help.openai.com/en/articles/6891753-what-are-the-best-practices-for-managing-my-rate-limits-in-the-api)
- [A practical guide to OpenAI rate limits](https://www.eesel.ai/blog/openai-rate-limits)

### Prompt Caching & Cost Optimization
- [Prompt caching | OpenAI API](https://platform.openai.com/docs/guides/prompt-caching)
- [Prompt Caching in the API | OpenAI](https://openai.com/index/api-prompt-caching/)
- [Prompt caching: 10x cheaper LLM tokens, but how? | ngrok blog](https://ngrok.com/blog/prompt-caching/)
- [How to Build LLM Caching Strategies](https://oneuptime.com/blog/post/2026-01-30-llm-caching-strategies/view)
- [10 AI Cost Optimization Strategies for 2026](https://www.aipricingmaster.com/blog/10-AI-Cost-Optimization-Strategies-for-2026)

### Free Tier & Credits
- [OpenAI API Key Free Trial in 2026: Complete Guide](https://www.aifreeapi.com/en/posts/openai-api-key-free-trial)
- [API Access using free tier - OpenAI Developer Community](https://community.openai.com/t/api-access-using-free-tier/710656)
- [Does OpenAI provide free access to their models?](https://milvus.io/ai-quick-reference/does-openai-provide-free-access-to-their-models)

### Realtime API & Streaming
- [Introducing the Realtime API | OpenAI](https://openai.com/index/introducing-the-realtime-api/)
- [OpenAI Realtime API Pricing 2025: Cost Calculator](https://skywork.ai/blog/agent/openai-realtime-api-pricing-2025-cost-calculator/)
- [Managing costs | OpenAI API](https://platform.openai.com/docs/guides/realtime-costs)
- [Introducing gpt-realtime and Realtime API updates](https://openai.com/index/introducing-gpt-realtime/)

### Alternatives & Comparisons
- [Top 10 OpenAI Whisper Alternatives & Competitors in 2026](https://www.g2.com/products/openai-whisper/competitors/alternatives)
- [Compare OpenAI Whisper Speech-to-Text Alternatives](https://deepgram.com/compare/openai-vs-deepgram-alternative)
- [Best TTS APIs for Real-Time Voice Agents (2026 Benchmarks)](https://inworld.ai/resources/best-voice-ai-tts-apis-for-real-time-voice-agents-2026-benchmarks)
- [OpenAI Whisper Alternatives in 2025: Faster, Cheaper, and More Scalable](https://frejun.ai/openai-whisper-alternatives-faster-cheaper-and-more-scalable/)

### Voice Implementation
- [Voice agents | OpenAI API](https://platform.openai.com/docs/guides/voice-agents)
- [Text to speech | OpenAI API](https://platform.openai.com/docs/guides/text-to-speech)
- [Introducing next-generation audio models in the API | OpenAI](https://openai.com/index/introducing-our-next-generation-audio-models/)
- [How to Build Real-Time Voice Agents with OpenAI Agent SDK](https://neurlcreators.substack.com/p/building-voice-agents-with-openai)

---

## Appendix: Quick Reference Card

```
RECOMMENDED VOICE AGENT STACK (2026)
====================================

STT:  GPT-4o-mini-transcribe @ $0.003/min
LLM:  GPT-4o-mini @ $0.15 in / $0.60 out per 1M tokens
TTS:  TTS-1 "Echo" @ $15 per 1M characters

COST PER INTERACTION: ~$0.002
MONTHLY (200 interactions, 80% cache): ~$0.08

FREE TIER: None (requires $5 minimum deposit)
ARCHITECTURE: Chained (STT → GPT → TTS)
CACHING: Automatic prompt caching + semantic cache

KEY OPTIMIZATIONS:
✓ Use GPT-4o-mini (not GPT-4o)
✓ Structure prompts for caching (static first)
✓ Cache common FAQ responses locally
✓ Use TTS-1 (not TTS-1-HD)
✓ Keep responses concise
✓ Implement exponential backoff
✓ Monitor usage in dashboard

AVOID:
✗ Realtime API (200-300× more expensive)
✗ GPT-4o for simple Q&A (16× more expensive)
✗ TTS-1-HD for standard use (2× more expensive)
✗ Processing silence (use VAD)
```

---

**Document Version:** 1.0
**Last Updated:** February 3, 2026
**Next Review:** Q2 2026 (when pricing may change)
