-- Fix for team management CMS - improve team member type handling and social links

-- The team_members table already has the type column which handles the different team categories:
-- 'REGULAR', 'FOUNDER', 'ADVISOR', 'MENTOR'
-- But we need to map these to the frontend types: 'executive', 'cohort_founder', 'advisory', 'global_mentor'

-- Update the team_members table to ensure proper type values are mapped correctly
-- Add a migration to ensure proper data consistency

-- First, let's update the team_members table to ensure it can properly handle all team types
-- The current type column already supports 'REGULAR', 'FOUNDER', 'ADVISOR', 'MENTOR'
-- We need to make sure these map properly to frontend types

-- Update existing records to use proper type values if needed
UPDATE team_members 
SET type = CASE 
    WHEN type = 'EXECUTIVE' THEN 'REGULAR'
    WHEN type = 'COHORT_FOUNDER' THEN 'FOUNDER'
    WHEN type = 'ADVISORY_BOARD' THEN 'ADVISOR'
    WHEN type = 'GLOBAL_MENTOR' THEN 'MENTOR'
    ELSE type
END
WHERE type IN ('EXECUTIVE', 'COHORT_FOUNDER', 'ADVISORY_BOARD', 'GLOBAL_MENTOR');

-- Add indexes for better performance when filtering by type
CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(type);
CREATE INDEX IF NOT EXISTS idx_team_members_type_active ON team_members(type, is_active);

-- Ensure the social_links table is properly connected to team members
-- Add foreign key constraint to ensure data integrity
DO $$
BEGIN
    -- Check if the constraint already exists
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

-- Create a view to easily get team members with their social links
CREATE OR REPLACE VIEW team_members_with_social AS
SELECT 
    tm.*,
    json_agg(
        json_build_object(
            'platform', sl.platform,
            'url', sl.url
        )
    ) FILTER (WHERE sl.id IS NOT NULL) AS social_links
FROM team_members tm
LEFT JOIN social_links sl ON sl.entity_id = tm.id AND sl.entity_type = 'team_member' AND sl.is_active = true
GROUP BY tm.id;