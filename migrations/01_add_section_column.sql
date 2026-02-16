-- Step 1: Add section column
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS section TEXT;