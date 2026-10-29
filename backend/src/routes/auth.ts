import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { isNonEmpty, isValidEmail, normalizeEmail } from "../validation";

const router = Router();
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// POST /api/register  { email, firstName, lastName }  -> { code }
router.post("/register", async (req, res) => {
  const { email, firstName, lastName } = req.body ?? {};
  if (!isValidEmail(email) || !isNonEmpty(firstName) || !isNonEmpty(lastName)) {
    return res.status(400).json({ error: "Enter a valid email, first name and last name." });
  }

  // Cryptographically secure 6-digit code (leading zeros preserved)
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = await bcrypt.hash(code, 10);

  try {
    await pool.query(
      `INSERT INTO users (email, first_name, last_name, code_hash) VALUES ($1, $2, $3, $4)`,
      [normalizeEmail(email), firstName.trim(), lastName.trim(), codeHash]
    );
    // The plain code is returned ONCE and never stored.
    return res.status(201).json({ code });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "This email is already registered." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// GET /api/users/check?email=...  -> { exists: boolean }
router.get("/users/check", async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email." });
  try {
    const { rowCount } = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [normalizeEmail(email)]);
    return res.json({ exists: (rowCount ?? 0) > 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// POST /api/login  { email, code }  -> { token, user }
router.post("/login", async (req, res) => {
  const { email, code } = req.body ?? {};
  if (!isValidEmail(email) || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Enter the 6-digit code." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, code_hash, failed_attempts, locked_until
         FROM users WHERE email = $1`,
      [normalizeEmail(email)]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Incorrect code." });

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const ok = await bcrypt.compare(code, user.code_hash);
    if (!ok) {
      const attempts = user.failed_attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await pool.query(
          `UPDATE users SET failed_attempts = 0, locked_until = now() + ($2 || ' minutes')::interval WHERE id = $1`,
          [user.id, String(LOCK_MINUTES)]
        );
        return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
      }
      await pool.query(`UPDATE users SET failed_attempts = $2 WHERE id = $1`, [user.id, attempts]);
      return res.status(401).json({ error: `Incorrect code. ${MAX_ATTEMPTS - attempts} attempts left.` });
    }

    await pool.query(`UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`, [user.id]);
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, { expiresIn: "2h" });
    return res.json({ token, user: { firstName: user.first_name, lastName: user.last_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

export default router;
