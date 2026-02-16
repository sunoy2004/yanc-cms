-- Migration to add section column to team_members table
-- This migration adds proper section support for team categorization

-- Add section column to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS section TEXT;

-- Add constraint to ensure valid section values
ALTER TABLE team_members 
ADD CONSTRAINT valid_section CHECK (
  section IN ('executive_management', 'cohort_founders', 'advisory_board', 'global_mentors')
);

-- Create index for better performance on section queries
CREATE INDEX IF NOT EXISTS idx_team_members_section ON team_members(section);

-- Update existing records to map old type values to new section values
UPDATE team_members 
SET section = CASE 
  WHEN type = 'REGULAR' THEN 'executive_management'
  WHEN type = 'FOUNDER' THEN 'cohort_founders'
  WHEN type = 'ADVISOR' THEN 'advisory_board'
  WHEN type = 'MENTOR' THEN 'global_mentors'
  ELSE 'executive_management' -- default fallback
END
WHERE section IS NULL;

-- Make section column NOT NULL after migration
ALTER TABLE team_members 
ALTER COLUMN section SET NOT NULL;

-- Drop the old type column since we're using section now
-- ALTER TABLE team_members DROP COLUMN IF EXISTS type;

-- Update the team_members_with_social view to include section
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

-- Sample data for each section if needed
-- INSERT INTO team_members (name, role, title, bio, section, is_active, "order") VALUES
-- ('John Executive', 'CEO', 'Chief Executive Officer', 'Executive bio...', 'executive_management', true, 1),
-- ('Jane Founder', 'Founder', 'Cohort 2023 Founder', 'Founder bio...', 'cohort_founders', true, 1),
-- ('Bob Advisor', 'Advisor', 'Industry Expert', 'Advisor bio...', 'advisory_board', true, 1),
-- ('Alice Mentor', 'Mentor', 'Global Mentor', 'Mentor bio...', 'global_mentors', true, 1)
-- ON CONFLICT DO NOTHING;