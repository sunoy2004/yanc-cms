-- Step 2: Add constraint for valid section values
ALTER TABLE team_members 
ADD CONSTRAINT valid_section CHECK (
  section IN ('executive_management', 'cohort_founders', 'advisory_board', 'global_mentors')
);