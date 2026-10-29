# Prompts used while building this app

## Prompt 1

### Prompt:
I want to create a OTP-Login app which have to collect email , First name , and LAST name , save the user and generate a random 6-digit code.
## Prompt 2

### Prompt:
I need a Postgres schema for this app. One table for users (email must be unique, first name, last name, and a place to store the 6-digit code safely, plus failed attempts and a lock time). Another table to store the checkout form (phone, shipping address, and an optional link to the user). Put it in a file I can run in a SQL editor.

## Prompt 3

### Prompt:
Create src/db.ts that connects to Postgres using the pg Pool and DATABASE_URL from .env. Then create src/index.ts with an Express server that uses cors and express.json(), has a /health route, and listens on the PORT from .env. Keep the code simple and add short comments, because I'm new to TypeScript.

## Prompt 4

### Prompt:
Add a POST /api/register route in src/routes/auth.ts. It should take email, firstName and lastName, validate them, make a random 6-digit code, save the user, and send the code back once. I don't want to save the code as plain text. How should I store it? If the email already exists, return a clear error.

## Prompt 5

### Prompt:
Add GET /api/users/check?email=... that tells the frontend if an email is registered. It should only return true or false and not reveal any user details. Also make the email lowercase before searching.

## Prompt 6

### Prompt:
Add POST /api/login that takes email and the 6-digit code, compares the code with the saved hash, and returns a JWT token plus the user's first and last name if it matches. Explain each line so I understand how the token works.

## Prompt 7

### Prompt:
A 6-digit code can be guessed easily. How can I stop someone from trying all the codes? Update the login route so 5 wrong tries lock the account for 15 minutes. Use the failed_attempts and locked_until columns I already have.

## Prompt 8

### Prompt:
Add POST /api/checkout that saves email, phone and shipping address into checkout_submissions. If the request has a valid JWT in the Authorization header, save the user id too. If not, still save it as a guest order. Put the JWT reading code in a middleware file.

## Prompt 9

### Prompt:
Create src/api.ts for my React app with functions for register, checkEmail, login and submitCheckout. They should call my Express endpoints with fetch, throw an error with the server's message when something fails, and send the JWT in the Authorization header for checkout.

## Prompt 10

### Prompt:
Make src/pages/Register.tsx with a form for first name, last name and email. Validate before sending, show errors, and after success show the 6-digit code in a big box with a message saying it is shown only once.

## Prompt 11

### Prompt:
Make src/pages/Checkout.tsx with email, phone and shipping address. While typing, show if the email format is valid. When it becomes valid, call the check-email API in the background without blocking the form. I don't want a request on every key press, so please add a delay (debounce). If the email is registered, open a modal.

## Prompt 12

### Prompt:
Make src/components/OtpModal.tsx. It should ask for the 6-digit code, accept only digits, call the login API, and show errors inside the modal if the code is wrong. Add a "skip" button that closes the modal and lets the user continue as a guest. After a correct code, close the modal and show "Signed in as First Last" at the top of the checkout form.

## Prompt 13

### Prompt:
Update App.tsx so I can switch between the Register page and the Checkout page using two buttons at the top. Then write simple CSS in styles.css for a clean look: a centered card, readable inputs, a dark overlay for the modal, and it should look fine on a phone.
