-- Combined Team Section Migration Script
-- Run this in your Supabase SQL editor to add the section column to team_members table

-- Step 1: Add section column
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS section TEXT;

-- Step 2: Add constraint for valid section values
ALTER TABLE team_members 
ADD CONSTRAINT valid_section CHECK (
  section IN ('executive_management', 'cohort_founders', 'advisory_board', 'global_mentors')
);

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_team_members_section ON team_members(section);

-- Step 4: Update existing records to map old type values to new section values
UPDATE team_members 
SET section = CASE 
  WHEN type = 'REGULAR' THEN 'executive_management'
  WHEN type = 'FOUNDER' THEN 'cohort_founders'
  WHEN type = 'ADVISOR' THEN 'advisory_board'
  WHEN type = 'MENTOR' THEN 'global_mentors'
  ELSE 'executive_management' -- default fallback
END
WHERE section IS NULL;

-- Step 5: Make section column NOT NULL
ALTER TABLE team_members 
ALTER COLUMN section SET NOT NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN section = 'executive_management' THEN 1 END) as executive_count,
  COUNT(CASE WHEN section = 'cohort_founders' THEN 1 END) as founders_count,
  COUNT(CASE WHEN section = 'advisory_board' THEN 1 END) as advisory_count,
  COUNT(CASE WHEN section = 'global_mentors' THEN 1 END) as mentors_count
FROM team_members 
WHERE is_active = true;