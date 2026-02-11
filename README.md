# AI KRE8TION Partners — kre8tion.com

Next.js 15 App Router landing page deployed on **Cloudflare Pages**. Features an AI-powered voice agent that handles conversational booking, ROI calculation, lead qualification with CRM sync, email confirmations, and Stripe-powered assessment payments.

## Architecture

- **Runtime**: Cloudflare Workers edge runtime — uses `getRequestContext().env` (not `process.env`)
- **KV Namespaces**: `VOICE_SESSIONS`, `RATE_LIMIT_KV`, `COST_MONITOR_KV`, `RESPONSE_CACHE_KV`
- **OpenAI**: `gpt-4.1-nano` (chat), `whisper-1` (STT), `gpt-4o-mini-tts` (TTS)
- **CRM**: NocodeBackend (NCB) — OpenAPI for guest writes, Data Proxy for authenticated CRUD
- **Email**: EmailIt transactional API (`bookings@kre8tion.com`)
- **Payments**: Stripe Checkout for $250 on-site assessment fee

### Key Modules

| Module | Purpose |
|--------|---------|
| `lib/shared/roiEngine.ts` | ROI calculation math |
| `lib/booking/createBooking.ts` | Booking pipeline (NCB + email + calendar) |
| `lib/ncb/client.ts` | NCB API client |
| `lib/booking/calendarLinks.ts` | Google/Outlook calendar link generation |
| `lib/shared/formatters.ts` | Date/time formatting utilities |
| `lib/voiceAgent/` | Voice agent: intent routing, agents, lead scoring, session storage |
| `lib/email/sendEmail.ts` | EmailIt transactional sender + templates |
| `lib/security/` | Rate limiting, cost monitoring, input validation |

## Local Development

```bash
npm install --legacy-peer-deps
npx wrangler dev
```

Copy `.env.example` to `.env.local` and fill in your keys. KV namespace bindings are configured in `wrangler.toml`.

## Environment Variables

See `.env.example` for the full list. Key variables:

- `OPENAI_API_KEY` — OpenAI API access
- `NCB_*` — NocodeBackend instance and API URLs
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe payments
- `EMAILIT_API_KEY` — EmailIt transactional email
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google Calendar OAuth (optional)

## Deployment

Auto-deploys via GitHub Actions on push to `main`:

```
push to main → GitHub Actions → npm run pages:build → wrangler pages deploy
```

Manual deploy:

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=kre8tion-app --commit-dirty=true --no-bundle
```

Check deploy status: `gh run list --limit 3`

## Testing

```bash
npm run test        # watch mode
npm run test:run    # single run
```
