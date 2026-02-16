-- Mentor Talks Database Schema Migration
-- Run this in your Supabase SQL editor to set up mentor talks functionality

-- Create Mentor Talks table
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

-- Create Mentor Talk Gallery Items table (for media associated with talks)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_talks_published ON mentor_talks(is_published);
CREATE INDEX IF NOT EXISTS idx_mentor_talks_date ON mentor_talks(talk_date DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_talks_order ON mentor_talks(display_order);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_gallery_talk_id ON mentor_talk_gallery_items(mentor_talk_id);
CREATE INDEX IF NOT EXISTS idx_mentor_talk_gallery_order ON mentor_talk_gallery_items(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE mentor_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_talk_gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to published talks
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

-- Create policies for admin access
CREATE POLICY "Admins can manage mentor talks" ON mentor_talks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage mentor talk gallery items" ON mentor_talk_gallery_items
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO mentor_talks (title, speaker, speaker_bio, talk_date, description, content, video_url, is_published, display_order) VALUES
('Building Resilient Startups', 'Dr. James Wilson', 'Serial entrepreneur and venture capitalist with 20+ years experience.', '2024-03-20', 'Learn key strategies for building startups that can weather any storm.', 'Full talk content and transcript...', 'https://youtube.com/watch?v=example', true, 1),
('The Future of AI in Business', 'Dr. Sarah Lee', 'AI researcher and founder of TechVision Labs.', '2024-03-15', 'Explore how AI is transforming business operations and strategy.', 'Full talk content and transcript...', 'https://youtube.com/watch?v=example2', true, 2),
('Leadership in the Digital Age', 'Mr. Michael Chen', 'CEO of DigitalFirst Corp and leadership consultant.', '2024-02-28', 'Understanding modern leadership principles for digital transformation.', 'Full talk content and transcript...', 'https://youtube.com/watch?v=example3', true, 3);

-- Sample gallery items would be added after media is uploaded through the CMS