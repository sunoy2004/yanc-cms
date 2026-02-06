@echo off
echo YANC CMS Supabase Database Setup
echo ================================

echo 1. Open your Supabase dashboard at https://supabase.com/dashboard
echo 2. Select your project: cudusictxvzcfcbfrxbi
echo 3. Go to SQL Editor in the left sidebar
echo 4. Copy and paste the contents of supabase-setup.sql
echo 5. Click "Run" to execute the SQL script

echo.
echo This will create:
echo - media table (for uploaded files)
echo - hero_content table (for hero section content)
echo - hero_media_item table (for hero media items)
echo - Proper indexes and RLS policies
echo - Sample hero content

echo.
echo After running the script, restart your backend server to test the connection.
echo The database health check should show "connected" instead of "unavailable".

pause