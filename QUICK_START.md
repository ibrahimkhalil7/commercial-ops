# Quick Start - Backend and Frontend Running

## ✅ Backend Status
The Django backend is now running on **http://localhost:8000**

### What's Running:
- Django development server on port 8000
- SQLite database (db.sqlite3)
- REST API endpoints ready
- Django admin panel at http://localhost:8000/admin

### Database Info:
- Type: SQLite (for local development)
- File: `backend/db.sqlite3`
- All core Django apps initialized

---

## ⚠️ Frontend Setup - Node.js Required

Your system is missing **Node.js**. You need to install it to run the React frontend.

### Step 1: Install Node.js

#### Option A: Download from nodejs.org (Recommended)
1. Visit: https://nodejs.org/
2. Download the **LTS version** (Long Term Support)
3. Run the installer and follow all prompts
4. Restart your terminal / VS Code

#### Option B: Use Chocolatey (if installed)
```powershell
choco install nodejs
```

#### Option C: Use Windows Package Manager
```powershell
winget install OpenJS.NodeJS
```

### Step 2: Verify Installation
After installing Node.js, open a NEW PowerShell terminal and run:

```powershell
node --version
npm --version
```

Both should return version numbers (e.g., `v20.10.0`, `10.0.0`)

---

## Step 3: Install Frontend Dependencies

Once Node.js is installed:

```powershell
cd "d:\OneDrive - OrascomDH\Users\ibrahim.amr\Desktop\commercial-ops\frontend"
npm install --legacy-peer-deps
```

This will install all React dependencies (will take 1-2 minutes).

---

## Step 4: Run the Frontend

After npm install completes:

```powershell
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## Testing the Complete System

Once both are running (Backend on :8000, Frontend on :5173):

### Option 1: Test Login Page
1. Open http://localhost:5173/login
2. You'll see the login form
3. (Currently no test users - see next section)

### Option 2: Create a Test User via Django Admin
1. Open http://localhost:8000/admin
2. Note: Django default User model is temporarily active
3. Create a superuser via the admin panel or shell

---

## Troubleshooting

### Node.js still not recognized after installation
- Close ALL terminal/PowerShell windows
- Reopen VS Code
- Try again (Windows needs to reload PATH environment variables)

### npm install fails with version conflicts
- Clear npm cache: `npm cache clean --force`
- Try: `npm install --legacy-peer-deps` again

### Frontend can't connect to backend
- Verify backend is running: http://localhost:8000/api/
- Check Vite proxy in `frontend/vite.config.js` (set to http://localhost:8000)

### Port already in use
- Backend: Change `python manage.py runserver 0.0.0.0:8001`
- Frontend: Vite will auto-detect next available port

---

## Next Steps

1. ✅ Install Node.js
2. ✅ Run `npm install` in frontend directory
3. ✅ Run `npm run dev` to start frontend
4. ✅ Visit http://localhost:5173
5. ✅ Create test users via Django admin panel
6. ✅ Test login and role-based routing

---

## File Locations

- **Backend**: `d:\OneDrive - OrascomDH\Users\ibrahim.amr\Desktop\commercial-ops\backend`
- **Frontend**: `d:\OneDrive - OrascomDH\Users\ibrahim.amr\Desktop\commercial-ops\frontend`
- **Backend Database**: `backend/db.sqlite3`
- **Backend Settings**: `backend/config/settings.py`
- **Frontend Config**: `frontend/vite.config.js`

---

## Environment Setup Complete ✅

Once Node.js is installed and both servers are running:
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/
- Frontend App: http://localhost:5173
- Login Page: http://localhost:5173/login

**Total setup time: ~5-10 minutes** (mostly waiting for npm install)

