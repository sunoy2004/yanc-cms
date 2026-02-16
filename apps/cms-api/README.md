# YANC CMS Backend API

Production-grade backend for YANC CMS with NestJS, Prisma, Supabase, and Google Drive integration.

## Tech Stack

- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Storage**: Google Drive API
- **Authentication**: JWT
- **Deployment**: Ready for production

## Prerequisites

1. Node.js 18+
2. Supabase account
3. Google Cloud Platform account
4. Google Drive API enabled

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Fill in the required environment variables:

#### Database (Supabase)
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

#### Google Drive
```env
GOOGLE_PROJECT_ID="[PROJECT-ID]"
GOOGLE_CLIENT_EMAIL="[SERVICE-ACCOUNT-EMAIL]"
GOOGLE_PRIVATE_KEY="[PRIVATE-KEY]"
GOOGLE_DRIVE_ROOT_FOLDER_ID="[ROOT-FOLDER-ID]"
```

#### Authentication
```env
JWT_SECRET="[YOUR-SECRET-KEY]"
JWT_EXPIRES_IN="24h"
```

### 2. Google Drive Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable Google Drive API

2. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file
   - Copy credentials to `.env`

3. **Setup Drive Folder**
   - Create folder in Google Drive
   - Share folder with service account email
   - Copy folder ID to `GOOGLE_DRIVE_ROOT_FOLDER_ID`

### 3. Database Setup

1. **Initialize Prisma**
   ```bash
   npm run prisma:generate
   ```

2. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Database** (optional)
   ```bash
   # Create seed script in prisma/seed.ts
   npm run prisma:seed
   ```

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Media Management
```
POST /api/media/upload
GET  /api/media
DELETE /api/media/:id
```

### Content Management (CMS APIs)
```
# Hero Content
GET    /api/cms/hero
POST   /api/cms/hero
PUT    /api/cms/hero/:id
DELETE /api/cms/hero/:id

# Programs
GET    /api/cms/programs
POST   /api/cms/programs
PUT    /api/cms/programs/:id
DELETE /api/cms/programs/:id

# Events
GET    /api/cms/events
POST   /api/cms/events
PUT    /api/cms/events/:id
DELETE /api/cms/events/:id

# Team Members
GET    /api/cms/team
POST   /api/cms/team
PUT    /api/cms/team/:id
DELETE /api/cms/team/:id
```

### Public APIs (Website)
```
GET /api/hero          # Active hero content
GET /api/programs      # Active programs
GET /api/events        # Active events
GET /api/team          # Active team members
GET /api/testimonials  # Active testimonials
```

## Folder Structure

```
src/
├── modules/
│   ├── auth/          # Authentication module
│   ├── media/         # Media upload handling
│   ├── hero/          # Hero content management
│   ├── programs/      # Program management
│   ├── events/        # Event management
│   ├── team/          # Team member management
│   └── ...            # Other CMS modules
├── prisma/            # Prisma service
├── google-drive/      # Google Drive integration
└── common/            # Shared utilities
```

## Google Drive Folder Structure

The system automatically creates this structure:
```
/YANC_MEDIA
  /hero
  /events
  /events/gallery
  /programs
  /mentor-talks
  /team
  /founders
  /testimonials
  /uploads
```

## Security Features

- JWT-based authentication
- File type validation
- Size limits enforcement
- Public/private file permissions
- Input sanitization
- Rate limiting (to be implemented)

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Environment for Production
Ensure all environment variables are set in production environment.

### Health Checks
```
GET /api/health
```

## Troubleshooting

### Common Issues

1. **Prisma Connection Error**
   - Verify DATABASE_URL format
   - Check Supabase credentials
   - Run `npm run prisma:generate`

2. **Google Drive Upload Failures**
   - Verify service account credentials
   - Check folder sharing permissions
   - Ensure proper scopes are granted

3. **JWT Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Validate token format

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

UNLICENSED - Proprietary software for YANC CMS