# Backend - Local Development

Quick notes for local development and troubleshooting.

Setup (recommended):

1. Create and activate a Python virtualenv in the project root:

```powershell
python -m venv .venv
& .venv\Scripts\Activate.ps1
```

2. Install minimal requirements (recommended for local dev on Windows):

```powershell
python -m pip install -r backend/requirements-minimal.txt
```

3. Optional: install full requirements on a platform with build tools (Linux/macOS or Windows with appropriate build toolchain):

```powershell
python -m pip install -r backend/requirements.txt
```

Notes:
- The repository contains a small `backend/PIL/__init__.py` stub to allow Django to start without the `Pillow` binary on Windows development machines. This is strictly a local-dev convenience; install the real `Pillow` package in production or CI.
- `psycopg2-binary` installation is skipped on Windows in `requirements.txt` to avoid needing `pg_config`. Use Postgres in deployments with the appropriate dependency installed.

Running locally:

```powershell
# apply migrations (sqlite default)
python backend\manage.py migrate
# start server
python backend\manage.py runserver

Deployment (Docker)
-------------------

1. Create a `.env` file from the repository root using `.env.example` and fill production values.

2. Build the backend Docker image (from project root):

```bash
docker build -t commercial-ops-backend -f backend/Dockerfile .
```

3. Run the container (example, using Postgres and Redis services):

```bash
docker run --rm -p 8000:8000 --env-file .env --name commercial-ops-backend commercial-ops-backend
```

4. The container runs migrations and starts `gunicorn` serving the application on port 8000.

Notes:
- The Dockerfile installs full `requirements.txt` and requires system libraries to build `Pillow` and `psycopg2`.
- The repo contains a local `backend/PIL/__init__.py` stub used for Windows local dev. CI and the Dockerfile remove this stub before installing the real `Pillow` package so production uses real image handling.

```# Commercial Operations Platform - Django Backend

A production-ready Django REST Framework backend for a commercial field operations platform with route management, field agent tracking, outlet management, and operational oversight.

## Features

- **Custom User Authentication**: Role-based access control (Admin, Manager, Field Agent, Outlet Manager)
- **Route Planning**: Recurring route templates with daily route generation
- **Field Operations**: Shift tracking, outlet check-ins, 3-minute GPS location logging
- **Issue Management**: Warning/fine notices, maintenance ticket creation
- **Real-time Tracking**: Near-live field agent visibility and route trails
- **Reporting**: Comprehensive audit logs and performance analytics
- **Email Notifications**: Automated email dispatch for notices and tickets

## Prerequisites

- Python 3.10–3.12 (recommended; 3.14 is not yet supported by all dependencies)
- PostgreSQL 12+
- Redis (for Celery task queue)

## Installation

### 1. Create and Activate Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your settings (database, email, API keys, etc.)
```

### 4. Run Database Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

Server will be available at `http://localhost:8000`

### 7. Access Admin Interface

Navigate to `http://localhost:8000/admin` and log in with your superuser credentials.


## Troubleshooting

### `ModuleNotFoundError: No module named 'rest_framework'`

This means your current Python environment does not have backend dependencies installed (or you are running Django with a different interpreter than the one where dependencies were installed).

1. Activate the same virtual environment you intend to run Django with.
2. Upgrade installer tooling:

```bash
python -m pip install --upgrade pip setuptools wheel
```

3. Install backend dependencies:

```bash
python -m pip install -r requirements.txt
```

4. Verify Django REST Framework is installed in that environment:

```bash
python -m pip show djangorestframework
```

5. Confirm the interpreter path used by Django:

```bash
python -c "import sys; print(sys.executable)"
```

If you are on Python 3.14 and still have install/runtime issues, recreate the venv using Python 3.11 or 3.12, then reinstall requirements.

## Project Structure

