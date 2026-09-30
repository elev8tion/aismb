# EmailIt vendor dump — not how this repo sends mail

This folder is upstream EmailIt docs and screenshots. It is **wrong for this project** in two places:

1. **Send URL.** Vendor examples use `POST /v1/emails/send`. Live API 405s that. This repo sends `POST https://api.emailit.com/v1/emails`.
2. **SMTP.** Vendor docs describe `smtp.emailit.com`. This Next.js app does **not** use SMTP. NCB uses EmailIt SMTP for auth mail (signup / verify / reset) from the NCB dashboard. Product mail in this repo is REST + `EMAILIT_API_KEY`.

Follow `docs/EMAIL.md` and `lib/email/sendEmail.ts`. Do not copy SMTP or `/emails/send` from files in this folder.
