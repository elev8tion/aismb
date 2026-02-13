# Admin Booking System Documentation

## Overview

Complete admin interface for manual booking creation with full control over all NCB database fields.

## Changes Implemented

### 1. Fixed Calendar Date Issue ✅

**File**: `lib/booking/availability.ts:169`

**Problem**: Calendar was starting from tomorrow (loop started at `i = 1`)

**Fix**: Changed loop to start at `i = 0` to include today's date

```typescript
// Before
for (let i = 1; i <= daysAhead; i++)

// After
for (let i = 0; i <= daysAhead; i++)
```

**Impact**:
- Guest booking calendar now shows today as an available option (if slots exist)
- Available dates API now includes current day

---

### 2. Admin Booking Creation API ✅

**File**: `app/api/admin/bookings/create/route.ts`

**Features**:
- Manual booking creation with all NCB fields
- Automatic end_time calculation from start_time + duration
- Full validation (email format, date format, required fields)
- Optional booking pipeline integration (emails, CRM sync)
- Uses NCB OpenAPI with proper auth

**Endpoint**: `POST /api/admin/bookings/create`

**Request Body**:
```json
{
  // Required
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "booking_date": "2026-02-15",
  "start_time": "14:00",

  // Optional
  "guest_phone": "+1 (555) 123-4567",
  "timezone": "America/Los_Angeles",
  "notes": "Special requirements...",
  "status": "confirmed",
  "company_name": "Acme Corp",
  "industry": "Healthcare",
  "employee_count": "51-200",
  "challenge": "Need automation for billing",
  "referral_source": "LinkedIn",
  "website_url": "https://acme.com",
  "booking_type": "consultation",
  "stripe_session_id": "cs_...",
  "payment_status": "paid",
  "payment_amount_cents": 25000,
  "calendar_provider": "google",
  "calendar_event_id": "evt_...",
  "meeting_link": "https://zoom.us/j/123",
  "duration_minutes": 30
}
```

**Response**:
```json
{
  "success": true,
  "booking": { /* full booking object */ },
  "message": "Booking created successfully"
}
```

---

### 3. Admin Booking Form Component ✅

**File**: `components/Admin/AdminBookingForm.tsx`

**Features**:
- Comprehensive form with all NCB fields
- Organized into logical sections:
  - **Required Information** (name, email, date, time, duration, timezone)
  - **Contact & Business Info** (phone, company, industry, employees, website, challenge, referral)
  - **Booking Details** (type, status, meeting link, notes)
  - **Advanced Fields** (payment, calendar integration) - collapsible
- Real-time validation
- Success/error feedback
- Auto-resets after successful submission
- Glass-morphism UI matching landing page design

**Validation**:
- Required field checks
- Email format validation
- Date picker with min date (today)
- Time picker with 24-hour format
- Custom duration (15-min increments)

---

### 4. Admin Booking Management Page ✅

**File**: `app/admin/bookings/page.tsx`

**URL**: `/admin/bookings`

**Features**:
- Full-page admin interface
- Embedded AdminBookingForm component
- Global success/error notifications
- Admin guidelines info box
- Quick actions (view all bookings, back to home)
- Collapsible database field reference (NCB schema documentation)

**Security Note**:
- Currently no authentication (marked with TODO)
- Add auth middleware before production deployment

---

### 5. Admin Bookings List API ✅

**File**: `app/api/admin/bookings/list/route.ts`

**Endpoint**: `GET /api/admin/bookings/list`

**Query Parameters**:
- `limit` - Max bookings to return (default: 100)
- `status` - Filter by status (confirmed, pending, cancelled)
- `start_date` - Filter by date range (YYYY-MM-DD)
- `end_date` - Filter by date range (YYYY-MM-DD)

**Example**:
```
GET /api/admin/bookings/list?status=confirmed&limit=50
```

**Response**:
```json
{
  "success": true,
  "bookings": [ /* array of booking objects */ ],
  "count": 42
}
```

**Features**:
- Fetches all bookings from NCB
- Client-side filtering (status, date range)
- Sorted by booking date (newest first)
- Limit support for pagination

