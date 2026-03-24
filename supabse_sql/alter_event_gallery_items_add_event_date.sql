-- Add optional event date to event gallery items (existing databases)
-- Run once in Supabase SQL editor.

ALTER TABLE event_gallery_items
ADD COLUMN IF NOT EXISTS event_date DATE;

COMMENT ON COLUMN event_gallery_items.event_date IS 'Date associated with this gallery item (e.g. event day)';

CREATE INDEX IF NOT EXISTS idx_event_gallery_items_event_date
  ON event_gallery_items(event_date DESC NULLS LAST);
