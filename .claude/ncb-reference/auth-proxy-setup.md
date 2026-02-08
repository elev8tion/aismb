# NoCodeBackend Auth Proxy Setup Guide

## Overview

The auth proxy handles user authentication by proxying requests to NCB Auth API and managing session cookies.

**Key Points:**
- Session cookies are the only authentication mechanism needed
- NCB accepts cookies in BOTH formats:
  - `better-auth.session_token` (without prefix)
  - `__Secure-better-auth.session_token` (with prefix)
- NCB dynamically finds any cookie ending with `better-auth.session_token`

---

## Environment Variables

```env
NCB_INSTANCE=36905_ai_smb_crm
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_DATA_API_URL=https://app.nocodebackend.com/api/data
```

---

## Cookie Handling

### Extract auth cookies to forward to NCB
```typescript
function extractAuthCookies(cookieHeader: string): string {
  if (!cookieHeader) return "";
  const cookies = cookieHeader.split(";");
  const authCookies: string[] = [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith("better-auth.session_token=") ||
        trimmed.startsWith("better-auth.session_data=")) {
      authCookies.push(trimmed);
    }
  }
  return authCookies.join("; ");
}
```

### Transform Set-Cookie for localhost
When RECEIVING cookies from NCB:
- Strip `__Secure-` and `__Host-` prefixes
- Strip `Domain` attribute
- Strip `Secure` flag
- Set `SameSite=Lax`

### When FORWARDING cookies to NCB
Send as-is — NCB accepts both formats.

---

## Auth Route: `app/api/auth/[...path]/route.ts`

- Proxies GET/POST to `NCB_AUTH_API_URL`
- Special handling for `sign-out` (always return 200, always clear cookies)
- Forward `Instance` query param + `X-Database-Instance` header

---

## Frontend Usage

Always include `credentials: "include"`:

```typescript
// Check session
const res = await fetch("/api/auth/get-session", { credentials: "include" });

// Sign in
await fetch("/api/auth/sign-in/email", {
  method: "POST", credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

// Sign out
await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
```

---

## Providers Endpoint: `app/api/auth-providers/route.ts`

Fetches available auth methods (email, google, github, etc):
```typescript
const url = `${NCB_AUTH_API_URL}/providers?instance=${NCB_INSTANCE}`;
```
