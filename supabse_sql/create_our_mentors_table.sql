-- Our Mentors table (public website section)
-- Run in Supabase SQL editor (existing databases).

CREATE TABLE IF NOT EXISTS our_mentors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_our_mentors_active ON our_mentors(is_active);
CREATE INDEX IF NOT EXISTS idx_our_mentors_display_order ON our_mentors(display_order);

ALTER TABLE our_mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access our_mentors" ON our_mentors
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read active our_mentors" ON our_mentors
  FOR SELECT USING (is_active = true);

CREATE TRIGGER update_our_mentors_updated_at 
  BEFORE UPDATE ON our_mentors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

