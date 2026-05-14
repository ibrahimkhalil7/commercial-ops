# Product Readiness Checklist

This checklist is the practical "go-live" path for Commercial Ops.

## 1) Clean frontend
- Keep all API calls routed through `frontend/src/services/httpClient.js` for consistent auth headers and error handling.
- Keep route-level access control in `frontend/src/App.jsx` + `frontend/src/utils/ProtectedRoutes.jsx`.
- Verify login redirects by role:
  - admin/manager -> `/`
  - field_agent -> `/agent`
  - outlet_manager -> `/outlet`

## 2) Clean backend
- Health endpoint: `GET /api/health/` checks API + DB reachability.
- JWT auth endpoints:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`
- Domain APIs segmented by app (`users`, `outlets`, `routes`, `visits`, `notices`, `maintenance`, `reporting`).

## 3) Database accessibility
- Default local DB is SQLite via `DATABASE_ENGINE=django.db.backends.sqlite3`.
- Production-ready Postgres can be enabled through env vars in `backend/config/settings.py`.
- Health check confirms runtime DB connectivity before rollout.

## 4) Clear user journey
1. User signs in from `/login`.
2. JWT is issued and stored.
3. User profile is fetched from `/api/users/me/`.
4. App redirects user to role dashboard.
5. User can access only role-authorized routes.

## 5) Release gate (minimum)
- Backend: `python manage.py check`
- Backend: `python manage.py test` (if test suite exists)
- Frontend: `npm run build`
- Smoke test:
  - `GET /api/health/` -> 200 + `{"status":"ok"...}`
  - Login and redirect by each role
