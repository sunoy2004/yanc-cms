-- Update existing hero content with sample descriptions
UPDATE hero_content 
SET description = 'Your modern content management system is ready to use'
WHERE title = 'Welcome to YANC CMS' AND description IS NULL;

-- Add sample descriptions for any other existing records
UPDATE hero_content 
SET description = COALESCE(description, 'Join our community today')
WHERE description IS NULL;