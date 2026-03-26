# Quick Start Guide - Django Backend Setup

## 🚀 Getting Started in 5 Steps

### Step 1: Install PostgreSQL (if not already installed)

**Windows:**
Download from https://www.postgresql.org/download/windows/

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

After installation, create a database:
```bash
psql -U postgres
CREATE DATABASE commercial_ops;
\q
```

### Step 2: Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure .env File

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and settings:
```
DATABASE_NAME=commercial_ops
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_HOST=localhost

SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 5: Run Migrations & Start Server

```bash
# Create database tables
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Server will run at: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin**

---

## 📊 Database Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS APP                                │
├─────────────────────────────────────────────────────────────┤
│ User                      Team                              │
│ - id (UUID)              - id (UUID)                        │
│ - email*                 - name*                            │
│ - first_name             - manager (User)                   │
│ - last_name              - members (M2M User)               │
│ - phone                  - is_active                        │
│ - role*                  - created_at, updated_at           │
│ - is_active              │
│ - manager (User)←────────┘
│ - created_at
└─────────────────────────────────────────────────────────────┘
        ↓ manages         ↓ assigns to
        └─────────────────────┐
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  OUTLETS APP                                 │
├──────────────────────────────────────────────────────────────┤
│ OutletCategory      Outlet              LegacyNotice        │
│ - id               - id                 - id                │
│ - name*            - name               - outlet (FK)       │
│ - is_active        - address            - type              │
│                    - lat, lon           - reason            │
│                    - category (FK)      - amount            │
│                    - contact_person     - issued_date       │
│                    - email              - attachment        │
│                    - phone              └────────────────────┘
│                    - assigned_manager
│                    - outlet_manager_user (1-to-1 User)
└──────────────────────────────────────────────────────────────┘
                ↓ assigned to              ↑ visited
        ┌───────┴────────────────────────┐
        ↓                                ↓
┌──────────────────────┐      ┌──────────────────────────┐
│   ROUTES APP         │      │    VISITS APP            │
├──────────────────────┤      ├──────────────────────────┤
│RouteTemplate         │      │ Shift                    │
│ - id                 │      │ - id                     │
│ - name               │      │ - agent (User)           │
│ - zone               │      │ - daily_route (FK)       │
│ - assigned_agent     │      │ - status                 │
│ - recurring_days     │      │ - start_time             │
│ - stops (→)          │      │ - end_time               │
│ - daily_routes (→)   │      │ - created_at             │
│                      │      │                          │
│RouteStop             │      │ Visit                    │
│ - id                 │      │ - id                     │
│ - route_template (FK)│      │ - daily_route (FK)       │
│ - outlet (FK)        │      │ - outlet (FK)            │
│ - stop_order         │      │ - agent (User)           │
│ - notes              │      │ - status                 │
│                      │      │ - check_in_time/lat/lon  │
│DailyRoute            │      │ - check_out_time/lat/lon │
│ - id                 │      │ - within_proximity       │
│ - route_template (FK)│      │ - created_at, updated_at │
│ - route_date*        │      │ - notices (← Notice)     │
│ - assigned_agent     │      │                          │
│ - status             │      │ GPSLog                   │
│ - planned_stops      │      │ - id                     │
│ - completed_stops    │      │ - agent (FK)             │
│ - visits (→)         │      │ - shift (FK)             │
│ - shifts (→)         │      │ - lat, lon               │
└──────────────────────┘      │ - accuracy               │
                              │ - timestamp              │
                              │ - created_at             │
                              └──────────────────────────┘
                                     ↑ triggers
                                     │
┌──────────────────────────────────────────────────────────────┐
│              NOTICES APP                  MAINTENANCE APP    │
├──────────────────────────────────────────┬───────────────────┤
│ Notice                                   │MaintenanceCategory│
│ - id                                     │ - id              │
│ - outlet (FK)                            │ - name*           │
│ - type (warning/fine/violation/notice)   │ - recipient_team  │
│ - reason                                 │ - is_active       │
│ - priority (low/medium/high/urgent)      │                   │
│ - amount                                 │MaintenanceTicket  │
│ - visit (FK, optional)                   │ - id              │
│ - created_by (User)                      │ - ticket_number*  │
│ - evidence_photo, attachment             │ - category (FK)   │
│ - send_status (pending/sent/failed)      │ - outlet (FK)     │
│ - sent_to_emails                         │ - location_*      │
│ - issued_at, updated_at                  │ - description     │
└──────────────────────────────────────────┤ - priority        │
                                           │ - status          │
                                           │ - reported_by     │
                                           │ - evidence_photo  │
                                           │ - assigned_to     │
                                           │ - completed_at    │
                                           │ - created_at      │
                                           └───────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              REPORTING APP                                   │
