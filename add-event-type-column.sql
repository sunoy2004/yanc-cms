-- Add type column to event_content table
ALTER TABLE event_content ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';

-- Update existing records to have a default type
UPDATE event_content SET type = 'general' WHERE type IS NULL;

-- Add constraint to ensure valid types
-- This is optional but helps maintain data integrity
-- You can run this separately if needed:
-- ALTER TABLE event_content ADD CONSTRAINT chk_valid_event_type CHECK (type IN ('general', 'upcoming', 'past', 'highlight', 'gallery'));