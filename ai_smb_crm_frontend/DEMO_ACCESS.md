# Demo access

Public testers use either:

- `https://app.kre8tion.com/demo` for one-click entry, or
- **Enter demo** on the login page.

Both paths create the same signed, HttpOnly, eight-hour demo session. No email or password is sent to the browser.

## Production secret

Set a dedicated Cloudflare Pages secret when possible:

```text
DEMO_SESSION_SECRET=<random high-entropy value>
```

If it is absent, the server uses the existing `NCB_SECRET_KEY` only as the HMAC signing secret. Production demo access is unavailable when neither secret exists. The tracked development fallback is never accepted in production.

The older `DEMO_LOGIN_EMAIL` and `DEMO_LOGIN_PASSWORD` secrets are not required by the fixture demo.

## Access model

- Demo identity: `demo-user`
- Role: `team_member`
- Data: fictional in-code fixtures
- Writes: blocked with HTTP 403
- Privileged integrations: blocked
- Session cookie: `HttpOnly`, `SameSite=Lax`, and `Secure` on HTTPS

Operator email/password login remains behind **Operator sign in** and uses the normal NCB authentication path.
