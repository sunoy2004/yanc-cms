# YANC Headless CMS Implementation Pipeline with Google Drive Integration

## Phase 1: Foundation Setup (Week 1-2)

### 1.1 Project Initialization
```bash
# Create monorepo structure
mkdir yanc-cms-system
cd yanc-cms-system
npm init -y

# Setup workspace structure
mkdir -p apps/cms-admin apps/cms-api apps/website
mkdir -p packages/shared-types packages/ui-components packages/api-client
```

### 1.2 Google Drive Setup
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
#   - gallery-items/
```

### 1.3 Database Setup
```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Copy schema from design file
cp ../yanc-website-main/cms-design/prisma-schema.prisma prisma/schema.prisma

# Setup PostgreSQL (using Docker for development)
docker run -d \
  --name yanc-postgres \
  -e POSTGRES_USER=yanc \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=yanc_cms \
  -p 5432:5432 \
  postgres:15

# Create initial admin user
npx prisma db seed
```

### 1.4 Environment Configuration
Create `.env` files for each service:

**apps/cms-api/.env**
```
DATABASE_URL="postgresql://yanc:password@localhost:5432/yanc_cms"
JWT_SECRET="your-jwt-secret-here"
GOOGLE_DRIVE_CLIENT_ID="your-google-drive-client-id"
GOOGLE_DRIVE_CLIENT_SECRET="your-google-drive-client-secret"
GOOGLE_DRIVE_REFRESH_TOKEN="your-google-drive-refresh-token"
GOOGLE_DRIVE_FOLDER_ID="your-google-drive-folder-id"
ADMIN_EMAIL="admin@yanc.in"
ADMIN_PASSWORD="secure-admin-password"
PORT=3001
```

**apps/cms-admin/.env**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Phase 2: API Development (Week 3-4)

### 2.1 Core API Structure
```
apps/cms-api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── admin.ts
│   │   ├── media.ts
│   │   └── google-drive.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   └── cors.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── google-drive.ts
│   │   └── jwt.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 2.2 Key API Implementation Examples

**Google Drive Integration:**
```typescript
// apps/cms-api/src/lib/google-drive.ts
import { google } from 'googleapis';
import fs from 'fs';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  'http://localhost:3001/oauth2callback'
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth });

export const uploadToGoogleDrive = async (filePath: string, fileName: string, mimeType: string) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!]
      },
      media: {
        mimeType: mimeType,
        body: fs.createReadStream(filePath)
      }
    });
    
    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Return shareable link
    return `https://drive.google.com/uc?id=${response.data.id}`;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

export const deleteFromGoogleDrive = async (fileId: string) => {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw error;
  }
};
```

**Authentication Middleware:**
```typescript
// apps/cms-api/src/middleware/auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

**Content API Route:**
```typescript
// apps/cms-api/src/routes/content.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Public content endpoints
router.get('/hero', async (req, res) => {
  try {
    const heroContent = await prisma.heroContent.findFirst({
      where: { isActive: true },
      include: { mediaItems: { orderBy: { order: 'asc' } } }
    });
    res.json(heroContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero content' });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.get('/gallery-items', async (req, res) => {
  try {
    const galleryItems = await prisma.mediaItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Add similar routes for other content types...
```

## Phase 3: Admin Dashboard (Week 5-6)

### 3.1 Admin UI Structure
```
apps/cms-admin/
├── src/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── content/
│   │   │   ├── hero/page.tsx
│   │   │   ├── sections/page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   ├── mentor-talks/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── event-galleries/page.tsx
│   │   │   ├── gallery-items/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── SectionManager.tsx
│   │   │   ├── MentorTalkManager.tsx
│   │   │   ├── EventGalleryManager.tsx
│   │   │   ├── GalleryManager.tsx
│   │   │   └── MediaUploader.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── Table.tsx
│   ├── lib/
│   │   ├── api-client.ts
│   │   └── auth.ts
│   └── styles/
│       └── globals.css
├── package.json
└── next.config.js
```

### 3.2 Key Admin Components

