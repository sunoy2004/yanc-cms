-- YANC CMS MASTER DATABASE SCRIPT
-- This file is an ordered concatenation of all individual migration/setup SQL files
-- from the project. Run this in your Supabase SQL editor to initialize a fresh
-- database with the complete schema and data migrations.
--
-- NOTE:
-- - Individual migration files have been removed in favor of this single script.
-- - Sections below are grouped roughly as:
--   1. Core schema & RLS
--   2. Extended schema / strict isolation
--   3. Team section & social links
--   4. Users & auth helpers
--   5. Event/gallery enhancements
--   6. Data fixups / cleanups
--
-- ============================================================
-- 1. CORE SCHEMA & RLS (from setup.sql / supabase-setup.sql)
-- ============================================================

-- Begin: setup.sql (superseded by supabase-setup.sql, but kept for safety)

-- YANC CMS Comprehensive Database Schema for Supabase
-- Run this in your Supabase SQL editor to set up all website sections

-- Create Media table (centralized media storage)
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  drive_id TEXT, -- Kept for legacy compatibility but not used
  mime_type TEXT NOT NULL,
  storage_type TEXT DEFAULT 'supabase_storage',
  storage_path TEXT,
  section TEXT, -- Which section this media belongs to (hero, events, programs, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Hero Content table
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_url TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Programs table
CREATE TABLE IF NOT EXISTS program_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Events table
CREATE TABLE IF NOT EXISTS event_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Gallery table
CREATE TABLE IF NOT EXISTS event_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES event_content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Mentor Talks table
CREATE TABLE IF NOT EXISTS mentor_talks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date TEXT,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  type TEXT DEFAULT 'REGULAR', -- REGULAR, FOUNDER, ADVISOR, MENTOR
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Founders table
CREATE TABLE IF NOT EXISTS founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  company TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create About Us table
CREATE TABLE IF NOT EXISTS about_us (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  description TEXT,
  vision_title TEXT,
  vision_desc TEXT,
  mission_title TEXT,
  mission_desc TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contact Info table
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  address TEXT,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  facebook TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Core Values table
CREATE TABLE IF NOT EXISTS core_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Careers/Jobs table
CREATE TABLE IF NOT EXISTS careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT, -- full-time, part-time, contract, internship
  description TEXT,
  requirements TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications, newsletter, gallery, social_links etc.
-- (from migrations.sql)

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

-- Create Program Media Item table
CREATE TABLE IF NOT EXISTS program_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES program_content(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Media Item table
CREATE TABLE IF NOT EXISTS event_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES event_content(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Gallery Media Item table
CREATE TABLE IF NOT EXISTS event_gallery_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_gallery_id UUID REFERENCES event_gallery(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Mentor Talk Media Item table
CREATE TABLE IF NOT EXISTS mentor_talk_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_talk_id UUID REFERENCES mentor_talks(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Team Member Media Item table
CREATE TABLE IF NOT EXISTS team_member_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Founder Media Item table
CREATE TABLE IF NOT EXISTS founder_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Testimonial Media Item table
CREATE TABLE IF NOT EXISTS testimonial_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testimonial_id UUID REFERENCES testimonials(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create About Us Media Item table
CREATE TABLE IF NOT EXISTS about_us_media_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  about_us_id UUID REFERENCES about_us(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
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

-- Indexes, RLS, policies, triggers, and seed data
-- (from supabase-setup.sql)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_section ON media(section);
CREATE INDEX IF NOT EXISTS idx_hero_content_active ON hero_content(is_active);
CREATE INDEX IF NOT EXISTS idx_program_content_active ON program_content(is_active);
CREATE INDEX IF NOT EXISTS idx_event_content_active ON event_content(is_active);
CREATE INDEX IF NOT EXISTS idx_mentor_talks_active ON mentor_talks(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_founders_active ON founders(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_about_us_active ON about_us(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_info_active ON contact_info(is_active);
CREATE INDEX IF NOT EXISTS idx_core_values_active ON core_values(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_active ON applications(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(subscribed);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON gallery_items(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_social_links_entity ON social_links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_hero_media_item_hero_id ON hero_media_item(hero_id);
CREATE INDEX IF NOT EXISTS idx_program_media_item_program_id ON program_media_item(program_id);
CREATE INDEX IF NOT EXISTS idx_event_media_item_event_id ON event_media_item(event_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_media_item_gallery_id ON event_gallery_media_item(event_gallery_id);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_media_item_talk_id ON mentor_talk_media_item(mentor_talk_id);
CREATE INDEX IF NOT EXISTS idx_team_member_media_item_member_id ON team_member_media_item(team_member_id);
CREATE INDEX IF NOT EXISTS idx_founder_media_item_founder_id ON founder_media_item(founder_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_media_item_testimonial_id ON testimonial_media_item(testimonial_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_item_gallery_item_id ON gallery_media_item(gallery_item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_talk_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media_item ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (allows all operations)
CREATE POLICY "Service role can access media" ON media
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access hero_content" ON hero_content
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access program_content" ON program_content
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access event_content" ON event_content
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access event_gallery" ON event_gallery
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access mentor_talks" ON mentor_talks
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access team_members" ON team_members
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access founders" ON founders
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access about_us" ON about_us
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access contact_info" ON contact_info
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access core_values" ON core_values
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access faqs" ON faqs
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access careers" ON careers
  FOR ALL USING (true) WITH CHECK (true);
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
CREATE POLICY "Service role can access hero_media_item" ON hero_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access program_media_item" ON program_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access event_media_item" ON event_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access event_gallery_media_item" ON event_gallery_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access mentor_talk_media_item" ON mentor_talk_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access team_member_media_item" ON team_member_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access founder_media_item" ON founder_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access testimonial_media_item" ON testimonial_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access about_us_media_item" ON about_us_media_item
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can access gallery_media_item" ON gallery_media_item
  FOR ALL USING (true) WITH CHECK (true);

-- Seed hero & about content
INSERT INTO hero_content (title, subtitle, cta_text, cta_url, is_active)
VALUES (
  'Welcome to YANC CMS',
  'Your modern content management system is ready to use',
  'Get Started',
  '#',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO about_us (headline, description, vision_title, vision_desc, mission_title, mission_desc, is_active)
VALUES (
  'About Us',
  'Empowering Young Minds through Life Skills

Networking and life skills are crucial in today''s fast-paced world.',
  'Vision',
  'Empowering young minds together.',
  'Mission',
  'Building better people for better Tomorrow.',
  true
) ON CONFLICT DO NOTHING;

-- updated_at trigger function and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_content_updated_at 
  BEFORE UPDATE ON hero_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_program_content_updated_at 
  BEFORE UPDATE ON program_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_content_updated_at 
  BEFORE UPDATE ON event_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_gallery_updated_at 
  BEFORE UPDATE ON event_gallery 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_talks_updated_at 
  BEFORE UPDATE ON mentor_talks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at 
  BEFORE UPDATE ON team_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_founders_updated_at 
  BEFORE UPDATE ON founders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at 
  BEFORE UPDATE ON testimonials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_us_updated_at 
  BEFORE UPDATE ON about_us 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at 
  BEFORE UPDATE ON contact_info 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_values_updated_at 
  BEFORE UPDATE ON core_values 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at 
  BEFORE UPDATE ON faqs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_careers_updated_at 
  BEFORE UPDATE ON careers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
CREATE TRIGGER update_hero_media_item_updated_at 
  BEFORE UPDATE ON hero_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_program_media_item_updated_at 
  BEFORE UPDATE ON program_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_media_item_updated_at 
  BEFORE UPDATE ON event_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_gallery_media_item_updated_at 
  BEFORE UPDATE ON event_gallery_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_talk_media_item_updated_at 
  BEFORE UPDATE ON mentor_talk_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_member_media_item_updated_at 
  BEFORE UPDATE ON team_member_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_founder_media_item_updated_at 
  BEFORE UPDATE ON founder_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonial_media_item_updated_at 
  BEFORE UPDATE ON testimonial_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_us_media_item_updated_at 
  BEFORE UPDATE ON about_us_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_media_item_updated_at 
  BEFORE UPDATE ON gallery_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. EVENT / GALLERY STRICT ISOLATION & EXTRA COLUMNS
-- ============================================================

-- Add type column to event_content (add-event-type-column.sql)
ALTER TABLE event_content ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
UPDATE event_content SET type = 'general' WHERE type IS NULL;

-- STRICT EVENTS SECTION ISOLATION MIGRATION (strict-events-isolation-migration.sql)
-- This enforces separation between upcoming/past and standalone gallery items

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

ALTER TABLE event_content 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('upcoming', 'past'));

UPDATE event_content 
SET type = 'past'
WHERE type IS NULL;

ALTER TABLE event_content 
ALTER COLUMN type SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_content_type ON event_content(type);
CREATE INDEX IF NOT EXISTS idx_event_content_is_active ON event_content(is_active);
CREATE INDEX IF NOT EXISTS idx_event_gallery_items_is_active ON event_gallery_items(is_active);
CREATE INDEX IF NOT EXISTS idx_event_gallery_items_display_order ON event_gallery_items(display_order);

ALTER TABLE event_gallery_items ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Enable read access for all users" ON event_gallery_items
  FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON event_gallery_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON event_gallery_items
  FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON event_gallery_items
  FOR DELETE USING (true);

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

-- Add registration_url to event_content (10_add_event_registration_url.sql)
ALTER TABLE event_content
ADD COLUMN IF NOT EXISTS registration_url TEXT;
COMMENT ON COLUMN event_content.registration_url IS 'URL for the Register Now button on the frontend upcoming events section';

-- Event gallery item media junction table (event-gallery-items-media-migration.sql)
CREATE TABLE IF NOT EXISTS event_gallery_item_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_gallery_item_id UUID REFERENCES event_gallery_items(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_item_id ON event_gallery_item_media(event_gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_media_id ON event_gallery_item_media(media_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_item_media_display_order ON event_gallery_item_media(display_order);

ALTER TABLE event_gallery_item_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can access event_gallery_item_media" ON event_gallery_item_media
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_event_gallery_item_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_gallery_item_media_updated_at 
  BEFORE UPDATE ON event_gallery_item_media 
  FOR EACH ROW EXECUTE FUNCTION update_event_gallery_item_media_updated_at();

INSERT INTO event_gallery_item_media (event_gallery_item_id, media_id, display_order)
SELECT 
  id,
  media_id,
  0
FROM event_gallery_items 
WHERE media_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. TEAM SECTION / SOCIAL LINKS / VIEWS
-- ============================================================

-- Team section migration (combined script)
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS section TEXT;

ALTER TABLE team_members 
ADD CONSTRAINT valid_section CHECK (
  section IN ('executive_management', 'cohort_founders', 'advisory_board', 'global_mentors')
);

CREATE INDEX IF NOT EXISTS idx_team_members_section ON team_members(section);

UPDATE team_members 
SET section = CASE 
  WHEN type = 'REGULAR' THEN 'executive_management'
  WHEN type = 'FOUNDER' THEN 'cohort_founders'
  WHEN type = 'ADVISOR' THEN 'advisory_board'
  WHEN type = 'MENTOR' THEN 'global_mentors'
  ELSE 'executive_management'
END
WHERE section IS NULL;

ALTER TABLE team_members 
ALTER COLUMN section SET NOT NULL;

-- Team management enhancement & view with social links
CREATE OR REPLACE VIEW team_members_with_social AS
SELECT 
    tm.*,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'platform', sl.platform,
                'url', sl.url
            )
        ) FILTER (WHERE sl.id IS NOT NULL AND sl.entity_type = 'team_member')), 
        '[]'::json
    ) AS social_links
FROM team_members tm
LEFT JOIN social_links sl ON sl.entity_id = tm.id AND sl.entity_type = 'team_member' AND sl.is_active = true
GROUP BY tm.id;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_team_member_media_item_team_member' 
        AND table_name = 'team_member_media_item'
    ) THEN
        ALTER TABLE team_member_media_item 
        ADD CONSTRAINT fk_team_member_media_item_team_member 
        FOREIGN KEY (team_member_id) REFERENCES team_members(id) 
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_team_member_media_item_media' 
        AND table_name = 'team_member_media_item'
    ) THEN
        ALTER TABLE team_member_media_item 
        ADD CONSTRAINT fk_team_member_media_item_media 
        FOREIGN KEY (media_id) REFERENCES media(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DROP POLICY IF EXISTS "Service role can access team_member_media_item" ON team_member_media_item;
CREATE POLICY "Service role can access team_member_media_item" ON team_member_media_item
  FOR ALL USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_team_member_media_item_updated_at ON team_member_media_item;
CREATE TRIGGER update_team_member_media_item_updated_at 
  BEFORE UPDATE ON team_member_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Team type filtering fix (ensures legacy type values are normalized)
UPDATE team_members 
SET type = CASE 
    WHEN type = 'EXECUTIVE' THEN 'REGULAR'
    WHEN type = 'COHORT_FOUNDER' THEN 'FOUNDER'
    WHEN type = 'ADVISORY_BOARD' THEN 'ADVISOR'
    WHEN type = 'GLOBAL_MENTOR' THEN 'MENTOR'
    ELSE type
END
WHERE type IN ('EXECUTIVE', 'COHORT_FOUNDER', 'ADVISORY_BOARD', 'GLOBAL_MENTOR');

CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(type);
CREATE INDEX IF NOT EXISTS idx_team_members_type_active ON team_members(type, is_active);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_social_links_team_member' 
        AND table_name = 'social_links'
    ) THEN
        ALTER TABLE social_links 
        ADD CONSTRAINT fk_social_links_team_member 
        FOREIGN KEY (entity_id) REFERENCES team_members(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Optional sample social links (team-social-links-migration.sql)
DO $$
DECLARE
  sample_team_member_id UUID;
BEGIN
  SELECT id INTO sample_team_member_id FROM team_members LIMIT 1;
  
  IF sample_team_member_id IS NOT NULL THEN
    INSERT INTO social_links (entity_type, entity_id, platform, url, is_active)
    VALUES 
      ('team_member', sample_team_member_id, 'linkedin', 'https://www.linkedin.com/company/yanc', true),
      ('team_member', sample_team_member_id, 'twitter', 'https://twitter.com/yanc', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 4. USERS / AUTH HELPERS / ROLES
-- ============================================================

-- Users table and RLS policies (06_create_users_table.sql)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  auth_id UUID UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

INSERT INTO users (username, email, name)
SELECT 'admin', 'admin@yanc.in', 'Admin User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select own" ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Allow authenticated insert own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Allow authenticated update own" ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Password reset fields (07_password_reset_tokens.sql)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token)
  WHERE reset_token IS NOT NULL;

-- User roles (08_add_user_roles.sql)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'editor';

UPDATE users
SET role = 'admin'
WHERE username = 'admin';

-- created_by tracking (09_add_user_created_by.sql)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_by BIGINT;

CREATE INDEX IF NOT EXISTS idx_users_created_by ON users (created_by);

-- ============================================================
-- 5. MENTOR TALKS / HERO / MEDIA ENHANCEMENTS
-- ============================================================

-- Mentor talks dedicated schema (mentor-talks-migration.sql)
CREATE TABLE IF NOT EXISTS mentor_talks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  speaker_bio TEXT,
  talk_date DATE NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentor_talk_gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_talk_id UUID REFERENCES mentor_talks(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_talks_published ON mentor_talks(is_published);
CREATE INDEX IF NOT EXISTS idx_mentor_talks_date ON mentor_talks(talk_date DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_talks_order ON mentor_talks(display_order);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_gallery_talk_id ON mentor_talk_gallery_items(mentor_talk_id);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_gallery_order ON mentor_talk_gallery_items(display_order);

ALTER TABLE mentor_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_talk_gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published mentor talks" ON mentor_talks
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view mentor talk gallery items" ON mentor_talk_gallery_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentor_talks 
      WHERE mentor_talks.id = mentor_talk_gallery_items.mentor_talk_id 
      AND mentor_talks.is_published = true
    )
  );

CREATE POLICY "Admins can manage mentor talks" ON mentor_talks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage mentor talk gallery items" ON mentor_talk_gallery_items
  FOR ALL USING (true) WITH CHECK (true);

-- Hero/media enhancements

-- Add description column to hero_content (migrate-add-description-column.sql)
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS description TEXT;
COMMENT ON COLUMN hero_content.description IS 'Hero section description/tagline text';

-- Event highlights table (add-event-highlights-table.sql)
CREATE TABLE IF NOT EXISTS event_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES event_content(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_highlights_event_id ON event_highlights(event_id);

ALTER TABLE event_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access event_highlights" ON event_highlights
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_event_highlights_updated_at 
  BEFORE UPDATE ON event_highlights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add storage_path to media (migrate-add-storage-path.sql)
ALTER TABLE media ADD COLUMN IF NOT EXISTS storage_path TEXT;
UPDATE media SET storage_type = 'supabase_storage' WHERE storage_path IS NOT NULL AND storage_path != '';
CREATE INDEX IF NOT EXISTS idx_media_storage_path ON media(storage_path);

-- Hero media structure (migrate-hero-media-structure.sql)
ALTER TABLE hero_media_item ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES media(id);
ALTER TABLE hero_media_item ADD CONSTRAINT fk_hero_media_item_media 
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hero_media_item_media_id ON hero_media_item(media_id);

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

-- Update hero descriptions (update-hero-descriptions.sql)
UPDATE hero_content 
SET description = 'Your modern content management system is ready to use'
WHERE title = 'Welcome to YANC CMS' AND description IS NULL;

UPDATE hero_content 
SET description = COALESCE(description, 'Join our community today')
WHERE description IS NULL;

-- ============================================================
-- 6. DATA CLEANUPS / URL FIXES
-- ============================================================

-- Cleanup old Google Drive URLs (cleanup-frontend-drive-urls.sql)
SELECT 
    id,
    hero_id,
    url,
    media_id,
    created_at
FROM hero_media_item 
WHERE url LIKE 'https://drive.google.com/file/d/%/view'
   OR url LIKE 'https://drive.google.com/open?id=%';

DELETE FROM hero_media_item
WHERE url LIKE 'https://drive.google.com/file/d/%/view'
   OR url LIKE 'https://drive.google.com/open?id=%';

SELECT 
    id,
    hero_id,
    url,
    media_id
FROM hero_media_item 
WHERE url NOT LIKE '%supabase.co/storage%'
  AND url NOT LIKE 'https://drive.google.com/uc?id=%';

-- Fix media URLs (fix-media-urls.sql)
UPDATE hero_media_item 
SET url = REPLACE(
    REPLACE(url, 'https://drive.google.com/file/d/', 'https://drive.google.com/uc?id='),
    '/view',
    ''
)
WHERE url LIKE 'https://drive.google.com/file/d/%/view';

UPDATE hero_media_item
SET url = CONCAT('https://cudusictxvzcfcbfrxbi.supabase.co/storage/v1/object/public/media/', m.storage_path)
FROM media m
WHERE hero_media_item.url LIKE 'https://drive.google.com/uc?id=%'
  AND m.drive_id = SPLIT_PART(SPLIT_PART(hero_media_item.url, 'id=', 2), '&', 1)
  AND m.storage_path IS NOT NULL
  AND m.storage_path != '';

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

SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN url LIKE '%supabase.co/storage%' THEN 1 END) as supabase_storage_urls,
    COUNT(CASE WHEN url LIKE 'https://drive.google.com/uc?id=%' THEN 1 END) as google_drive_urls
FROM hero_media_item;

