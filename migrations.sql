-- YANC CMS Database Migration - New Tables for Complete Website Coverage
-- Run this in your Supabase SQL editor to add missing tables

-- Create Applications table (for job applications)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, accepted, rejected
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Newsletter Subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Gallery table (for general gallery sections)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- general, events, programs, etc.
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Gallery Items table (for individual gallery items)
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES gallery(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Social Links table (for team members, founders, etc.)
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- team_member, founder, etc.
  entity_id UUID NOT NULL, -- ID of the related entity
  platform TEXT NOT NULL, -- linkedin, twitter, github, website, etc.
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Gallery Media Item table
CREATE TABLE IF NOT EXISTS gallery_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_item_id UUID REFERENCES gallery_items(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_applications_active ON applications(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON gallery_items(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_social_links_entity ON social_links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_item_gallery_item_id ON gallery_media_item(gallery_item_id);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media_item ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access for new tables
CREATE POLICY "Service role can access applications" ON applications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access newsletter_subscriptions" ON newsletter_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access gallery" ON gallery
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access gallery_items" ON gallery_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access social_links" ON social_links
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can access gallery_media_item" ON gallery_media_item
  FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for automatic updated_at updates for new tables
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at 
  BEFORE UPDATE ON newsletter_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at 
  BEFORE UPDATE ON gallery 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_items_updated_at 
  BEFORE UPDATE ON gallery_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at 
  BEFORE UPDATE ON social_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_media_item_updated_at 
  BEFORE UPDATE ON gallery_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();