-- Enhanced Team Management CMS Setup

-- Ensure proper indexes exist for efficient querying by type
CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(type);
CREATE INDEX IF NOT EXISTS idx_team_members_type_active ON team_members(type, is_active);

-- Create a more comprehensive view for team members with social links
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

-- Update the team_member_media_item table to ensure proper relationships
DO $$
BEGIN
    -- Check if the constraint already exists
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

    -- Check if the constraint already exists
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

-- Add sample team members for each type if none exist
DO $$
DECLARE
  exec_count INTEGER;
  founder_count INTEGER;
  advisor_count INTEGER;
  mentor_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exec_count FROM team_members WHERE type = 'REGULAR';
  SELECT COUNT(*) INTO founder_count FROM team_members WHERE type = 'FOUNDER';
  SELECT COUNT(*) INTO advisor_count FROM team_members WHERE type = 'ADVISOR';
  SELECT COUNT(*) INTO mentor_count FROM team_members WHERE type = 'MENTOR';

  -- Insert sample executive if none exist
  IF exec_count = 0 THEN
    INSERT INTO team_members (name, role, title, bio, type, is_active, "order") 
    VALUES ('John Smith', 'CEO', 'Chief Executive Officer', 'Leading the organization with vision and strategy.', 'REGULAR', true, 1);
  END IF;

  -- Insert sample founder if none exist
  IF founder_count = 0 THEN
    INSERT INTO team_members (name, role, title, bio, type, is_active, "order") 
    VALUES ('Jane Doe', 'Founder', 'Co-Founder & Visionary', 'Founded the organization with innovative ideas.', 'FOUNDER', true, 1);
  END IF;

  -- Insert sample advisor if none exist
  IF advisor_count = 0 THEN
    INSERT INTO team_members (name, role, title, bio, type, is_active, "order") 
    VALUES ('Robert Johnson', 'Advisor', 'Senior Advisor', 'Providing strategic guidance and expertise.', 'ADVISOR', true, 1);
  END IF;

  -- Insert sample mentor if none exist
  IF mentor_count = 0 THEN
    INSERT INTO team_members (name, role, title, bio, type, is_active, "order") 
    VALUES ('Sarah Williams', 'Mentor', 'Senior Mentor', 'Mentoring the next generation of leaders.', 'MENTOR', true, 1);
  END IF;
END $$;

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Service role can access team_member_media_item" ON team_member_media_item;
CREATE POLICY "Service role can access team_member_media_item" ON team_member_media_item
  FOR ALL USING (true) WITH CHECK (true);

-- Update the trigger to handle updates properly
DROP TRIGGER IF EXISTS update_team_member_media_item_updated_at ON team_member_media_item;
CREATE TRIGGER update_team_member_media_item_updated_at 
  BEFORE UPDATE ON team_member_media_item 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();