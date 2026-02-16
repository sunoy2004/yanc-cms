-- STRICT EVENTS SECTION ISOLATION MIGRATION
-- This migration enforces complete separation between Upcoming Events, Past Events, and Event Gallery

-- 1. CREATE NEW EVENT GALLERY ITEMS TABLE (standalone, no event references)
CREATE TABLE IF NOT EXISTS event_gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADD TYPE COLUMN TO EXISTING event_content TABLE (if not exists)
ALTER TABLE event_content 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('upcoming', 'past'));

-- 3. UPDATE EXISTING EVENTS TO HAVE TYPES (based on dates)
-- Simple approach: set all existing events to 'past' for safety
-- You can manually update specific events to 'upcoming' as needed
UPDATE event_content 
SET type = 'past'
WHERE type IS NULL;

-- 4. MAKE TYPE COLUMN REQUIRED
ALTER TABLE event_content 
ALTER COLUMN type SET NOT NULL;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_event_content_type ON event_content(type);
CREATE INDEX IF NOT EXISTS idx_event_content_is_active ON event_content(is_active);
CREATE INDEX IF NOT EXISTS idx_event_gallery_items_is_active ON event_gallery_items(is_active);
CREATE INDEX IF NOT EXISTS idx_event_gallery_items_display_order ON event_gallery_items(display_order);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE event_gallery_items ENABLE ROW LEVEL SECURITY;

-- 7. CREATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_event_gallery_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_gallery_items_updated_at 
  BEFORE UPDATE ON event_gallery_items 
  FOR EACH ROW EXECUTE FUNCTION update_event_gallery_items_updated_at();

-- 8. MIGRATE EXISTING GALLERY DATA (if needed)
-- This would copy existing gallery items to the new standalone table
-- Uncomment and adjust based on your current data structure:
/*
INSERT INTO event_gallery_items (title, description, media_id, is_active, display_order)
SELECT 
  eg.title,
  eg.description,
  egmi.media_id,
  eg.is_active,
  eg."order"
FROM event_gallery eg
LEFT JOIN event_gallery_media_item egmi ON eg.id = egmi.event_gallery_id
WHERE eg.is_active = true;
*/

-- 9. CLEANUP OLD REFERENCES (optional - do this after confirming new system works)
-- ALTER TABLE event_gallery DROP CONSTRAINT IF EXISTS event_gallery_event_id_fkey;
-- DROP TABLE IF EXISTS event_gallery_media_item;

-- 10. RLS POLICIES
CREATE POLICY "Enable read access for all users" ON event_gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON event_gallery_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON event_gallery_items
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON event_gallery_items
  FOR DELETE USING (true);

-- Also update existing policies for event_content
DROP POLICY IF EXISTS "Enable read access for all users" ON event_content;
CREATE POLICY "Enable read access for all users" ON event_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON event_content;
CREATE POLICY "Enable insert for authenticated users" ON event_content
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON event_content;
CREATE POLICY "Enable update for authenticated users" ON event_content
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON event_content;
CREATE POLICY "Enable delete for authenticated users" ON event_content
  FOR DELETE USING (true);

-- Verification queries
-- Check current event distribution:
-- SELECT type, COUNT(*) FROM event_content GROUP BY type;

-- Check gallery items:
-- SELECT COUNT(*) FROM event_gallery_items WHERE is_active = true;

-- Check media associations:
-- SELECT COUNT(*) FROM event_gallery_items WHERE media_id IS NOT NULL;