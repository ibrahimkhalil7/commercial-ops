# Django Models Reference

Complete documentation of all models in the Commercial Operations Platform backend.

## 1. Users App (`apps.users`)

### User Model
Primary authentication model with role-based access control.

**Fields:**
- `id` (UUID, PK)
- `email` (EmailField, unique, indexed)
- `first_name`, `last_name` (CharField)
- `phone` (CharField, optional, validated)
- `role` (CharField, choices: admin, manager, field_agent, outlet_manager)
- `is_active`, `is_staff`, `is_superuser` (Boolean)
- `manager` (FK to self, nullable, for hierarchy)
- `date_joined`, `last_login` (DateTime)
- `updated_at` (DateTime)

**Relationships:**
- `manager` → self (optional manager)
- `subordinates` ← Users (agents under this manager)
- `teams` ← Team.members
- `managed_team` ← Team.manager
- `managed_outlets` ← Outlet.assigned_manager
- `managed_outlet` ← Outlet.outlet_manager_user

**Properties:**
- `is_internal_user` → bool (admin/manager/field_agent)
- `is_outlet_user` → bool (outlet_manager only)
- `get_full_name()` → str
- `get_role_display()` → str

### Team Model
Operational grouping of agents.

**Fields:**
- `id` (UUID, PK)
- `name` (CharField, unique)
- `description` (TextField, optional)
- `manager` (FK to User, optional)
- `members` (M2M to User)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

---

## 2. Outlets App (`apps.outlets`)

### OutletCategory Model
Classification for outlets.

**Fields:**
- `id` (UUID, PK)
- `name` (CharField, unique)
- `description` (TextField)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

### Outlet Model
Master record for each commercial outlet.

**Fields:**
- `id` (UUID, PK)
- `name` (CharField)
- `address` (TextField)
- `latitude`, `longitude` (DecimalField, validated)
- `category` (FK to OutletCategory)
- `contact_person`, `email`, `phone` (CharField/EmailField)
- `operating_notes` (TextField)
- `assigned_manager` (FK to User, optional)
- `outlet_manager_user` (1-to-1 FK to User, optional)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

**Indexes:**
- `name`, `category`, `is_active`, `(latitude, longitude)`

**Properties:**
- `location_tuple` → (lat, lon) tuple
- `get_category_display()` → str

### LegacyNotice Model
Historical warning/fine records imported before platform launch.

**Fields:**
- `id` (UUID, PK)
- `outlet` (FK to Outlet)
- `notice_type` (CharField, choices: warning, fine, violation, notice)
- `reason` (TextField)
- `amount` (DecimalField, optional)
- `source` (CharField) - reference to original system
- `issued_date` (DateField)
- `attachment` (FileField, optional)
- `notes` (TextField)
- `created_at` (DateTime - import timestamp)

**Indexes:**
- `outlet`, `notice_type`, `issued_date`

---

## 3. Routes App (`apps.routes`)

### RouteTemplate Model
Recurring route definition with scheduled stops.

**Fields:**
- `id` (UUID, PK)
- `name` (CharField)
- `zone` (CharField)
- `assigned_agent` (FK to User)
- `recurring_days` (CharField) - Binary format "1111100" = Mon-Fri
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

**Unique Together:** `(name, assigned_agent)`

**Methods:**
- `applies_on_weekday(weekday: int) → bool`
- `get_applicable_days() → list[int]`

**Relationships:**
- `stops` ← RouteStop.route_template
- `daily_routes` ← DailyRoute.route_template

### RouteStop Model
Individual stop in a route template.

**Fields:**
- `id` (UUID, PK)
- `route_template` (FK to RouteTemplate)
- `outlet` (FK to Outlet)
- `stop_order` (PositiveIntegerField, indexed)
- `notes` (TextField)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

**Unique Together:** `(route_template, outlet)`

**Ordering:** `route_template, stop_order`

### DailyRoute Model
Daily execution instance of a route template.

**Fields:**
- `id` (UUID, PK)
- `route_template` (FK to RouteTemplate)
- `route_date` (DateField, indexed)
- `assigned_agent` (FK to User)
- `status` (CharField, choices: pending, in_progress, completed, partial, cancelled)
- `planned_stops`, `completed_stops`, `skipped_stops` (PositiveIntegerField)
- `created_at`, `started_at`, `completed_at` (DateTime)

**Unique Together:** `(route_template, route_date)`

**Properties:**
- `completion_percentage → int`
- `is_overdue → bool`

**Relationships:**
- `visits` ← Visit.daily_route
- `shifts` ← Shift.daily_route

---

## 4. Visits App (`apps.visits`)

### Shift Model
Work shift for field agents (controls when location tracking is active).

