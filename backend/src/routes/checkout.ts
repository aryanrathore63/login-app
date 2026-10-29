import { Router } from "express";
import { pool } from "../db";
import { AuthedRequest, optionalAuth } from "../middleware/auth";
import { isNonEmpty, isValidEmail, normalizeEmail } from "../validation";

const router = Router();

// POST /api/checkout  { email, phone, shippingAddress }
// If a valid Bearer token is sent, the submission is linked to that user; otherwise it is a guest order.
router.post("/checkout", optionalAuth, async (req: AuthedRequest, res) => {
  const { email, phone, shippingAddress } = req.body ?? {};
  if (!isValidEmail(email)) return res.status(400).json({ error: "Enter a valid email." });
  if (!isNonEmpty(phone, 30) || !/^[+\d][\d\s\-()]{6,}$/.test(phone.trim())) {
    return res.status(400).json({ error: "Enter a valid phone number." });
  }
  if (!isNonEmpty(shippingAddress, 500)) {
    return res.status(400).json({ error: "Enter a shipping address." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO checkout_submissions (user_id, email, phone, shipping_address)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.userId ?? null, normalizeEmail(email), phone.trim(), shippingAddress.trim()]
    );
    return res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

export default router;
