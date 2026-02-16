# YANC CMS Supabase Setup Guide

## Database Setup

Since we've migrated from Prisma to Supabase JS client, you need to manually create the database tables in your Supabase project.

### Steps:

1. **Run the Setup Script**:
   ```bash
   # On Windows
   setup-supabase.bat
   
   # Or manually follow the steps below
   ```

2. **Manual Setup**:
   - Open [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project: `cudusictxvzcfcbfrxbi`
   - Go to **SQL Editor** in the left sidebar
   - Copy and paste the contents of `supabase-setup.sql`
   - Click **Run** to execute

### What Gets Created:

The SQL script will create these tables:

- **`media`** - Stores uploaded file metadata
- **`hero_content`** - Stores hero section content
- **`hero_media_item`** - Stores hero section media items

Plus:
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic `updated_at` timestamp triggers
- Sample hero content

### After Setup:

1. Restart your backend server:
   ```bash
   cd apps/cms-api
   npm run start:dev
   ```

2. Test the connection:
   ```bash
   # Check database health
   curl http://localhost:3001/api/health/db
   # Should return: {"database":"connected","timestamp":"..."}
   ```

### Troubleshooting:

If the database still shows as unavailable:
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that the SQL script ran successfully in Supabase
- Ensure your Supabase project is active (not paused)
- Restart the backend server after making changes

The application will continue to work in degraded mode (with limited functionality) if the database connection fails.