**Media Uploader with Google Drive Integration:**
```typescript
// apps/cms-admin/src/components/admin/MediaUploader.tsx
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface MediaUploaderProps {
  onUploadComplete: (fileUrl: string) => void;
  acceptedTypes?: string;
  multiple?: boolean;
}

export function MediaUploader({ onUploadComplete, acceptedTypes = 'image/*,video/*', multiple = false }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Google Drive via API
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/media/google-drive', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        onUploadComplete(result.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        multiple={multiple}
        className="hidden"
      />
      <Button 
        onClick={triggerFileSelect} 
        disabled={isUploading}
        variant="outline"
      >
        {isUploading ? `Uploading... ${uploadProgress}%` : 'Select Media'}
      </Button>
      {isUploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </Card>
  );
}
```

**Gallery Manager Component:**
```typescript
// apps/cms-admin/src/components/admin/GalleryManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { MediaUploader } from './MediaUploader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface GalleryManagerProps {
  galleryId?: string;
  initialItems?: any[];
}

export function GalleryManager({ galleryId, initialItems = [] }: GalleryManagerProps) {
  const [galleryItems, setGalleryItems] = useState(initialItems);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  
  const handleMediaUpload = (fileUrl: string) => {
    const newItem = {
      id: Date.now().toString(),
      url: fileUrl,
      type: fileUrl.includes('.mp4') || fileUrl.includes('.mov') ? 'VIDEO' : 'IMAGE',
      altText: '',
      caption: '',
      order: galleryItems.length
    };
    
    setGalleryItems([...galleryItems, newItem]);
  };
  
  const handleItemUpdate = (index: number, field: string, value: string) => {
    const updatedItems = [...galleryItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setGalleryItems(updatedItems);
  };
  
  const handleItemDelete = (index: number) => {
    const updatedItems = galleryItems.filter((_, i) => i !== index);
    setGalleryItems(updatedItems);
  };
  
  const moveItem = (fromIndex: number, toIndex: number) => {
    const updatedItems = [...galleryItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    
    // Update order property
    updatedItems.forEach((item, index) => {
      item.order = index;
    });
    
    setGalleryItems(updatedItems);
  };
  
  const saveGallery = async () => {
    // Save gallery to database
    try {
      // Implementation for saving gallery items
      console.log('Saving gallery:', galleryItems);
    } catch (error) {
      console.error('Error saving gallery:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gallery Items</h3>
        <MediaUploader onUploadComplete={handleMediaUpload} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryItems.map((item, index) => (
          <Card key={item.id} className="p-3">
            <div className="mb-2">
              {item.type === 'IMAGE' ? (
                <img 
                  src={item.url} 
                  alt={item.altText || 'Gallery item'} 
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <video 
                  src={item.url} 
                  className="w-full h-32 object-cover rounded"
                  controls={false}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Alt text"
                value={item.altText}
                onChange={(e) => handleItemUpdate(index, 'altText', e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <textarea
                placeholder="Caption"
                value={item.caption}
                onChange={(e) => handleItemUpdate(index, 'caption', e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
                rows={2}
              />
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => moveItem(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => moveItem(index, Math.min(galleryItems.length - 1, index + 1))}
                    disabled={index === galleryItems.length - 1}
                  >
                    ↓
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleItemDelete(index)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={saveGallery}>Save Gallery</Button>
      </div>
    </div>
  );
}
```

## Phase 4: Website Integration (Week 7-8)

### 4.1 Update Existing Website Services

**New CMS API Service with Google Drive Integration:**
```typescript
// src/services/cmsApiService.ts
class CmsApiService {
  private baseUrl = process.env.REACT_APP_CMS_API_URL || 'http://localhost:3001';
  
  async getContent(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/content/${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      // Fallback to mock data
      return this.getMockData(endpoint);
    }
  }

  async getHeroContent() {
    return this.getContent('hero');
  }

  async getPrograms() {
    return this.getContent('programs');
  }

  async getEvents() {
    return this.getContent('events');
  }

  async getTeamMembers() {
    return this.getContent('team');
  }
  
  async getGalleryItems() {
    return this.getContent('gallery-items');
  }

  // Fallback mock data methods...
  private getMockData(endpoint: string) {
    // Return existing mock data as fallback
    const mockData = {
      hero: mockHeroData,
      programs: mockPrograms,
      events: mockEvents,
      team: mockTeamMembers,
      galleryItems: mockGalleryItems
    };
    return mockData[endpoint as keyof typeof mockData] || [];
  }
}

export const cmsApiService = new CmsApiService();
```

### 4.2 Update Components to Use CMS Data

