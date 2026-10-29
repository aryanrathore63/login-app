# Prompts used while building this app

## Prompt 1

### Prompt:

I got a take-home assignment for a Backend Development role called "OTP Based User Login" (PDF attached). The requirements are:

Requirements

Build a web application with two flows:

1. Registration flow
   - Collect the user's email address, first name and last name, and register them
   - On success, generate a random 6-digit numeric code and show it to the user, because they need it to log in later
2. User recognition and login flow
   - A checkout form that collects email address, phone number and shipping address
   - As the user types, validate in real time that the email is complete and well-formed. Once it is, run a recognition check in the background while the user keeps filling out the form
   - If the email matches a registered user, show a modal asking for their numeric code, with an option to skip the login and go back to the form
   - Validate the code against the one issued at registration. On a match, log the user in and close the modal. On a mismatch, show an error inside the modal
   - Once logged in, show the user's name at the top of the checkout form
   - Submitting the form should just record the data in a database table (no real payment)
3. Deploy the app publicly, push the code to GitHub (give access to the boltapp-hiring user), check the database schema in as .sql files, and include a prompts.md listing every prompt I gave to an LLM

The frontend, API and database must be separate layers. The recommended stack is TypeScript, React, Go and Postgres, but any stack is allowed. I have 2 days.

In this assignment, what do I have to do, and which tech stack is best? I was thinking Node.js and Express for the backend and React for the frontend. The job description lists these skills: Algorithms, C, Data Structures, Golang, Java, Node.js, Python, Flask, Hibernate, Spring (Backend Development).

### Response:

# Understanding the Assignment and Choosing a Stack

## What needs to be built

A small web app with three separate layers (frontend, API, database):

1. **Registration page**: collect email, first name and last name, save the user, generate a random 6-digit code and show it once.
2. **Checkout form** with email, phone and shipping address:
   - Validate the email format live as the user types.
   - Once the email is valid, check in the background whether it belongs to a registered user, while the user keeps filling in the form.
   - If it matches, show a modal asking for the 6-digit code, with a "Skip" option.
   - A correct code logs the user in, closes the modal and shows their name at the top. A wrong code shows an error inside the modal.
   - Submitting saves the data to a database table.
3. **Deliverables**: a public live URL, a GitHub repo shared with `boltapp-hiring` (schema as `.sql` files), and a `prompts.md`.

## Stack recommendation

- React + Node.js + Express is a valid choice, since Node.js is in the JD and the assignment allows any stack.
- Go is listed first in the JD and is the recommended stack, so it is a good choice only if I am already comfortable with it.
- Since there are only 2 days, a clean, working project in a language I know well is better than a shaky one in a new language.
- Use TypeScript for both frontend and backend, and Postgres with plain `.sql` migration files.

## Suggested hosting

| Layer    | Service               |
|----------|-----------------------|
| Frontend | Vercel                |
| API      | Render / Railway      |
| Database | Supabase / Neon       |

## Things that will impress reviewers

- Debounce the email recognition call so it does not fire on every keystroke.
- Rate-limit code attempts, since a 6-digit code can be brute-forced.
- Hash the code in the database and generate it with a cryptographically secure random function (`crypto.randomInt`).
- Use a unique constraint on email, and validate on the server as well as the client.
- Use a JWT after login, and do not trust the client's claim that it is logged in.
- Add a README with setup steps, env vars and the live URL.
- Save every prompt to `prompts.md` as I go.

---

## Prompt 2

### Prompt:

I want to build this in Express. Please provide the full project structure and explain how to complete this assignment in VS Code, with the file format (what files to create and what goes in each one).

Requirements

- Backend: Node.js + Express (TypeScript)
- Frontend: React (Vite, TypeScript)
- Database: Postgres, with the schema in a `.sql` file
- Three distinct layers: frontend, API, database
- Registration endpoint that returns a secure 6-digit code once
- Background email-recognition endpoint
- Login endpoint that checks the code, with protection against brute force
- Checkout endpoint that stores the form data
- Modal with error message and skip option
- Show the logged-in user's name at the top of the checkout form

### Response:

# Full Project Structure and Implementation (Express + React + Postgres)

I generated the complete project as `otp-login-app.zip` and type-checked both the backend and frontend.

## Project Structure

