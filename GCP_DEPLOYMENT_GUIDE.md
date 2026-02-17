# 🚀 Free GCP Deployment Guide for YANC CMS

This guide will help you deploy your entire YANC CMS website on Google Cloud Platform for free using Cloud Run and other free-tier services.

## 🎯 Overview

YANC CMS consists of:
- **Backend API**: NestJS application in `apps/cms-api`
- **Frontend**: React application in `apps/cms-web`
- **Database**: External Supabase PostgreSQL (you'll need your own account)
- **Storage**: Supabase Storage for media files

## 📋 Prerequisites

1. **Google Cloud Account** with billing information (required for free tier, but usage stays within free limits)
2. **Supabase Account** with PostgreSQL database and Storage bucket
3. **GitHub Repository** containing your YANC CMS code

## 🚀 Step-by-Step Browser-Based Deployment

### Step 1: Prepare Your GitHub Repository

1. Push your complete YANC CMS code to a GitHub repository
2. Make sure your repository contains:
   - Dockerfiles for both backend (`apps/cms-api/Dockerfile`) and frontend (`apps/cms-web/Dockerfile`)
   - Complete codebase with all dependencies

### Step 2: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID (you'll need it later)

### Step 3: Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Enable these APIs:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Artifact Registry API**

### Step 4: Prepare Supabase Database

1. Create a Supabase project at [supabase.io](https://supabase.io)
2. Set up your database tables using the SQL schema from your project
3. Note your:
   - Supabase URL
   - Supabase Anon Key
   - Supabase Service Role Key

### Step 5: Deploy Backend API

1. In Google Cloud Console, navigate to **Cloud Run**
2. Click **Create Service**
3. Configure as follows:
   - **Source**: Deploy from source repository
   - **Repository**: Connect to your GitHub repository
   - **Repository**: Select your YANC CMS repository
   - **Directory**: `apps/cms-api`
   - **Language**: Node.js (or Other)
   - **Containerize your application**: Check this box
   - **Region**: Select closest to your users (e.g., asia-south1, us-central1, europe-west1)
   - **Allow unauthenticated requests**: Check this box
   - **Container port**: 8080
   - **CPU allocation**: Allocate CPU only during request processing
   - **Memory**: 512 MB
   - **Minimum instances**: 0 (free tier)
   - **Maximum instances**: 1 (to stay in free tier)

4. Click **Next** and set environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: production

5. Click **Deploy**

### Step 6: Deploy Frontend

1. Go back to Cloud Run dashboard
2. Click **Create Service**
3. Configure as follows:
   - **Source**: Deploy from source repository
   - **Repository**: Connect to your GitHub repository
   - **Repository**: Select your YANC CMS repository
   - **Directory**: `apps/cms-web`
   - **Language**: Other (since it's a static site served by nginx)
   - **Containerize your application**: Check this box
   - **Region**: Same as backend (recommended)
   - **Allow unauthenticated requests**: Check this box
   - **Container port**: 8080
   - **CPU allocation**: Allocate CPU only during request processing
   - **Memory**: 256 MB
   - **Minimum instances**: 0 (free tier)
   - **Maximum instances**: 1 (to stay in free tier)

4. Click **Next** and set environment variables:
   - `VITE_API_URL`: Your backend service URL (e.g., `https://your-backend-service-xyz-uc.a.run.app/api`)

5. Click **Deploy**

### Step 7: Configure CORS (if needed)

If you encounter CORS issues, you may need to update your backend to accept your frontend's domain:

1. In your backend's `main.ts`, ensure CORS allows your frontend domain:
   ```typescript
   app.enableCors({
     origin: ['https://your-frontend-service-xyz-uc.a.run.app'], // Your frontend URL
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   });
   ```

### Step 8: Set Up Custom Domain (Optional)

To use a custom domain:

1. In Cloud Run, go to your deployed services
2. Click on **Custom domains**
3. Add your custom domain and follow the verification process

## 💰 Staying Within Free Tier

To ensure your deployment stays within Google Cloud's free tier:

1. **Maximum instances**: Keep at 1 for each service
2. **CPU allocation**: Use "Allocate CPU only during request processing"
3. **Memory**: Use 256-512 MB (within free tier limits)
4. **Minimum instances**: Keep at 0 to avoid idle charges

Monthly free tier includes:
- 2 million requests per month
- 360,000 GHz-seconds of compute time
- 5GB of storage in Artifact Registry

## 🔐 Security Best Practices

1. **Never expose secrets in frontend** - All sensitive keys should be in backend environment variables
2. **Use strong JWT secret** - Generate a random string at least 32 characters long
3. **Validate inputs** - The backend should validate all incoming data
4. **Keep dependencies updated** - Regularly update packages to patch security vulnerabilities

## 🔄 Continuous Deployment

To set up automatic deployment on GitHub commits:

1. In Cloud Run, go to your service
2. Click on **Triggers** tab
3. Enable Cloud Build triggers to auto-deploy on GitHub pushes

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Timeout**: Ensure your database connection string is correct
2. **CORS Errors**: Check that your frontend URL is in the backend's CORS configuration
3. **Environment Variables**: Verify all required environment variables are set
4. **Build Failures**: Check Cloud Build logs for dependency issues

### Accessing Logs:

1. In Cloud Run, go to your service
2. Click on the **Logs** tab to see real-time application logs
3. Use filters to narrow down specific errors

## 📞 Support

For additional help:
- Check the logs in Google Cloud Console
- Verify your Supabase connection details
- Ensure your Dockerfiles are properly configured

---

**🎉 Congratulations!** Your YANC CMS website is now deployed on Google Cloud Platform and accessible globally!