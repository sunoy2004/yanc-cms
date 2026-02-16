-- Add description column to hero_content table
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS description TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN hero_content.description IS 'Hero section description/tagline text';