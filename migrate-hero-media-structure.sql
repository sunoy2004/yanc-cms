-- Migration to add media_id column to hero_media_item table
-- This allows proper linking between hero content and media items

-- Add the media_id column to the hero_media_item table
ALTER TABLE hero_media_item ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES media(id);

-- Update the foreign key constraint if needed
ALTER TABLE hero_media_item ADD CONSTRAINT fk_hero_media_item_media 
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE;

-- Create an index on media_id for better performance
CREATE INDEX IF NOT EXISTS idx_hero_media_item_media_id ON hero_media_item(media_id);

-- Update existing records to link media_id where possible by matching the URL
-- This finds media records that match the URL in hero_media_item and sets the media_id
-- Note: Replace YOUR_SUPABASE_URL with your actual Supabase URL
UPDATE hero_media_item 
SET media_id = (
  SELECT id 
  FROM media 
  WHERE 
    (storage_path IS NOT NULL AND 
     CONCAT('https://cudusictxvzcfcbfrxbi.supabase.co/storage/v1/object/public/media/', storage_path) = hero_media_item.url)
    OR 
    (drive_id IS NOT NULL AND 
     CONCAT('https://drive.google.com/uc?id=', drive_id) = hero_media_item.url)
)
WHERE hero_media_item.media_id IS NULL;