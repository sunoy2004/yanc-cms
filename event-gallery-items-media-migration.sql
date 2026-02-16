-- Migration to add event_gallery_item_media table for multiple media support
-- This table will link event_gallery_items to multiple media items

-- Create the junction table for event gallery items and media
CREATE TABLE IF NOT EXISTS event_gallery_item_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_gallery_item_id UUID REFERENCES event_gallery_items(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_item_id ON event_gallery_item_media(event_gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_media_id ON event_gallery_item_media(media_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_display_order ON event_gallery_item_media(display_order);

-- Enable Row Level Security
ALTER TABLE event_gallery_item_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - allow all access for service role
CREATE POLICY "Service role can access event_gallery_item_media" ON event_gallery_item_media
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_event_gallery_item_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_event_gallery_item_media_updated_at 
  BEFORE UPDATE ON event_gallery_item_media 
  FOR EACH ROW EXECUTE FUNCTION update_event_gallery_item_media_updated_at();

-- Migrate existing data if needed
-- This would copy existing media_id from event_gallery_items to the new junction table
INSERT INTO event_gallery_item_media (event_gallery_item_id, media_id, display_order)
SELECT 
  id,
  media_id,
  0
FROM event_gallery_items 
WHERE media_id IS NOT NULL
ON CONFLICT DO NOTHING;