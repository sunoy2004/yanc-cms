# Quick Start Guide for YANC Headless CMS with Google Drive Integration

## Prerequisites
- Node.js 18+
- PostgreSQL
- Docker (optional but recommended)
- Google Drive API credentials

## Development Setup

### 1. Clone and Setup
```bash
# Navigate to your project
cd e:\yanc-website-main

# Create CMS directory
mkdir yanc-cms
cd yanc-cms
```

### 2. Google Drive Setup
```bash
# Set up Google Drive API credentials
# 1. Go to Google Cloud Console
# 2. Create a new project or select existing one
# 3. Enable Google Drive API
# 4. Create credentials (OAuth 2.0 or Service Account)
# 5. Download credentials JSON file
# 6. Share folders with the service account email if using service account

# Create Google Drive folder structure
# - YANC-CMS/
#   - hero-media/
#   - event-images/
#   - mentor-talks/
#   - team-members/
#   - testimonials/
```

### 3. Database Setup (Docker)
```bash
# Start PostgreSQL container
docker run -d \
  --name yanc-cms-db \
  -e POSTGRES_USER=yanc \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=yanc_cms \
  -p 5432:5432 \
  postgres:15

# Verify database is running
docker ps
```

### 4. API Server Setup
```bash
# Create API app
mkdir apps/cms-api
cd apps/cms-api

# Initialize Node.js project
npm init -y
npm install express cors helmet dotenv @prisma/client bcryptjs jsonwebtoken googleapis multer

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/multer ts-node nodemon prisma

# Initialize TypeScript
npx tsc --init
```

### 5. Admin Dashboard Setup
```bash
# From yanc-cms root
mkdir apps/cms-admin
cd apps/cms-admin

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install additional dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs lucide-react react-dropzone
```

### 6. Environment Configuration

**apps/cms-api/.env**
```env
DATABASE_URL="postgresql://yanc:password123@localhost:5432/yanc_cms"
JWT_SECRET="your-super-secret-jwt-key-here-change-this"
GOOGLE_DRIVE_CLIENT_ID="your-google-drive-client-id"
GOOGLE_DRIVE_CLIENT_SECRET="your-google-drive-client-secret"
GOOGLE_DRIVE_REFRESH_TOKEN="your-google-drive-refresh-token"
GOOGLE_DRIVE_FOLDER_ID="your-google-drive-folder-id"
ADMIN_EMAIL="admin@yanc.in"
ADMIN_PASSWORD="your-secure-admin-password"
PORT=3001
NODE_ENV=development
```

**apps/cms-admin/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 7. Database Migration
```bash
# In apps/cms-api directory
npx prisma migrate dev --name init
npx prisma generate
```

### 8. Seed Initial Data
```bash
# Create seed script
npx prisma db seed
```

## Running the System

### Development Mode
```bash
# Terminal 1: Start database (if not running)
docker start yanc-cms-db

# Terminal 2: Start API server
cd apps/cms-api
npm run dev

# Terminal 3: Start Admin Dashboard
cd apps/cms-admin
npm run dev
```

### Production Build
```bash
# Build API
cd apps/cms-api
npm run build

# Build Admin Dashboard
cd apps/cms-admin
npm run build

# Start production servers
npm start  # in respective directories
```

## Google Drive Integration

### Media Upload Process
```bash
# When uploading media through the CMS:
# 1. File is sent to the API server
# 2. API server uploads to Google Drive
# 3. API stores the shareable link in the database
# 4. Frontend retrieves the Google Drive link to display media
```

### Making Files Public
```javascript
// Ensure Google Drive files are publicly accessible
// Either:
// 1. Set folder permissions to "Anyone with the link can view"
// 2. Or use service account with appropriate sharing permissions
```

## Testing the Integration

### 1. Test API Endpoints
```bash
# Test public content endpoint
curl http://localhost:3001/api/content/programs

# Test admin authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yanc.in","password":"your-password"}'
```

### 2. Test Google Drive Upload
```bash
# Test Google Drive upload functionality
curl -X POST http://localhost:3001/api/media/google-drive \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

### 3. Connect Website to CMS
```bash
# In your main YANC website directory
# Update .env file
echo "REACT_APP_CMS_API_URL=http://localhost:3001" >> .env

# Restart development server
npm run dev
```

## Self-Hosting Deployment

### Docker Compose for Production
```yaml
# docker-compose.yml
version: '3.8'
services:
  cms-db:
    image: postgres:15
    environment:
      POSTGRES_DB: yanc_cms
      POSTGRES_USER: yanc
      POSTGRES_PASSWORD: secure_password
    volumes:
      - cms_postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  cms-api:
    build: ./apps/cms-api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://yanc:secure_password@cms-db:5432/yanc_cms
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_DRIVE_CLIENT_ID: ${GOOGLE_DRIVE_CLIENT_ID}
      GOOGLE_DRIVE_CLIENT_SECRET: ${GOOGLE_DRIVE_CLIENT_SECRET}
      GOOGLE_DRIVE_REFRESH_TOKEN: ${GOOGLE_DRIVE_REFRESH_TOKEN}
      GOOGLE_DRIVE_FOLDER_ID: ${GOOGLE_DRIVE_FOLDER_ID}
    depends_on:
      - cms-db
    restart: unless-stopped

  cms-admin:
    build: ./apps/cms-admin
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    restart: unless-stopped

volumes:
  cms_postgres_data:
```

### Deployment Commands
```bash
# Deploy the entire system
docker-compose up -d

# Check running services
docker-compose ps

# View logs
docker-compose logs -f
```

## Common Issues and Solutions

### Google Drive Connection Issues
```bash
# Verify Google Drive credentials are correct
# Check if the service account has access to the specified folder
# Ensure files have appropriate sharing permissions
```

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep yanc-cms-db

# Restart database container
docker restart yanc-cms-db

# Check database logs
docker logs yanc-cms-db
```

### API Server Issues
```bash
# Check API server logs
npm run dev  # Look for error messages

# Verify environment variables
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL%  # Windows
```

### CORS Issues
```javascript
// In apps/cms-api/src/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://yourdomain.com'],
  credentials: true
}));
```

## Next Steps

1. **Customize the admin interface** with your branding
2. **Add content validation** rules
3. **Set up automated backups**
4. **Configure monitoring** and alerts
5. **Deploy to production** environment
6. **Optimize Google Drive** folder structure and permissions
7. **Implement cache layer** for improved performance

This quick start guide gives you everything needed to begin building your YANC self-hosted headless CMS system with Google Drive integration!