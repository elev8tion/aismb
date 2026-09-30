# Email in this project

Two EmailIt paths. Do not mix them.

| Path | Who sends | Protocol | Secret | What it covers |
|---|---|---|---|---|
| **Product mail** | This Next.js app | REST `POST https://api.emailit.com/v1/emails` | GitHub `EMAILIT_API_KEY` → Cloudflare Pages | ROI reports, booking/assessment confirmations, lead dossiers, welcome, payment-failed, contract signing, admin bounce alerts |
| **Auth mail** | NoCodeBackend | SMTP `smtp.emailit.com` | NCB dashboard only. Not in this repo. | Signup, verify, password reset |

This app does **not** use SMTP. There is no `EMAILIT_SMTP_USER` / `EMAILIT_SMTP_PASS`. No nodemailer.

## Product mail (this repo)

- Code: `lib/email/sendEmail.ts` and `ai_smb_crm_frontend/lib/email/sendEmail.ts`
- Helper: `sendViaEmailIt()`
- From: `AI KRE8TION Partners <bookings@kre8tion.com>`
- Domain `kre8tion.com` is verified in EmailIt (SPF/DKIM/DMARC)
- Live send URL is `/v1/emails`. `/v1/emails/send` returns 405. Ignore vendor docs that say `/send`.
- Missing key: most sends skip with a warning. ROI report is the exception (500).

## Secrets

- Store `EMAILIT_API_KEY` in GitHub Actions secrets.
- Deploy workflows push it to Cloudflare Pages (`kre8tion-app` and `ai-smb-crm`).
- Local CRM voice demo does **not** need this key. Demo needs NCB + OpenAI only. See `ai_smb_crm_frontend/DEMO.md`.
- Do not ask for a Cloudflare token to “set up email.” Production already has the key.

## Vendor dump

`emailit_api_docs/` is upstream EmailIt docs + screenshots. It is **not** how this repo sends mail. It still mentions SMTP and `/v1/emails/send`. Follow this file and the TypeScript senders instead.
