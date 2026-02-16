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