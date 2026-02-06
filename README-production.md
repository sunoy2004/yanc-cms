# YANC CMS - Production-Ready Headless CMS

A modern, production-ready headless CMS built with NestJS, Prisma, Supabase, and Google Drive integration.

## 🏗️ Architecture Overview

```
CMS Frontend (React/Vite)
        ↓ REST API
CMS Backend (NestJS + Prisma)
        ↓
Supabase PostgreSQL (metadata only)
        ↓
Google Drive (media storage only)
```

## 🚀 Key Features

- **Pure Headless Architecture**: No mock modes, no temporary storage
- **Real Database Integration**: Direct Supabase PostgreSQL connection
- **Google Drive Media Storage**: Secure file handling with service accounts
- **Production-Grade Security**: JWT authentication, input validation, rate limiting
- **Responsive Frontend**: Mobile-first React components with ShadCN UI
- **TypeScript Everywhere**: Full type safety across frontend and backend

## 📁 Project Structure

```
yanc-cms/
├── apps/
│   └── cms-api/              # NestJS Backend
│       ├── src/
│       │   ├── common/       # Shared utilities
│       │   ├── dtos/         # Data Transfer Objects
│       │   ├── google-drive/ # Google Drive integration
│       │   ├── modules/      # Feature modules
│       │   │   ├── auth/     # Authentication
│       │   │   └── media/    # Media management
│       │   ├── prisma/       # Database layer
│       │   └── storage/      # Local storage (fallback)
│       ├── prisma/           # Prisma schema and migrations
│       └── .env              # Backend environment
├── src/                      # React Frontend
│   ├── components/           # UI Components
│   │   └── cms/             # CMS-specific components
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   └── pages/               # Page components
├── .env.local               # Frontend environment
└── validate-cms.js          # Validation script
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require"

# Supabase Configuration
SUPABASE_URL="https://project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google Drive Configuration
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_ROOT_FOLDER_ID="folder-id"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_MOCK_DATA=false
VITE_DEBUG_MODE=false
```

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
cd apps/cms-api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run start:dev
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Validation

```bash
# Run validation script
node validate-cms.js
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT

### Media Management
- `POST /api/media/upload` - Upload media files
- `GET /api/media` - List all media
- `DELETE /api/media/:id` - Delete media

### Content Management
- `POST /api/hero` - Create hero content
- `GET /api/hero` - Get hero content
- `PUT /api/hero/:id` - Update hero content
- `DELETE /api/hero/:id` - Delete hero content

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Class-validator DTOs for all endpoints
- **CORS Protection**: Configurable CORS policies
- **Rate Limiting**: Built-in request throttling
- **File Validation**: Size and type restrictions
- **Error Handling**: Comprehensive error responses

## 📱 Responsive Design

The frontend is built with mobile-first principles using:
- Tailwind CSS for responsive styling
- ShadCN UI components
- Flexible grid layouts
- Touch-friendly interactions

## 🚨 Error Handling

The system implements comprehensive error handling:
- **Database Errors**: Graceful degradation with clear error messages
- **File Upload Errors**: Detailed validation feedback
- **Authentication Errors**: Proper HTTP status codes
- **Network Errors**: Robust retry mechanisms

## 📊 Monitoring & Logging

- Structured logging with NestJS Logger
- Health check endpoints
- Database connection monitoring
- Performance metrics collection

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set strong JWT secret
- [ ] Configure proper CORS origins
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Enable HTTPS
- [ ] Configure backup strategies
- [ ] Set up monitoring and alerts

### Environment-Specific Configuration

```bash
# Production environment
NODE_ENV=production
PORT=3001
DATABASE_URL=your-production-db-url
JWT_SECRET=your-production-secret
```

## 🧪 Testing

### Manual Testing Steps

1. **Database Connectivity**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **File Upload Test**
   ```bash
   curl -X POST http://localhost:3001/api/media/upload \
     -F "file=@test-image.jpg" \
     -F "folder=hero"
   ```

3. **Frontend Integration**
   - Navigate to CMS dashboard
   - Upload media files
   - Verify files appear in Google Drive
   - Check database records

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Ensure network connectivity

2. **Google Drive Upload Failed**
   - Verify service account credentials
   - Check folder permissions
   - Review Google Drive API quotas

3. **CORS Errors**
   - Update CORS configuration in main.ts
   - Verify frontend URL matches allowed origins

4. **File Upload Issues**
   - Check file size limits
   - Verify supported file types
   - Review server logs for detailed errors

## 📈 Performance Optimization

- **Database**: Connection pooling, query optimization
- **File Storage**: CDN integration for served files
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip/Brotli compression
- **Lazy Loading**: Code splitting in frontend

## 🔄 Maintenance

Regular maintenance tasks:
- Database backup and cleanup
- Dependency updates
- Security audits
- Performance monitoring
- Log rotation

## 📄 License

This project is proprietary software developed for YANC.

## 👥 Support

For technical support, please contact the development team.