**Fields:**
- `id` (UUID, PK)
- `agent` (FK to User)
- `daily_route` (FK to DailyRoute, optional)
- `status` (CharField, choices: pending, active, completed, cancelled)
- `start_time`, `end_time` (DateTime, nullable)
- `created_at` (DateTime)

**Indexes:** `agent`, `status`, `start_time`

**Properties:**
- `duration → timedelta`
- `is_active → bool`

**Relationships:**
- `gps_logs` ← GPSLog.shift

### Visit Model
Outlet check-in/check-out record. One per daily route per outlet.

**Fields:**
- `id` (UUID, PK)
- `daily_route` (FK to DailyRoute)
- `outlet` (FK to Outlet)
- `agent` (FK to User)
- `status` (CharField, choices: pending, checked_in, checked_out, skipped)
- `check_in_time`, `check_in_latitude`, `check_in_longitude`, `check_in_accuracy` (DateTime, Decimal, Float)
- `check_out_time`, `check_out_latitude`, `check_out_longitude` (DateTime, Decimal)
- `notes` (TextField)
- `within_proximity` (Boolean)
- `created_at`, `updated_at` (DateTime)

**Unique Together:** `(daily_route, outlet)`

**Indexes:** `daily_route`, `outlet`, `agent`, `status`, `check_in_time`

**Properties:**
- `visit_duration → timedelta`

**Relationships:**
- `notices` ← Notice.visit

### GPSLog Model
Location tracking record (captured every 3 minutes during active shift).

**Fields:**
- `id` (UUID, PK)
- `agent` (FK to User)
- `shift` (FK to Shift)
- `latitude`, `longitude` (DecimalField, validated)
- `accuracy`, `altitude` (FloatField, optional)
- `timestamp` (DateTime, indexed) - when captured
- `created_at` (DateTime, indexed) - when recorded

**Indexes:** `agent`, `shift`, `timestamp`, `created_at`

**Properties:**
- `location_tuple → (lat, lon) tuple`

---

## 5. Notices App (`apps.notices`)

### Notice Model
Warning/fine issued to outlet with email notification.

**Fields:**
- `id` (UUID, PK)
- `outlet` (FK to Outlet)
- `notice_type` (CharField, choices: warning, fine, violation, notice)
- `reason` (TextField)
- `priority` (CharField, choices: low, medium, high, urgent)
- `amount` (DecimalField, optional)
- `visit` (FK to Visit, optional)
- `created_by` (FK to User)
- `evidence_photo` (ImageField, optional)
- `attachment` (FileField, optional)
- `send_status` (CharField, choices: pending, sent, failed, retry)
- `sent_at` (DateTime, optional)
- `sent_to_emails` (TextField)
- `send_error_message` (TextField)
- `issued_at` (DateTime)
- `updated_at` (DateTime)

**Indexes:** `outlet`, `notice_type`, `priority`, `send_status`, `issued_at`

**Methods:**
- `send_notification() → bool` - Sends email to outlet manager

---

## 6. Maintenance App (`apps.maintenance`)

### MaintenanceCategory Model
Classification and routing for maintenance issues.

**Fields:**
- `id` (UUID, PK)
- `name` (CharField, unique)
- `description` (TextField)
- `recipient_team` (CharField) - destination team name
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

### MaintenanceTicket Model
Infrastructure/public-realm issue report from field.

**Fields:**
- `id` (UUID, PK)
- `ticket_number` (CharField, unique) - auto-generated "MNT-YYYYMMDDHHMMSS"
- `category` (FK to MaintenanceCategory)
- `outlet` (FK to Outlet, optional)
- `location_latitude`, `location_longitude` (DecimalField)
- `location_description` (CharField)
- `description` (TextField)
- `priority` (CharField, choices: low, medium, high, critical)
- `status` (CharField, choices: open, acknowledged, in_progress, completed, cancelled)
- `reported_by` (FK to User)
- `evidence_photo` (ImageField)
- `additional_attachments` (FileField, optional)
- `assigned_recipient` (CharField)
- `sent_to_recipients` (TextField)
- `completed_at` (DateTime, optional)
- `completion_notes` (TextField)
- `created_at`, `updated_at` (DateTime)

**Indexes:** `ticket_number`, `category`, `priority`, `status`, `created_at`

**Methods:**
- `save()` - Auto-generates ticket_number
- `send_notification() → bool` - Sends email to maintenance team

---

## 7. Reporting App (`apps.reporting`)

### AuditLog Model
Complete audit trail of all important actions.

**Fields:**
- `id` (UUID, PK)
- `user` (FK to User, nullable)
- `action` (CharField, choices: create, update, delete, view, login, export, send_notice, create_ticket, check_in, check_out, start_shift, end_shift)
- `content_type` (FK to ContentType, nullable)
- `object_id` (CharField)
- `content_object` (GenericForeignKey)
- `description` (TextField)
- `ip_address` (GenericIPAddressField)
- `user_agent` (CharField)
- `old_values`, `new_values` (JSONField)
- `timestamp` (DateTime, indexed)

