-- Add registration_url to event_content for "Register Now" CTA on upcoming events
ALTER TABLE event_content
ADD COLUMN IF NOT EXISTS registration_url TEXT;

COMMENT ON COLUMN event_content.registration_url IS 'URL for the Register Now button on the frontend upcoming events section';
