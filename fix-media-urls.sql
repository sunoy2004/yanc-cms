-- Fix existing hero_media_item records with invalid URLs
-- This script updates any records that have the old /file/d/ format to use the new /uc?id= format
-- Additionally, update URLs to use Supabase Storage when available

-- Update hero_media_item table to fix URLs (Google Drive format fixes)
UPDATE hero_media_item 
SET url = REPLACE(
    REPLACE(url, 'https://drive.google.com/file/d/', 'https://drive.google.com/uc?id='),
    '/view',
    ''
)
WHERE url LIKE 'https://drive.google.com/file/d/%/view';

-- Update hero_media_item URLs to use Supabase Storage when available
-- This checks if the media table has a storage_path for the given drive_id and updates the URL accordingly
UPDATE hero_media_item
SET url = CONCAT('https://cudusictxvzcfcbfrxbi.supabase.co/storage/v1/object/public/media/', m.storage_path)
FROM media m
WHERE hero_media_item.url LIKE 'https://drive.google.com/uc?id=%'
  AND m.drive_id = SPLIT_PART(SPLIT_PART(hero_media_item.url, 'id=', 2), '&', 1)
  AND m.storage_path IS NOT NULL
  AND m.storage_path != '';

-- Verify the changes
SELECT 
    h.id,
    h.hero_id,
    h.url,
    CASE 
        WHEN h.url LIKE '%supabase.co/storage%' THEN 'SUPABASE_STORAGE'
        WHEN h.url LIKE 'https://drive.google.com/uc?id=%' THEN 'GOOGLE_DRIVE'
        ELSE 'OTHER'
    END as url_type
FROM hero_media_item h
ORDER BY h.created_at DESC
LIMIT 10;

-- Count of records by type
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN url LIKE '%supabase.co/storage%' THEN 1 END) as supabase_storage_urls,
    COUNT(CASE WHEN url LIKE 'https://drive.google.com/uc?id=%' THEN 1 END) as google_drive_urls
FROM hero_media_item;