```
backend/
├── config/
│   ├── settings.py          # Django settings (PostgreSQL, JWT, CORS, etc.)
│   ├── urls.py              # Main URL routing
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application (for async)
├── apps/
│   ├── users/               # User authentication and roles
│   │   ├── models.py        # User and Team models
│   │   ├── admin.py         # Django admin interface
│   │   └── urls.py          # API endpoints
│   ├── outlets/             # Outlet master data
│   │   ├── models.py        # Outlet, Category, LegacyNotice
│   │   └── admin.py
│   ├── routes/              # Route planning and execution
│   │   ├── models.py        # RouteTemplate, RouteStop, DailyRoute
│   │   └── admin.py
│   ├── visits/              # Field visits and GPS tracking
│   │   ├── models.py        # Shift, Visit, GPSLog
│   │   └── admin.py
│   ├── notices/             # Warning/fine notifications
│   │   ├── models.py        # Notice (with email dispatch)
│   │   └── admin.py
│   ├── maintenance/         # Maintenance ticketing
│   │   ├── models.py        # MaintenanceCategory, MaintenanceTicket
│   │   └── admin.py
│   └── reporting/           # Analytics and audit logs
│       ├── models.py        # AuditLog, DailyReport, Performance metrics
│       └── admin.py
├── manage.py                # Django management command
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Data Models Overview

### Users & access Control
- **User**: Custom user model with role-based permissions
- **Team**: Operational grouping for field teams

### Outlets & Master Data
- **Outlet**: Outlet master record with location and contact details
- **OutletCategory**: Outlet classification
- **LegacyNotice**: Historical warning/fine import

### Routes & Execution
- **RouteTemplate**: Recurring route definition with scheduled stops
- **RouteStop**: Individual stop in a route template
- **DailyRoute**: Daily route instance (generated from template)

### Field Operations
- **Shift**: Field agent work shift (controls location tracking)
- **Visit**: Outlet check-in/check-out record with proximity validation
- **GPSLog**: 3-minute location updates during active shifts

### Notifications & Issues
- **Notice**: Warning/fine issued to outlet (with email notification)
- **MaintenanceCategory**: Ticket category and routing
- **MaintenanceTicket**: Infrastructure/public-realm issue report

### Reporting & Analytics
- **AuditLog**: Complete audit trail of all important actions
- **DailyReport**: Daily operational summary KPIs
- **OutletPerformance**: Period-based outlet compliance metrics
- **AgentPerformance**: Field agent productivity and compliance

## Key Database Features

- **PostgreSQL-Ready**: Optimized for PostgreSQL with proper indexing
- **UUID Primary Keys**: Uses UUIDs instead of integers for better security
- **Timestamps**: All records include `created_at` and `updated_at`
- **Foreign Key Relationships**: Proper relationships with ON_DELETE protection
- **Database Indexes**: Strategic indexes on frequently queried fields
- **Unique Constraints**: Business logic constraints (e.g., one visit per outlet per route)

## User Roles & Permissions

### Admin
- Full system access
- User and team management
- System configuration

### Manager
- Team and agent management
- Dashboard and analytics
- Route template management
- Notice and ticket overview

### Field Agent
- Route execution
- Check-in/check-out
- Issue and ticket creation
- Location tracking (3-minute intervals during shift)

### Outlet Manager (External)
- Limited to assigned outlet(s)
- View notices and violation history
- Update contact details
- No dispute or payment capabilities

## API Authentication

Uses JWT (JSON Web Tokens) with `djangorestframework-simplejwt`:

```bash
POST /api/auth/token/
- Request: {"email": "user@elgouna.com", "password": "..."}
- Response: {"access": "token...", "refresh": "token..."}

POST /api/auth/token/refresh/
- Request: {"refresh": "token..."}
- Response: {"access": "new_token..."}
```

## Configuration

### Important Settings in `.env`

```
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=commercial_ops
DATABASE_USER=postgres
DATABASE_PASSWORD=...
DATABASE_HOST=localhost

STAFF_EMAIL_DOMAIN=elgouna.com  # Restrict staff login to this domain
GPS_UPDATE_INTERVAL_SECONDS=180  # 3 minutes for location tracking
GPS_PROXIMITY_RADIUS_METERS=100  # Proximity validation for check-ins

EMAIL_HOST=smtp.gmail.com        # For notice/ticket notifications
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...

DEBUG=False                       # Always False in production
SECRET_KEY=...                    # Change in production
ALLOWED_HOSTS=...
CORS_ALLOWED_ORIGINS=...
```

## Deployment

### Using Gunicorn & Nginx

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Using Docker

A Dockerfile and docker-compose.yml can be generated for containerized deployment.

## Testing

Run Django tests:

```bash
python manage.py test
```

Run specific app tests:

```bash
python manage.py test apps.routes
```

## Maintenance & Operations

### Clear Expired Tokens

```bash
python manage.py flushexpiredtokens
```

### Generate Daily Reports

```bash
python manage.py generate_daily_report
```

(Can also be automated with Celery beat scheduler)

## Next Steps

1. **Generate Serializers**: Create DRF serializers for all models
2. **Implement ViewSets**: Create viewsets and views with proper permissions
3. **Add Search & Filtering**: Add search filters for manager dashboard
4. **Implement Celery Tasks**: Background jobs for daily report generation, email retry logic
5. **Add Tests**: Unit tests and integration tests for all endpoints
6. **Frontend Integration**: Connect React frontend for manager/field interfaces

## Security Notes

- ✓ Uses Django's built-in password hashing
- ✓ CSRF protection enabled
- ✓ SQL injection prevention (ORM only)
- ✓ User permission checks on all endpoints
- ✓ Email domain validation for staff users
- ✓ Secure JWT token handling
- ⚠ Ensure HTTPS in production
- ⚠ Keep SECRET_KEY secure in production
- ⚠ Use environment variables for all sensitive config
- ⚠ Enable SSL/TLS for database connections in production

## Support & Documentation

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

Internal use only - Commercial Operations Platform
