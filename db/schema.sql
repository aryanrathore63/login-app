-- Run this once on your Postgres database (Supabase SQL editor, Neon, or psql).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,          -- stored lowercase
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  code_hash       TEXT NOT NULL,                 -- bcrypt hash of the 6-digit code
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checkout_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = guest
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkout_user ON checkout_submissions(user_id);
