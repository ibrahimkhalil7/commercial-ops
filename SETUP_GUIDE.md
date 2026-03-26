# Commercial Operations Platform - Complete Setup Guide

This guide walks you through setting up the complete commercial operations platform with both backend (Django) and frontend (React) applications.

## Project Structure

```
commercial-ops/
├── backend/              # Django REST Framework backend
├── frontend/             # React + Vite frontend
└── document/            # Documentation and specifications
```

## Prerequisites

- **Python 3.9+** (for Django backend)
- **Node.js 16+** and npm (for React frontend)
- **PostgreSQL 12+** (for database)
- **Git**

## Backend Setup (Django)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=commercial_ops
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE commercial_ops;
CREATE USER ops_user WITH PASSWORD 'your_password';
ALTER ROLE ops_user SET client_encoding TO 'utf8';
ALTER ROLE ops_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ops_user SET default_transaction_deferrable TO on;
ALTER ROLE ops_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE commercial_ops TO ops_user;
\q
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 8. Load Sample Data (Optional)

```bash
python manage.py loaddata initial_data.json
```

### 9. Start Development Server

```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Django Admin Panel

Access the admin panel at `http://localhost:8000/admin/` with your superuser credentials.

**Available Models:**
- Users, Teams, Roles
- Outlets, Categories
- Routes, Stops, Daily Routes
- Visits, GPS Logs
- Notices, Maintenance Tickets
- Reporting & Auditing

### API Documentation

API endpoints are available at `http://localhost:8000/api/` once the backend is running.

Key endpoints:
- `POST /api/auth/token/` - User login
- `GET /api/users/me/` - Current user info
- `GET /api/users/` - List users
- `GET /api/outlets/` - List outlets
- `GET /api/routes/` - List routes
- And many more...

Refer to `MODELS_REFERENCE.md` in the backend directory for complete API documentation.

## Frontend Setup (React)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Configuration

The Vite development server is configured to proxy API requests to `http://localhost:8000`. No additional configuration needed if your backend is on localhost:8000.

To change the API endpoint, edit `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': 'http://your-backend-url:8000'
  }
}
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Testing the Complete System

### 1. Verify Both Servers are Running

**Backend:**
```bash
curl http://localhost:8000/api/users/
```

**Frontend:**
Open `http://localhost:5173` in your browser

### 2. Login with Test Credentials

The system includes test users:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Manager | manager@elgouna.com | password | / (Manager Dashboard) |
| Field Agent | agent@elgouna.com | password | /agent (Field Agent Dashboard) |
| Outlet Manager | outlet@example.com | password | /outlet (Outlet Manager Portal) |

**Note:** These test users must be created via Django admin or management commands first.

### 3. Create Test Users via Django Admin

1. Go to `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. Navigate to Users section
4. Create test users with the emails and roles above

### 4. Test Role-Based Access

1. Login as different users
2. Verify you're redirected to the correct dashboard
3. Try accessing other role's dashboards (should show "Access Denied")

### 5. Test Logout

Click the user profile dropdown in the header and select "Logout" to return to the login page.

## Environment-Specific Configuration

### Development (Local)

```bash
# Backend
export DEBUG=True
export DATABASE_HOST=localhost

# Frontend
npm run dev
```

### Production

```bash
# Backend
export DEBUG=False
export ALLOWED_HOSTS=yourdomain.com
export CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
npm run build
# Deploy dist/ to your web server
```

## Troubleshooting

### Backend Issues

#### Database Connection Error
```
Error: could not connect to server: Connection refused
```

**Solution:** Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Windows (if installed as service)
net start postgresql
```

#### Migration Errors
```bash
# Reset migrations (development only)
python manage.py migrate zero
python manage.py migrate
```

#### Port Already in Use
```bash
# Change port
python manage.py runserver 8001
```

### Frontend Issues

#### CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:** Ensure Django settings include your frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

#### API 404 Errors
1. Verify backend is running: `http://localhost:8000/api/`
2. Check that endpoint exists in `urls.py`
3. Verify JWT token is being sent with requests

#### Blank Page After Login
1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify API responses contain `user` object with `role` field

### Database Issues

#### Reset Database (Development Only)
```bash
# Drop and recreate database
psql -U postgres -d postgres -c "DROP DATABASE commercial_ops;"
psql -U postgres -d postgres -c "CREATE DATABASE commercial_ops;"

# Re-run migrations
python manage.py migrate
python manage.py createsuperuser
```

## Project Statistics

### Backend
- **Frameworks:** Django 4.2.8, Django REST Framework 3.14.0
- **Models:** 25 across 7 apps
- **Endpoints:** 30+ REST API endpoints
- **Authentication:** JWT (djangorestframework-simplejwt)
- **Database:** PostgreSQL

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Pages:** 4 (Login + 3 Dashboards)
- **Components:** 4 (Header, Sidebar, DashboardLayout, AuthLayout)
- **Styling:** Tailwind CSS with 200+ utility classes
- **Routing:** React Router v6 with role-based protection

## Next Steps

### Phase 2 Development (Backend APIs)
- [ ] Create DRF Serializers for all models
- [ ] Implement ViewSets and REST endpoints
- [ ] Add custom permission classes
- [ ] Create API tests
- [ ] Document API with Swagger/OpenAPI

### Phase 3 Development (Frontend Features)
- [ ] Implement route/visit management pages
- [ ] Add GPS tracking and mapping
- [ ] Create notice management interface
- [ ] Implement maintenance ticket workflow
- [ ] Add reporting and analytics
- [ ] Implement real-time notifications

### DevOps & Deployment
- [ ] Set up Docker containers
- [ ] Configure production database
- [ ] Set up CI/CD pipeline
- [ ] Deploy to cloud platform (AWS/Azure/GCP)
- [ ] Configure load balancing
- [ ] Set up monitoring and logging

## Documentation Links

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/FRONTEND_README.md)
- [Models Reference](./backend/MODELS_REFERENCE.md)
- [Backend Quickstart](./backend/QUICKSTART.md)
- [Backend Summary](./backend/BACKEND_SUMMARY.md)

## Support & Contact

For questions or issues:
1. Check the troubleshooting section above
2. Review the backend README and API documentation
3. Check browser console for JavaScript errors
4. Check Django server logs for backend errors

## License

© 2024 Commercial Operations Platform. All Rights Reserved.
