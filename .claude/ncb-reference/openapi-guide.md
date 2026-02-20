# NCB OpenAPI — Server-to-Server Guide

## Overview

The OpenAPI endpoint is for **server-side operations that don't have user session cookies** — guest bookings, webhook handlers, cron jobs, server-to-server integrations.

**Base URL**: `https://openapi.nocodebackend.com`
**Auth**: `Authorization: Bearer ${NCB_SECRET_KEY}`
**Instance param**: `?Instance=36905_ai_smb_crm` (capital `I`)

---

## Authentication

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${secretKey}`,
}
```

- **Secret key**: From NCB Dashboard → Settings
- **NOT** the `ncb_` prefixed MCP token (that's for MCP tools only)
- **Env var**: `NCB_SECRET_KEY`

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/create/{table}?Instance={instance}` | Create a record |
| `GET` | `/read/{table}?Instance={instance}` | Read all records (paginated) |
| `GET` | `/read/{table}/{id}?Instance={instance}` | Read single record |
| `POST` | `/search/{table}?Instance={instance}` | Search records |
| `PUT` | `/update/{table}/{id}?Instance={instance}` | Update a record |
| `DELETE` | `/delete/{table}/{id}?Instance={instance}` | Delete a record |

---

## Response Formats

### Create
```json
{"status": "success", "message": "Record created successfully", "id": 7}
```
**Note**: No `data` wrapper. Returns only the new record ID.

### Read (list)
```json
{
  "status": "success",
  "data": [...],
  "metadata": {"page": 1, "limit": 10, "hasMore": false, "hasPrev": false}
}
```

### Read (by ID)
```json
{"status": "success", "data": {...}}
```

### Update
```json
{"status": "success", "message": "Record updated successfully"}
```

### Delete
```json
{"status": "success", "message": "Record deleted successfully"}
```

---

## Read Query Parameters

| Operator | Example | Meaning |
|----------|---------|---------|
| `field` | `?status=active` | Equal (default) |
| `field[ne]` | `?status[ne]=inactive` | Not equal |
| `field[gt]` | `?price[gt]=100` | Greater than |
| `field[gte]` | `?date[gte]=2024-05-01` | Greater or equal |
| `field[lt]` | `?score[lt]=500` | Less than |
| `field[lte]` | `?score[lte]=800` | Less or equal |
| `field[in]` | `?type[in]=a,b,c` | In list |
| `field[like]` | `?name[like]=john` | Partial match |

**Pagination**: `page`, `limit` (defaults 1, 10)
**Sorting**: `sort=colA,colB`, `order=asc,desc`
**Totals**: `includeTotal=true`
**Single record**: `only=latest` or `only=oldest`

---

## Usage Pattern (Cloudflare Pages Edge Runtime)

All NCB calls go through `lib/ncb/client.ts`. Never call the OpenAPI directly from routes.

```typescript
// In an API route:
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';
import { getNCBConfig, ncbCreate, ncbRead } from '@/lib/ncb/client';

export const runtime = 'edge';

export async function POST(req: Request) {
  const ctx = getOptionalRequestContext();
  const env = (ctx?.env || process.env) as any;
  const config = getNCBConfig(env, 'admin'); // or 'guest' for public writes

  const record = await ncbCreate(config, 'bookings', payload);
  const records = await ncbRead(config, 'bookings');
}
```

---

## Data Conventions

- **Nullable fields**: Send `null`, not `""` (empty string)
- **Don't send `created_at`**: DB handles `current_timestamp()` default
- **TypeScript types**: Use `string | null` for nullable columns, not `string | undefined`
- **Dates**: DB stores as `YYYY-MM-DD` (DATE) or `YYYY-MM-DD HH:MM:SS` (DATETIME)

---

## Environment Variables

```env
NCB_OPENAPI_URL=https://openapi.nocodebackend.com
NCB_SECRET_KEY=<from NCB Dashboard → Settings>
NCB_INSTANCE=36905_ai_smb_crm
```

All three must be set in:
- `.env.local` (local dev)
- Cloudflare Pages secrets (production)
- GitHub repo secrets (for deploy workflow)

---

## curl Examples

```bash
# Create
curl -X POST 'https://openapi.nocodebackend.com/create/bookings?Instance=36905_ai_smb_crm' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"guest_name":"Test","guest_email":"test@example.com","booking_date":"2026-02-15","start_time":"10:00","end_time":"10:30","timezone":"America/Los_Angeles","status":"confirmed","booking_type":"consultation"}'

# Read
curl 'https://openapi.nocodebackend.com/read/bookings?Instance=36905_ai_smb_crm' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY'

# Delete
curl -X DELETE 'https://openapi.nocodebackend.com/delete/bookings/5?Instance=36905_ai_smb_crm' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY'
```
