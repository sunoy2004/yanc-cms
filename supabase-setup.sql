-- YANC CMS Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Create Media table
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
  description TEXT,
  speaker TEXT,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT CHECK (category IN ('upcoming','past')) DEFAULT 'upcoming',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Gallery table
CREATE TABLE IF NOT EXISTS event_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES event_content(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Highlights table
CREATE TABLE IF NOT EXISTS event_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES event_content(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_hero_media_item_hero_id ON hero_media_item(hero_id);
CREATE INDEX IF NOT EXISTS idx_program_media_item_program_id ON program_media_item(program_id);
CREATE INDEX IF NOT EXISTS idx_event_media_item_event_id ON event_media_item(event_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_media_item_gallery_id ON event_gallery_media_item(event_gallery_id);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_media_item_talk_id ON mentor_talk_media_item(mentor_talk_id);
CREATE INDEX IF NOT EXISTS idx_team_member_media_item_member_id ON team_member_media_item(team_member_id);
CREATE INDEX IF NOT EXISTS idx_founder_media_item_founder_id ON founder_media_item(founder_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_media_item_testimonial_id ON testimonial_media_item(testimonial_id);

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
ALTER TABLE hero_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_gallery_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_talk_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_media_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_us_media_item ENABLE ROW LEVEL SECURITY;

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

-- Insert sample hero content
INSERT INTO hero_content (title, subtitle, cta_text, cta_url, is_active)
VALUES (
  'Welcome to YANC CMS',
  'Your modern content management system is ready to use',
  'Get Started',
  '#',
  true
) ON CONFLICT DO NOTHING;

-- Insert sample about us content
INSERT INTO about_us (headline, description, vision_title, vision_desc, mission_title, mission_desc, is_active)
VALUES (
  'About Us',
  'Empowering Young Minds through Life Skills\n\nNetworking and life skills are crucial in today''s fast-paced world.',
  'Vision',
  'Empowering young minds together.',
  'Mission',
  'Building better people for better Tomorrow.',
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