-- Migration to add storage_path column to media table
-- This allows tracking of Supabase Storage paths alongside Google Drive IDs

-- Add the storage_path column to the media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Update existing records to set storage_type to 'supabase_storage' where storage_path is available
-- This helps distinguish between files stored only in Google Drive vs those also in Supabase
UPDATE media SET storage_type = 'supabase_storage' WHERE storage_path IS NOT NULL AND storage_path != '';

-- Create an index on storage_path for better performance
CREATE INDEX IF NOT EXISTS idx_media_storage_path ON media(storage_path);

-- Update the updated_at timestamp for affected records
-- This ensures the trigger works properly if it exists