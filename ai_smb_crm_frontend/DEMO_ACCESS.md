# Demo access

Testers do **not** type email/password. They click **Enter demo**. The server signs into the isolated demo account and sets the session cookie. Credentials never reach the browser.

Operator email/password is hidden behind **Operator sign in**.

## Secrets (GitHub → Cloudflare Pages)

Prefer:

```text
DEMO_LOGIN_ENABLED=true
DEMO_LOGIN_EMAIL=<demo-account-email>
DEMO_LOGIN_PASSWORD=<demo-account-password>
```

If those are empty, deploy maps GitHub `TEST_EMAIL` / `TEST_PASSWORD` onto `DEMO_LOGIN_*` and enables demo login.

Set `DEMO_LOGIN_ENABLED=false` to turn the tester button off.

Keep the demo account least-privileged and separate from any owner/admin account. Do not put a real password in a tracked file or in the login UI.
