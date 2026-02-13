# Deployment Checklist - Zod Migration & Shared Types

**Status:** Ready for production deployment
**Date:** February 13, 2026

## Completed Tasks

### ✅ Task 2: Replace Local Type Imports with Shared Types
- Migrated all 15 files to use `@kre8tion/shared-types`
- Deleted local `lib/booking/types.ts` file
- Added `MEETING_DURATION` backward compatibility alias
- All TypeScript compilation successful

### ✅ Task 1: Extend Zod Migration to All API Routes
- Created `caldavConnectRequestSchema` in shared-types
- Migrated `app/api/booking/create/route.ts` (removed 35 lines of manual validation)
- Migrated `app/api/booking/checkout/route.ts` (removed 42 lines of manual validation)
- Migrated `app/api/booking/calendar/caldav/connect/route.ts` (removed 23 lines of manual validation)
- All routes now use consistent `validate()` and `formatZodErrors()` pattern

### ✅ Workflow Updated
- Added `ADMIN_API_KEY` and `NCB_GUEST_KEY` to `.github/workflows/deploy.yml`
- Workflow will automatically set secrets in Cloudflare Pages on deployment

---

## Required Manual Steps

### 1. Set GitHub Repository Secrets

Navigate to: https://github.com/kcdacre8tor/ai-smb-partners/settings/secrets/actions

Add these two new secrets:

| Secret Name | Value |
|-------------|-------|
| `ADMIN_API_KEY` | `5d787036139e44765c04e648bc7b11352016b7f987c682be8c635c2f3bfa3310` |
| `NCB_GUEST_KEY` | Same value as `NCB_SECRET_KEY` (for now) |

**Note:** For production, you should request a read-only NCB key for guest bookings from NoCodeBackend support.

### 2. Push to Main Branch

Once secrets are set:
```bash
git push origin main
```

This will trigger the GitHub Actions workflow which will:
1. Install dependencies
2. Build Next.js
3. Build for Cloudflare Pages
4. Set all secrets in Cloudflare Pages environment
5. Deploy to kre8tion-app project

### 3. Monitor Deployment

Watch the deployment status:
```bash
gh run list --limit 3
gh run watch
```

Or visit: https://github.com/kcdacre8tor/ai-smb-partners/actions

### 4. Production Testing Checklist

Once deployed, test these endpoints:

#### Admin Authentication
```bash
curl https://kre8tion.com/api/admin/bookings/list \
  -H "Authorization: Bearer 5d787036139e44765c04e648bc7b11352016b7f987c682be8c635c2f3bfa3310"
```
Expected: 200 OK with booking list

#### Zod Validation (Invalid Data)
```bash
curl -X POST https://kre8tion.com/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
```
Expected: 400 with `{ error: "Validation failed", details: {...} }`

#### Admin Booking Creation
```bash
curl -X POST https://kre8tion.com/api/admin/bookings/create \
  -H "Authorization: Bearer 5d787036139e44765c04e648bc7b11352016b7f987c682be8c635c2f3bfa3310" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "booking_date": "2026-03-15",
    "start_time": "10:00",
    "end_time": "10:30",
    "timezone": "America/Los_Angeles",
    "status": "confirmed",
    "booking_type": "consultation"
  }'
```
Expected: 201 with booking data

#### Guest Booking Flow (Manual)
1. Visit https://kre8tion.com
2. Click "Schedule Free Consultation" or "Book Assessment"
3. Complete booking form
4. Verify Stripe checkout (if assessment)
5. Check confirmation page
6. Verify confirmation email received

---

## Rollback Procedures

### If Deployment Fails
```bash
# Revert workflow changes
git revert 3988d73

# Revert Zod migration
git revert 4289e5a

# Revert all type migrations
git revert 49b4ade fe9ac01 ac400ed 376abe8

# Push rollback
git push origin main
```

### Rollback in Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select "Workers & Pages" → "kre8tion-app"
3. Click "View details" on a previous successful deployment
4. Click "Rollback to this deployment"

---

## Next Steps (Task 4: CRM Integration)

After successful landing page deployment, apply same patterns to CRM:

1. Link shared-types package to CRM project
2. Migrate CRM type imports
3. Migrate CRM API validation to Zod
4. Deploy CRM manually

**Estimated time:** 8 hours
**Separate project:** Won't affect landing page

---

## Summary of Changes

**Files Modified:** 30+
**Lines Removed:** 250+ (manual validation code)
**Lines Added:** 60+ (Zod schemas + imports)
**Type Safety:** Single source of truth across projects
**Error Handling:** Consistent Zod validation with field-level errors

**Production Benefits:**
- ✅ Consistent validation across all API routes
- ✅ Better error messages for developers and users
- ✅ Type-safe imports from shared package
- ✅ Reduced code duplication
- ✅ Easier maintenance and testing
