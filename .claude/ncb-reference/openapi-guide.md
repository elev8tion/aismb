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

```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';

function getConfig() {
  const { env } = getRequestContext();
  const instance = env.NCB_INSTANCE;
  const openApiUrl = env.NCB_OPENAPI_URL;
  const secretKey = env.NCB_SECRET_KEY;

  if (!instance || !openApiUrl || !secretKey) {
    throw new Error('Missing NCB environment variables');
  }

  return { instance, openApiUrl, secretKey };
}

async function createRecord(table: string, data: Record<string, unknown>) {
  const config = getConfig();
  const url = `${config.openApiUrl}/create/${table}?Instance=${config.instance}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`NCB create error:`, res.status, error);
    return null;
  }

  const result = await res.json();
  // Returns { status: "success", id: N }
  if (result.status === 'success' && result.id) {
    return { ...data, id: result.id };
  }
  return null;
}

async function readRecords<T>(table: string): Promise<T[]> {
  const config = getConfig();
  const url = `${config.openApiUrl}/read/${table}?Instance=${config.instance}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
  });

  if (!res.ok) return [];

  const result = await res.json();
  return result.data || [];
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