---

### 6. Admin Bookings List Page ✅

**File**: `app/admin/bookings/list/page.tsx`

**URL**: `/admin/bookings/list`

**Features**:
- Full table view of all bookings
- Filter tabs (All, Confirmed, Pending, Cancelled)
- Color-coded status badges
- Type badges (Consultation, Assessment)
- Formatted date/time display
- Contact links (email, meeting link)
- Stats summary cards (total, confirmed, pending, cancelled)
- Responsive design
- Auto-refresh on mount

**Table Columns**:
1. Date & Time (booking_date, start/end times, timezone)
2. Guest (name, email, phone)
3. Company (company name, industry, employee count)
4. Type (consultation or assessment badge)
5. Status (confirmed/pending/cancelled badge)
6. Contact (email link, meeting link)

---

## NCB Schema Binding Matrix

Complete NCB `bookings` table schema (from `.claude/ncb-reference/schema.json`):

| Field | Type | Required | Default | Indexed | Description |
|-------|------|----------|---------|---------|-------------|
| `id` | integer | Yes | auto-increment | - | Primary key |
| `guest_name` | string | Yes | - | - | Guest name |
| `guest_email` | string | Yes | - | ✅ | Guest email |
| `guest_phone` | string | No | null | - | Phone number |
| `booking_date` | datetime | Yes | - | ✅ | Booking date |
| `start_time` | string | Yes | - | - | Start time (HH:mm) |
| `end_time` | string | Yes | - | - | End time (HH:mm) |
| `timezone` | string | No | `America/Los_Angeles` | - | Timezone |
| `notes` | string | No | null | - | Internal notes |
| `status` | enum | No | `confirmed` | - | `confirmed`, `cancelled`, `pending` |
| `company_name` | string | No | null | - | Company name |
| `industry` | string | No | null | - | Industry type |
| `employee_count` | string | No | null | - | Company size |
| `challenge` | text | No | null | - | Main challenge |
| `referral_source` | string | No | null | - | Referral source |
| `website_url` | string | No | null | - | Website URL |
| `booking_type` | enum | No | `consultation` | - | `consultation`, `assessment` |
| `stripe_session_id` | string | No | null | - | Stripe session ID |
| `payment_status` | string | No | null | - | Payment status |
| `payment_amount_cents` | integer | No | null | - | Amount in cents |
| `calendar_provider` | enum | No | null | - | `google`, `caldav` |
| `calendar_event_id` | string | No | null | - | Calendar event ID |
| `meeting_link` | string | No | null | - | Meeting URL |
| `created_at` | datetime | No | `current_timestamp()` | - | Auto-set by DB |

### TypeScript Implementation Notes

1. **Nullable fields**: Use `string | null` (not `string | undefined`)
2. **Optional fields**: Send `null` for empty values (not `""`)
3. **Never send** `created_at` - DB handles it automatically
4. **Indexed columns**: `guest_email`, `booking_date` (optimized queries)

---

## Routes Added

| Route | Method | Purpose |
|-------|--------|---------|
| `/admin/bookings` | GET | Admin booking creation page |
| `/admin/bookings/list` | GET | Admin bookings list view |
| `/api/admin/bookings/create` | POST | Create booking API |
| `/api/admin/bookings/list` | GET | Fetch bookings API |

---

## Usage Example

### Creating a Manual Booking

1. Navigate to `/admin/bookings`
2. Fill in required fields:
   - Guest Name
   - Guest Email
   - Booking Date
   - Start Time
3. Optionally fill additional fields:
   - Phone, company info, business details
   - Meeting link, calendar IDs
   - Payment information
4. Click "Create Booking"
5. Booking is immediately created in NCB database
6. Success message displayed
7. Form auto-resets for next booking

### Viewing All Bookings

1. Navigate to `/admin/bookings/list`
2. Use filter tabs to view specific statuses
3. See all booking details in table format
4. Click email/meeting links for quick access
5. View stats summary at bottom

---

## Security Considerations

### Authentication Required

Both admin pages and APIs have TODO markers for authentication:

