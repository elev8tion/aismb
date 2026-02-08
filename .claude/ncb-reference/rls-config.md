# NCB Row-Level Security (RLS) Configuration

## How RLS Works in NCB

- Controlled via the `ncba_rls_config` table
- Two columns: `table_name` (PK) and `policy`
- Tables with `user_id` column: NCB auto-filters by authenticated user
- Tables WITHOUT `user_id`: blocked for writes unless explicitly set to `public`

## Current RLS Config (as of 2026-02-08)

| table_name | policy |
|------------|--------|
| bookings   | public |

## Policy Values

- `public` — allows unauthenticated reads AND writes (no session cookie needed)
- (empty/no entry) — requires session cookie auth for writes, reads may work without auth

## Tables That Need Public Access (no user_id)

These tables have no `user_id` column and are designed for guest/system access:
- `bookings` — guest booking (set to public ✓)
- `availability_settings` — read by booking UI (reads work without auth)
- `blocked_dates` — read by booking UI (reads work without auth)
- `calendar_integrations` — admin-only (auth required, OK as-is)

## Tables With user_id (RLS auto-enforced)

All CRM tables: leads, companies, contacts, opportunities, partnerships, payments, activities, delivered_systems, proposed_systems, roi_calculations, voice_sessions, user_profiles, team_assignments, customer_access, drafts

## How To Add Public Access

```sql
INSERT INTO ncba_rls_config (table_name, policy) VALUES ('table_name', 'public');
```

## How To Remove Public Access

```sql
DELETE FROM ncba_rls_config WHERE table_name = 'table_name';
```
