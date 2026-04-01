# El Gouna Commercial Ops MVP Deployment + Expo Go

## Free stack used
- **Frontend:** Vercel (free `.vercel.app` URL).
- **Backend:** Render Web Service (free `.onrender.com` URL).
- **Mobile access:** Expo Go wrapper app (`expo-wrapper`) loading the deployed frontend URL.

## 1) Backend deployment (Render)
1. Push repository to GitHub.
2. In Render, create a **Web Service** from this repo.
3. Set root directory to `backend`.
4. Render can auto-read `backend/render.yaml`, or you can configure manually:
   - Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
5. Add environment variables from `backend/.env.example`.
6. Create a PostgreSQL database on Render (free tier), and map DB vars.
7. After first deploy, create an admin user:
   - Open Render shell: `python manage.py createsuperuser`

## 2) Frontend deployment (Vercel)
1. Import the repository to Vercel.
2. Set root directory to `frontend`.
3. Framework preset: **Vite**.
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend>.onrender.com/api`
5. Deploy.
6. Verify login/network calls hit the Render backend URL.

## 3) Cross-origin + security env values
Use these backend env vars with your real URLs:
- `ALLOWED_HOSTS=.onrender.com`
- `CSRF_TRUSTED_ORIGINS=https://*.onrender.com,https://*.vercel.app`
- `CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`
- `CORS_ALLOW_ALL_ORIGINS=False`

## 4) Expo Go wrapper setup
1. Open `expo-wrapper/.env.example` and create `.env`:
   - `EXPO_PUBLIC_PORTAL_URL=https://<your-frontend>.vercel.app`
2. Install dependencies:
   - `cd expo-wrapper && npm install`
3. Start wrapper:
   - `npm run start`
4. Scan QR code in Expo Go app.

## 5) Production sanity checks
- Login with all roles from mobile + web.
- Create outlet and verify category dropdown populates.
- Create notice/incident/ticket with manager account.
- Confirm outlet manager can see notices in Overview and Notices pages.