```
otp-login-app/
├── .gitignore
├── README.md
├── prompts.md
├── db/
│   └── schema.sql
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       ├── validation.ts
│       ├── middleware/
│       │   └── auth.ts
│       └── routes/
│           ├── auth.ts
│           └── checkout.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api.ts
        ├── styles.css
        ├── pages/
        │   ├── Register.tsx
        │   └── Checkout.tsx
        └── components/
            └── OtpModal.tsx
```

## Database Layer

**File:** `db/schema.sql`

Two tables:

- `users`: `id`, `email` (unique, stored lowercase), `first_name`, `last_name`, `code_hash`, `failed_attempts`, `locked_until`, `created_at`
- `checkout_submissions`: `id`, `user_id` (nullable, so guest orders are allowed), `email`, `phone`, `shipping_address`, `created_at`

The code is never stored in plain text, only as a bcrypt hash.

## API Layer (Express)

| Method | Endpoint               | Purpose |
|--------|------------------------|---------|
| POST   | `/api/register`        | Validates input, generates a 6-digit code with `crypto.randomInt`, stores only its bcrypt hash, and returns the plain code once. Returns 409 if the email already exists. |
| GET    | `/api/users/check`     | Returns only `{ exists: true/false }`, so the user's name is not leaked before login. |
| POST   | `/api/login`           | Compares the code with the stored hash. 5 wrong attempts lock the account for 15 minutes. On success returns a JWT and the user's name. |
| POST   | `/api/checkout`        | Validates the form and saves it. If a valid Bearer token is sent, the order is linked to that user. Otherwise it is saved as a guest order. |

Supporting files:

- `validation.ts`: shared email and input checks, with email normalised to lowercase.
- `middleware/auth.ts`: reads and verifies the JWT, and treats an invalid token as a guest.
- `db.ts`: Postgres connection pool, with SSL toggle for Supabase/Neon versus local.

## Frontend Layer (React)

- `api.ts`: small fetch wrapper with typed functions for each endpoint and a shared error class.
- `Register.tsx`: registration form, then displays the code once with a "save it now" message.
- `Checkout.tsx`:
  - live email validation with an inline hint
  - a debounced (400 ms) background call to `/api/users/check` once the email is valid
  - the effect is cancelled if the email changes, to avoid stale responses
  - opens the modal if the email is registered
  - shows "Signed in as First Last" at the top after login
  - sends the JWT with the checkout request
- `OtpModal.tsx`: numeric 6-digit input, error message inside the modal, and a "Skip and continue as guest" button. Skipping does not reopen the modal for the same email.

## Steps in VS Code

1. Unzip and open the `otp-login-app` folder in VS Code.
2. Create a free Postgres database (Supabase or Neon) and run `db/schema.sql` in its SQL editor.
3. Backend:
   ```bash
   cd backend
   cp .env.example .env     # fill in DATABASE_URL and JWT_SECRET
   npm install
   npm run dev
   ```
4. Frontend (in a second terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173.
5. Test: register, copy the code, go to Checkout, type the same email, and check the modal (wrong code, skip, correct code). Submit the form and check the `checkout_submissions` table.

## Deployment

- **Database:** Supabase or Neon.
- **API:** Render or Railway, root `backend`, build `npm install && npm run build`, start `npm start`. Env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `DB_SSL`.
- **Frontend:** Vercel, root `frontend`, env var `VITE_API_URL` set to the API URL.
- **GitHub:** push the repo and add `boltapp-hiring` as a collaborator under Settings → Collaborators.

## Security Considerations

- 6-digit code generated with `crypto.randomInt`, stored only as a bcrypt hash, shown once.
- Account lockout after 5 wrong attempts.
- Same generic error for unknown email and wrong code, to avoid leaking which emails exist.
- Server-side validation in addition to client-side validation.
- Login state is verified on the server through the JWT, not trusted from the client.

---

## Prompt 3

### Prompt:

I am sharing a reference `prompt.md` file. Can you create the prompts.md file for this project, written in natural human wording, describing what was done to create this full project? Add it in the same format as the reference I shared (Prompt, then Response).

### Response:

Created this `prompts.md` file. It lists the prompts in order, each followed by a summary of the response, in the same `### Prompt:` / `### Response:` format as the reference.