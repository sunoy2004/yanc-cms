-- Step 5: Make section column NOT NULL
ALTER TABLE team_members 
ALTER COLUMN section SET NOT NULL;