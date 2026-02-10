-- YANC CMS Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Create Media table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  drive_id TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_type TEXT DEFAULT 'google_drive',
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Hero Content table
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Hero Media Item table
CREATE TABLE IF NOT EXISTS hero_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_id UUID REFERENCES hero_content(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hero_content_active ON hero_content(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_media_item_hero_id ON hero_media_item(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_media_item_order ON hero_media_item("order");

-- Enable Row Level Security (RLS)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_media_item ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (allows all operations)
CREATE POLICY "Service role can access media" ON media
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access hero_content" ON hero_content
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access hero_media_item" ON hero_media_item
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample hero content
INSERT INTO hero_content (title, subtitle, cta_text, cta_url, is_active)
VALUES (
  'Welcome to YANC CMS',
  'Your modern content management system is ready to use',
  'Get Started',
  '#',
  true
) ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_content_updated_at 
  BEFORE UPDATE ON hero_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_media_item_updated_at 
  BEFORE UPDATE ON hero_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();