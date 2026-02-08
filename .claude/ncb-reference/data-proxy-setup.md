# NoCodeBackend Data Proxy Setup Guide

## Overview

The data proxy:
1. Receives requests from your frontend
2. Validates the user's session
3. Forwards requests to NCB Data API with session cookies
4. NCB enforces RLS based on the authenticated user

---

## Environment Variables

```env
NCB_INSTANCE=36905_ai_smb_crm
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_DATA_API_URL=https://app.nocodebackend.com/api/data
```

---

## RLS (Row-Level Security)

NCB enforces RLS based on the `user_id` column:
- Tables WITH `user_id`: user only sees/modifies their own records
- Tables WITHOUT `user_id`: need explicit `ncba_rls_config` entry
- Public tables (like `bookings`): set `policy: 'public'` in `ncba_rls_config`

### Configuring Public Access
```sql
INSERT INTO ncba_rls_config (table_name, policy) VALUES ('bookings', 'public');
```

---

## Data Route: `app/api/data/[...path]/route.ts`

### Responsibilities
- Proxy CRUD requests to `NCB_DATA_API_URL`
- Validate user session before allowing operations
- Inject `user_id` from session on CREATE
- Strip `user_id` from client payloads (prevent spoofing)
- Forward session cookies to NCB

### Required Headers
```typescript
headers: {
  "Content-Type": "application/json",
  "X-Database-Instance": CONFIG.instance,
  "Cookie": authCookies,
  "Origin": origin,
}
```

### CRUD Endpoints
- **Create**: `POST /create/{table}?instance={instance}`
- **Read**: `GET /read/{table}?instance={instance}`
- **Read by ID**: `GET /read/{table}/{id}?instance={instance}`
- **Search**: `GET /search/{table}?instance={instance}`
- **Update**: `PUT /update/{table}/{id}?instance={instance}`
- **Delete**: `DELETE /delete/{table}/{id}?instance={instance}`

---

## Frontend Usage

Always include `credentials: "include"`:

```typescript
// Read
const res = await fetch("/api/data/read/products", { credentials: "include" });

// Create (user_id injected by proxy)
await fetch("/api/data/create/products", {
  method: "POST", credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "My Product", price: 9.99 }),
});

// Update (user_id stripped by proxy)
await fetch("/api/data/update/products/123", {
  method: "PUT", credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Updated" }),
});

// Delete
await fetch("/api/data/delete/products/123", {
  method: "DELETE", credentials: "include",
});
```
