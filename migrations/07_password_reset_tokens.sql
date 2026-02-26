-- Add password reset token columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Optional: index for lookups by reset_token (if not using PK)
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token)
  WHERE reset_token IS NOT NULL;