```typescript
// TODO: Add authentication check here
// const authHeader = req.headers.get('authorization');
// if (!authHeader || !isValidAdminToken(authHeader)) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
```

**Before Production**:
1. Implement auth middleware
2. Add admin role checks
3. Add session validation
4. Consider IP whitelisting for admin routes

### Current State

- ⚠️ No authentication implemented
- ⚠️ Anyone can access `/admin/*` routes
- ⚠️ Anyone can call admin APIs
- ✅ Data validation in place
- ✅ NCB RLS policies active (public table)

---

## Optional Features

### Booking Pipeline Integration

In `/api/admin/bookings/create/route.ts`, there's commented code to run the booking pipeline:

```typescript
// Optional: Run booking pipeline (emails, CRM sync, etc.)
// Uncomment if you want admin-created bookings to trigger automation
// try {
//   await runBookingPipeline(cfEnv, booking);
// } catch (pipelineError) {
//   console.error('Booking pipeline error (non-fatal):', pipelineError);
// }
```

**Pipeline includes**:
- Email confirmation to guest
- Admin notification email
- CRM lead sync
- Calendar event creation (if integrated)

**When to enable**:
- If admin bookings should send confirmations
- If admin bookings should sync to CRM
- If you want automated calendar events

**When to keep disabled**:
- Manual bookings are internal only
- No need for guest notifications
- Testing/development environment

---

## Testing

### Manual Testing Checklist

1. **Calendar Date Fix**:
   - [ ] Open guest booking modal on landing page
   - [ ] Verify today's date appears in calendar
   - [ ] Verify available dates include today (if slots exist)

2. **Admin Booking Creation**:
   - [ ] Navigate to `/admin/bookings`
   - [ ] Create booking with only required fields
   - [ ] Create booking with all fields filled
   - [ ] Verify validation errors for invalid data
   - [ ] Verify success message on creation
   - [ ] Check NCB database for created booking

3. **Admin Bookings List**:
   - [ ] Navigate to `/admin/bookings/list`
   - [ ] Verify all bookings load
   - [ ] Test status filters (All, Confirmed, Pending, Cancelled)
   - [ ] Verify stats summary matches data
   - [ ] Click email/meeting links
   - [ ] Verify responsive design on mobile

### API Testing

```bash
# Create booking
curl -X POST http://localhost:3000/api/admin/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "booking_date": "2026-02-20",
    "start_time": "14:00",
    "company_name": "Test Corp"
  }'

# List bookings
curl http://localhost:3000/api/admin/bookings/list

# List only confirmed
curl http://localhost:3000/api/admin/bookings/list?status=confirmed

# List with date range
curl "http://localhost:3000/api/admin/bookings/list?start_date=2026-02-01&end_date=2026-02-28"
```

---

## Future Enhancements

1. **Authentication** (CRITICAL before production)
2. **Edit Booking** functionality
3. **Delete Booking** with confirmation
4. **Bulk Operations** (mass cancel, export)
5. **Calendar View** (alternative to table)
6. **Search** by guest name/email/company
7. **Pagination** for large datasets
8. **Export to CSV**
9. **Email Templates** preview before sending
10. **Booking Conflicts** visual indicator

---

## Deployment Checklist

Before deploying admin features:

- [ ] Add authentication middleware
- [ ] Add admin role authorization
- [ ] Test all API endpoints
- [ ] Test form validation edge cases
- [ ] Review security (XSS, CSRF, SQL injection prevention)
- [ ] Add rate limiting to admin APIs
- [ ] Set up monitoring/logging for admin actions
- [ ] Document admin user creation process
- [ ] Create admin user guide
- [ ] Test on staging environment
- [ ] Verify NCB_SECRET_KEY in Cloudflare Pages secrets
- [ ] Test booking pipeline integration (if enabled)

---

## Support

For issues or questions:
- Check NCB schema: `.claude/ncb-reference/schema.json`
- Review booking types: `lib/booking/types.ts`
- Check environment variables: `.env.local` and Cloudflare Pages secrets
- Review deployment docs: `.claude/DEPLOYMENT.md`
