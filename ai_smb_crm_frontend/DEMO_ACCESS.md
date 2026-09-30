# Demo access

Demo credentials must stay server-side. Do not put a real username or password in a tracked file or expose the password in the login UI.

Configure these as private Cloudflare Pages secrets (or in local `.env.local`):

```text
DEMO_LOGIN_ENABLED=true
DEMO_LOGIN_EMAIL=<demo-account-email>
DEMO_LOGIN_PASSWORD=<demo-account-password>
```

When configured, the login page shows **Use demo access**. The server signs into the isolated demo account and forwards the session cookie; the credentials never reach the browser.

Keep the demo account least-privileged and separate from any owner/admin account.