├──────────────────────────────────────────────────────────────┤
│ AuditLog                  DailyReport        OutletPerf   AgentPerf│
│ - id                      - id               - id         - id      │
│ - user (FK)               - report_date*     - outlet     - agent   │
│ - action*                 - total_routes     - start_date - start_  │
│ - content_type (generic)  - completed_routes - end_date   - end_da  │
│ - object_id               - ...metrics...    - visits     - routes  │
│ - description             - created_at       - completion - stops   │
│ - old_values (JSON)       - updated_at       - notices    - duration│
│ - new_values (JSON)       │                  - notes      - issues  │
│ - timestamp               │                  - ...        - tickets │
│                           │                  │             │
└──────────────────────────┴──────────────────┴─────────────┴────────┘
```

---

## 📁 File Structure Generated

```
backend/
├── config/                     # Django config
│   ├── settings.py            # PostgreSQL, JWT, CORS settings
│   ├── urls.py                # Main URL routing
│   ├── wsgi.py
│   └── asgi.py
├── apps/                       # 7 Django apps
│   ├── users/                 # User models & roles
│   │   ├── models.py          # User, Team
│   │   ├── admin.py           # Admin interfaces
│   │   └── urls.py
│   ├── outlets/               # Outlet management
│   │   ├── models.py          # Outlet, Category, LegacyNotice
│   │   ├── admin.py
│   │   └── urls.py
│   ├── routes/                # Route planning
│   │   ├── models.py          # RouteTemplate, RouteStop, DailyRoute
│   │   ├── admin.py
│   │   └── urls.py
│   ├── visits/                # Field visits & GPS
│   │   ├── models.py          # Shift, Visit, GPSLog
│   │   ├── admin.py
│   │   └── urls.py
│   ├── notices/               # Warning/fines
│   │   ├── models.py          # Notice
│   │   ├── admin.py
│   │   └── urls.py
│   ├── maintenance/           # Maintenance tickets
│   │   ├── models.py          # MaintenanceCategory, Ticket
│   │   ├── admin.py
│   │   └── urls.py
│   └── reporting/             # Analytics & audit
│       ├── models.py          # AuditLog, DailyReport, Performance
│       ├── admin.py
│       └── urls.py
├── manage.py                   # Django CLI
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # Full documentation
└── MODELS_REFERENCE.md         # Detailed model docs
```

---

## 🗄️ Models Summary (25 Total)

| App | Models | Purpose |
|-----|--------|---------|
| **users** | User, Team | Authentication, role-based access |
| **outlets** | Outlet, Category, LegacyNotice | Master outlet data & history |
| **routes** | RouteTemplate, RouteStop, DailyRoute | Route planning & execution |
| **visits** | Shift, Visit, GPSLog | Field operations & location tracking |
| **notices** | Notice | Warning/fine notifications |
| **maintenance** | Category, MaintenanceTicket | Issue tracking & dispatch |
| **reporting** | AuditLog, DailyReport, OutletPerf, AgentPerf | Analytics & audit trail |

---

## 🔑 User Roles

1. **Admin** - Full system access
2. **Manager** - Team, routes, analytics
3. **Field Agent** - Route execution, check-ins, issues
4. **Outlet Manager** - External user, view notices only

---

## 🔐 Security Features

✅ Custom User model (not Django's default)  
✅ Role-based access control  
✅ Email domain validation (staff only)  
✅ JWT token authentication  
✅ HTTPS/SSL ready  
✅ CORS configuration  
✅ SQL injection prevention (ORM)  
✅ CSRF protection  
✅ Password hashing (PBKDF2)  
✅ Audit trail for all actions  

---

## 🧪 Testing Models

Once server is running, test via Django admin or interactive shell:

```bash
# Start Django shell
python manage.py shell

# Create a test user
from apps.users.models import User
user = User.objects.create_user(
    email='test@elgouna.com',
    password='testpass123',
    first_name='Test',
    last_name='User',
    role='manager'
)

# Create an outlet
from apps.outlets.models import Outlet, OutletCategory
category = OutletCategory.objects.create(name='Retail')
outlet = Outlet.objects.create(
    name='Test Outlet',
    category=category,
    address='123 Main St',
    latitude=30.0000,
    longitude=31.0000
)

print(user, outlet)
```

---

## 📝 Next Steps for Full Implementation

1. **Serializers** - DRF ModelSerializers for each model
2. **ViewSets** - READ + CREATE + UPDATE + DELETE endpoints
3. **Permissions** - Role-based permission classes
4. **Tests** - Unit & integration tests
5. **Celery Tasks** - Background jobs (daily report gen, email retry)
6. **Frontend API** - Connect React dashboard
7. **Deployment** - Docker, Gunicorn, Nginx config
8. **Monitoring** - Sentry error tracking, logging setup

---

## 🆘 Troubleshooting

**PostgreSQL connection error:**
```bash
# Check PostgreSQL is running and database exists
psql -U postgres -l | grep commercial_ops
```

**"No such table" error:**
```bash
# Re-run migrations
python manage.py migrate
```

**ImportError for apps:**
```bash
# Ensure apps/__init__.py exists and INSTALLED_APPS in settings.py
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

---

## 📚 Useful Commands

```bash
# Run migrations
python manage.py migrate

# Create super user
python manage.py createsuperuser

# Create migrations for model changes
python manage.py makemigrations

# Run shell (interactive Python with Django)
python manage.py shell

# Run tests
python manage.py test

# See current database schema
python manage.py sqlmigrate [app] [migration_num]

# Backup data
python manage.py dumpdata > backup.json

# Load backup
python manage.py loaddata backup.json
```

---

Enjoy building! 🎉