**Indexes:** `user`, `action`, `timestamp`

**Uses:** Django's GenericForeignKey for flexible object reference

### DailyReport Model
Daily operational summary KPIs.

**Fields:**
- `id` (UUID, PK)
- `report_date` (DateField, unique, indexed)
- `total_routes`, `completed_routes`, `routes_in_progress`, `routes_pending` (PositiveIntegerField)
- `total_planned_stops`, `total_completed_stops`, `total_skipped_stops` (PositiveIntegerField)
- `total_notices_issued`, `total_tickets_created` (PositiveIntegerField)
- `on_time_completion_rate` (DecimalField, %)
- `agent_count`, `avg_stops_per_agent` (PositiveIntegerField, DecimalField)
- `created_at`, `updated_at` (DateTime)

### OutletPerformance Model
Period-based outlet compliance metrics.

**Fields:**
- `id` (UUID, PK)
- `outlet` (FK to Outlet)
- `report_period_start`, `report_period_end` (DateField, indexed)
- `scheduled_visits`, `completed_visits`, `skipped_visits` (PositiveIntegerField)
- `visit_completion_rate` (DecimalField, %)
- `notice_count` (PositiveIntegerField)
- `repeated_violations` (Boolean)
- `notes` (TextField)
- `created_at`, `updated_at` (DateTime)

**Unique Together:** `(outlet, report_period_start, report_period_end)`

### AgentPerformance Model
Field agent productivity and compliance metrics.

**Fields:**
- `id` (UUID, PK)
- `agent` (FK to User)
- `report_period_start`, `report_period_end` (DateField, indexed)
- `assigned_routes`, `completed_routes` (PositiveIntegerField)
- `route_completion_rate` (DecimalField, %)
- `assigned_stops`, `completed_stops`, `skipped_stops` (PositiveIntegerField)
- `avg_visit_duration` (DurationField, optional)
- `issues_reported`, `tickets_created` (PositiveIntegerField)
- `on_time_rate` (DecimalField, %)
- `notes` (TextField)
- `created_at`, `updated_at` (DateTime)

**Unique Together:** `(agent, report_period_start, report_period_end)`

---

## Relationship Diagram

```
User
├── is_manager_for ──→ Team
├── is_member_of ←── Team
├── manages ──→ Outlet (optional)
├── is_outlet_manager_for ──→ Outlet (1-to-1, optional)
├── creates ──→ RouteTemplate (field agents)
├── has ──→ Shift
├── has ──→ Visit
├── has ──→ GPSLog
├── creates ──→ Notice
├── reports ──→ MaintenanceTicket
└── has ──→ AuditLog

Outlet
├── has_category → OutletCategory
├── has ──→ RouteStop (multiple templates)
├── has ──→ Visit (multiple routes/dates)
├── has ──→ Notice (violations)
├── has ──→ LegacyNotice (historical)
└── has ──→ MaintenanceTicket

RouteTemplate
├── has ──→ RouteStop (ordered)
├── generates ──→ DailyRoute
└── has ──→ Shift

DailyRoute
├── has ──→ Visit (one per outlet)
└── has ──→ Shift

Shift
└── has ──→ GPSLog (3-minute intervals)

Visit
└── triggers ──→ Notice (optional)

MaintenanceTicket
└── belongs_to ──→ MaintenanceCategory
```

---

## Database Constraints & Indexes

**Unique Constraints:**
- User email
- Outlet name per category
- RouteTemplate name per agent
- RouteStop (template, outlet) pair
- DailyRoute (template, date) pair
- Visit (daily_route, outlet) pair
- OutletPerformance (outlet, start_date, end_date) tuple
- AgentPerformance (agent, start_date, end_date) tuple
- MaintenanceTicket ticket_number

**Indexes (Performance):**
- User: email, role, is_active
- Outlet: name, category, is_active, (lat/lon)
- DailyRoute: route_date, assigned_agent, status
- Visit: daily_route, outlet, agent, status, check_in_time
- GPSLog: agent, shift, timestamp, created_at
- Notice: outlet, notice_type, priority, send_status, issued_at
- MaintenanceTicket: ticket_number, category, priority, status, created_at
- AuditLog: user, action, timestamp

---

## Notes for API Implementation

1. **Serializers needed:** Create ModelSerializer for each model
2. **ViewSets needed:** Override `get_queryset()` for filtered access (users see own data only)
3. **Permissions needed:** Custom permission classes for role-based access
4. **Pagination:** Use default pagination (20 items per page configurable)
5. **Search/Filter:** Support filtering by dates, status, user, outlet
6. **Timestamps:** All models return `created_at` and `updated_at` in responses
7. **Soft deletes:** Consider adding soft delete for audit trail (not implemented in MVP)
