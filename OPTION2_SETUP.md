# Option 2: Build Frontend as Static Files - Complete Setup Guide

This approach builds the React frontend once to a `dist/` folder, then serves it directly from Django. **After the initial build, only Django runs - no Node.js needed.**

## How It Works

```
┌─────────────────────┐
│   Build Phase       │  One time: npm install + npm run build
│   (Node.js needed)  │
└──────────┬──────────┘
           │
           ▼
     ┌──────────────┐
     │ dist/ folder │  Contains compiled React app
     └──────┬───────┘
            │
            ▼
    ┌─────────────────┐
    │ Django copies   │  dist/ → backend/static/
    │ to /static/     │
    └────────┬────────┘
             │
             ▼
      ┌────────────────────┐
      │ Single Django      │  Runs forever
      │ server on :8000    │  Serves everything
      └────────────────────┘
```

---

## Setup Options

### **Option A: Automatic Build Script (RECOMMENDED)** ⭐

**For Windows:**
```powershell
# Just run this one command:
.\build.bat
```

**For Mac/Linux:**
```bash
# Make it executable first
chmod +x build.sh

# Then run it
./build.sh
```

**What it does automatically:**
1. ✅ Checks if Node.js is installed
2. ✅ Installs frontend dependencies (`npm install`)
3. ✅ Builds React to `dist/` (`npm run build`)
4. ✅ Copies `dist/` → `backend/static/`
5. ✅ Runs Django migrations
6. ✅ Starts Django server on http://localhost:8000

**That's it!** Everything runs from one command.

---

### **Option B: Docker (No Node.js or Python Needed)** 🐳

If you don't have Node.js OR Python:

```bash
docker-compose up --build
```

Docker automatically handles:
- Building React in a container
- Running Django in a container
- Serving on http://localhost:8000

---

### **Option C: Manual Steps**

If you want to do it manually:

#### Step 1: Build Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

#### Step 2: Copy to Django
```bash
# Copy dist/ to backend/static/
mkdir -p backend/static
cp -r frontend/dist/* backend/static/
```

#### Step 3: Run Django
```bash
cd backend
./venv/Scripts/activate  # Windows: venv\Scripts\activate.bat
python manage.py migrate
python manage.py runserver
```

---

## After Setup

Once running, access the app:

| Component | URL |
|-----------|-----|
| **Frontend App** | http://localhost:8000 |
| **Login Page** | http://localhost:8000/login |
| **Manager Dashboard** | http://localhost:8000/ |
| **Field Agent** | http://localhost:8000/agent |
| **Outlet Portal** | http://localhost:8000/outlet |
| **Django Admin** | http://localhost:8000/admin |
| **API** | http://localhost:8000/api/ |

---

## Project Structure After Build

```
commercial-ops/
├── backend/
│   ├── static/                 ← React dist/ copied here
│   │   ├── index.html         ← Served for all routes
│   │   ├── assets/            ← JS, CSS bundles
│   │   └── ...
│   ├── venv/
│   ├── config/
│   ├── apps/
│   ├── manage.py
│   └── db.sqlite3
├── frontend/
│   ├── dist/                   ← Built React app
│   ├── src/
│   ├── node_modules/          ← Only after npm install
│   └── ...
├── build.bat                   ← Windows build script
├── build.sh                    ← Linux/Mac build script
└── docker-compose.yml          ← Docker setup
```

---

## How Django Serves React

**File: `backend/config/urls.py`**

The catch-all route at the bottom:
```python
# Matches any URL that's not /api/ or /admin/ or /static/
re_path(r'^(?!api/)(?!admin/)(?!static/).*$', 
        TemplateView.as_view(template_name='index.html'), 
        name='react_app'),
```

This means:
- `/login` → serves `static/index.html` → React Router handles it
- `/agent` → serves `static/index.html` → React Router handles it
- `/api/users/` → **NOT** caught, goes to Django API
- `/admin/` → **NOT** caught, goes to Django admin
- `/static/` → **NOT** caught, serves static assets

React Router in the frontend handles all navigation client-side.

---

## Rebuilding Frontend

If you change React code:

### Option A: Use build script again
```bash
./build.bat
```

### Option B: Manual rebuild
```bash
cd frontend
npm run build
cd ..
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/
cd backend
# Restart Django (Ctrl+C, then run again)
python manage.py runserver
```

### Option C: Docker rebuild
```bash
docker-compose up --build
```

---

## Advantages of This Approach

✅ **No Node.js after build** - Only Django needed to run  
✅ **Single server** - One port (8000), easier to deploy  
✅ **Better performance** - Compiled/minified React  
✅ **Easy deployment** - Just copy folder to server  
✅ **Docker-ready** - Containerizes perfectly  
✅ **Database changes** - Still run Django migrations  
✅ **API updates** - Still make Django changes  

---

## Troubleshooting

### Routes not working after rebuild
```bash
# Clear Django cache and restart
rm -rf backend/db.sqlite3
cd backend
python manage.py migrate
python manage.py runserver
```

### Static files not loading (CSS/JS disappear)
```bash
# Collect static files
cd backend
python manage.py collectstatic --noinput
python manage.py runserver
```

### "npm not found" error on build script
Install Node.js from https://nodejs.org/ or use Docker:
```bash
docker-compose up --build
```

### Build script gets stuck
Press Ctrl+C and check:
1. Node.js installed: `node --version`
2. npm installed: `npm --version`
3. Try again: `./build.bat` (Windows) or `./build.sh` (Linux/Mac)

---

## Environment Variables

Create `backend/.env` if needed:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## Production Deployment

For production, add to your server:

1. Build locally first (or in CI/CD)
2. Copy `backend/static/` to server
3. Set `DEBUG=False` in `.env`
4. Use Gunicorn instead of runserver:

```bash
cd backend
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

---

## Summary

**Quickest Start:** 
```bash
./build.bat        # Windows
./build.sh          # Linux/Mac
```

**With Docker:**
```bash
docker-compose up --build
```

**Manual:**
```bash
cd frontend && npm install --legacy-peer-deps && npm run build
cd ../backend
cp -r ../frontend/dist/* static/
python manage.py migrate
python manage.py runserver
```

Then visit: **http://localhost:8000** ✅