**Updated Gallery Component:**
```typescript
// src/components/gallery/ImageVideoGallery.tsx
import React from "react";
import { MediaItem } from '@/data/mockData'; // This will be replaced with CMS data
import { PlayCircle } from "lucide-react";

interface ImageVideoGalleryProps {
  media: MediaItem[];
  onMediaClick?: (media: MediaItem, index: number) => void;
  className?: string;
  columns?: number; // Number of columns for masonry layout
  maxVisible?: number; // Maximum number of items to show initially
  showViewMore?: boolean; // Whether to show the view more button
  onViewMoreClick?: () => void; // Callback when view more is clicked
  onViewLessClick?: () => void; // Callback when view less is clicked
}

const ImageVideoGallery: React.FC<ImageVideoGalleryProps> = ({
  media,
  onMediaClick,
  className = "",
  columns = 3,
  maxVisible,
  showViewMore = false,
  onViewMoreClick,
  onViewLessClick,
}) => {
  const displayMedia = maxVisible !== undefined && media.length > maxVisible 
    ? media.slice(0, maxVisible)
    : media;
  
  const handleMediaClick = (item: MediaItem, index: number) => {
    if (onMediaClick) {
      onMediaClick(item, index);
    }
  };

  const getGridClass = () => {
    let baseClasses = `grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`;
    
    switch(columns) {
      case 1:
        return `${baseClasses} md:grid-cols-1`;
      case 2:
        return `${baseClasses} md:grid-cols-2`;
      case 3:
        return `${baseClasses} md:grid-cols-3`;
      case 4:
        return `${baseClasses} md:grid-cols-4`;
      case 5:
        return `${baseClasses} md:grid-cols-5`;
      default:
        return `${baseClasses} md:grid-cols-3`;
    }
  };

  return (
    <div className={getGridClass()}>
      {displayMedia.map((item, index) => (
        <div 
          key={item.id}
          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          onClick={() => handleMediaClick(item, index)}
        >
          {item.type === "image" ? (
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                src={item.src}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                muted
                preload="metadata"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                <PlayCircle className="text-white w-12 h-12" />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-xs truncate">{item.alt}</p>
          </div>
        </div>
      ))}
      {(showViewMore && maxVisible !== undefined && media.length > maxVisible) && (
        <div className="col-span-full text-center my-4">
          <button 
            onClick={onViewMoreClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            View More
          </button>
        </div>
      )}
      {(showViewMore && maxVisible !== undefined && media.length > maxVisible && displayMedia.length === media.length) && (
        <div className="col-span-full text-center my-4">
          <button 
            onClick={onViewLessClick}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            View Less
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageVideoGallery;
```

## Phase 5: Real-time Updates & Deployment (Week 9-10)

### 5.1 Google Drive Specific Configurations

**Health Check with Google Drive:**
```typescript
// apps/cms-api/src/routes/health.ts
import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    // Implementation for DB health check
    
    // Check Google Drive connectivity
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      'http://localhost:3001/oauth2callback'
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Try to list files in the folder to verify access
    await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: 'files(id, name)',
      pageSize: 1
    });
    
    res.json({ 
      status: 'healthy', 
      checks: { 
        database: 'ok', 
        googleDrive: 'ok',
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

### 5.2 Self-Hosting Deployment Configuration

**Docker Compose for Production:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  cms-db:
    image: postgres:15
    environment:
      POSTGRES_DB: yanc_cms
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - cms_postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  cms-api:
    build: ./apps/cms-api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@cms-db:5432/yanc_cms
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
    depends_on:
      - cms-api
    restart: unless-stopped

volumes:
  cms_postgres_data:
```

## Monitoring & Maintenance

### Health Checks
```bash
# API Health Check
curl http://localhost:3001/api/health

# Google Drive Connectivity Test
npm run test:google-drive

# Content Sync Verification
npm run verify-content-sync
```

### Backup Strategy
```bash
# Automated database backups
0 2 * * * pg_dump -U yanc yanc_cms > /backups/yanc_cms_$(date +%Y%m%d).sql

# Google Drive backup strategy
# Regularly audit Google Drive for unused files
# Implement retention policies for temporary uploads
```

This pipeline provides a complete roadmap for building your headless CMS system with Google Drive integration that integrates seamlessly with your existing YANC website while providing cost-effective media storage and robust administration capabilities.