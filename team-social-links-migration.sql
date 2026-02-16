-- YANC CMS Database Migration - Team Member Social Links
-- Run this in your Supabase SQL editor to ensure proper team member social link setup

-- The social_links table already created in the previous migration handles team member links
-- with the following structure:
-- entity_type: 'team_member', 'founder', etc.
-- entity_id: the UUID of the team member
-- platform: 'linkedin', 'twitter', 'github', 'website', etc.
-- url: the actual social media URL

-- Insert some sample social links for team members (if needed)
-- This is just an example of how to add social links for a team member:
/*
INSERT INTO social_links (entity_type, entity_id, platform, url, is_active)
VALUES 
  ('team_member', 'TEAM_MEMBER_ID_HERE', 'linkedin', 'https://linkedin.com/in/example', true),
  ('team_member', 'TEAM_MEMBER_ID_HERE', 'twitter', 'https://twitter.com/example', true),
  ('team_member', 'TEAM_MEMBER_ID_HERE', 'website', 'https://example.com', true)
ON CONFLICT DO NOTHING;
*/

-- Verify the social_links table exists and has proper structure
-- This table supports social links for any entity type (team_member, founder, etc.)

-- Add a sample social link for an existing team member (if any exist)
DO $$
DECLARE
  sample_team_member_id UUID;
BEGIN
  SELECT id INTO sample_team_member_id FROM team_members LIMIT 1;
  
  IF sample_team_member_id IS NOT NULL THEN
    INSERT INTO social_links (entity_type, entity_id, platform, url, is_active)
    VALUES 
      ('team_member', sample_team_member_id, 'linkedin', 'https://www.linkedin.com/company/yanc', true),
      ('team_member', sample_team_member_id, 'twitter', 'https://twitter.com/yanc', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;