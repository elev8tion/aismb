# Public CRM Demo

The public demo is a safe, read-only product tour. It uses fictional fixture records and never reads from or writes to the production CRM database.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3001/demo`. The route creates a signed, eight-hour, HttpOnly demo session and redirects to `/dashboard`.

Local development uses a development-only signing key when no environment secret is present. Production requires `DEMO_SESSION_SECRET` or the existing `NCB_SECRET_KEY`.

## Five-minute demo path

1. Start at `https://kre8tion.com` and select **Open CRM Demo**.
2. Review Dashboard metrics and recent activity.
3. Open Leads and inspect the qualified Northstar Dental lead.
4. Open Pipeline and follow Northstar, River Park, Lumen, and BrightWire across stages.
5. Open Companies, Contacts, Partnerships, ROI Calculations, and the Weekly Report to show the same records across the workflow.

## Safety boundaries

- Fixture data only; addresses use the reserved `.example` domain.
- Data mutations return `403 DEMO_READ_ONLY`.
- Payments, invoices, subscriptions, contracts, and admin actions reject demo sessions.
- The voice operator is available inside the demo. It answers from fixture records and can open demo pages. It cannot change records.
- Settings, documents, drafts, and voice-session history stay hidden; Partnerships is view-only.
- The demo role is `team_member`, never `admin`.
- Signing credentials and API keys never reach the browser.

A real operator login still uses the live CRM voice agent and the real database. The public demo voice agent does not.
