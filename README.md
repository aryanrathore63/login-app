# OTP Based User Login

Three layers: **React (Vite, TS)** frontend, **Express (TS)** API, **Postgres** database.
Live URL: <add after deploy>

## Structure
- `db/schema.sql` database schema
- `backend/` Express API (`/api/register`, `/api/users/check`, `/api/login`, `/api/checkout`)
- `frontend/` React app

## Run locally
1. Create a Postgres DB and run `db/schema.sql` on it.
2. Backend: `cd backend && cp .env.example .env` (edit values) `&& npm install && npm run dev`
3. Frontend: `cd frontend && npm install && npm run dev` -> http://localhost:5173

## Security notes
- 6-digit code from `crypto.randomInt`, stored only as a bcrypt hash, shown once at registration.
- 5 wrong attempts lock the account for 15 minutes.
- Login returns a JWT; checkout links to the user only if the token is valid.

## Deploy
- DB: Supabase/Neon, run `db/schema.sql`.
- API: Render/Railway (root `backend`, build `npm install && npm run build`, start `npm start`). Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (frontend URL), `DB_SSL`.
- Frontend: Vercel (root `frontend`). `frontend/vercel.json` forwards `/api/*` requests to the deployed API, so leave `VITE_API_URL` unset in Vercel. Update that rewrite destination if the API hostname changes.
