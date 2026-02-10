-- Cleanup script to remove old Google Drive URLs that might be cached in hero_media_item
-- This ensures frontend only receives Supabase Storage URLs

-- First, identify any hero_media_item records with old Google Drive URL formats
SELECT 
    id,
    hero_id,
    url,
    media_id,
    created_at
FROM hero_media_item 
WHERE url LIKE 'https://drive.google.com/file/d/%/view'
   OR url LIKE 'https://drive.google.com/open?id=%';

-- Delete records with old Google Drive URL formats
DELETE FROM hero_media_item
WHERE url LIKE 'https://drive.google.com/file/d/%/view'
   OR url LIKE 'https://drive.google.com/open?id=%';

-- Also check for any records that might have invalid URLs
SELECT 
    id,
    hero_id,
    url,
    media_id
FROM hero_media_item 
WHERE url NOT LIKE '%supabase.co/storage%'
  AND url NOT LIKE 'https://drive.google.com/uc?id=%';

-- Optional: Clear all hero_media_item records to force fresh creation with proper URLs
-- Uncomment the next line if you want to start completely fresh
-- DELETE FROM hero_media_item;