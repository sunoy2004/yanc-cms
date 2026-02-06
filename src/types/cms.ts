// CMS Content Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  mediaItems: MediaItem[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  imageAlt?: string;
  gallery: MediaItem[];
  highlights: string[];
  isPublished: boolean;
  isPast: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  imageAlt?: string;
  gallery: MediaItem[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MentorTalk {
  id: string;
  title: string;
  speaker: string;
  speakerBio: string;
  date: string;
  description: string;
  content: string;
  videoUrl?: string;
  thumbnail?: string;
  gallery: MediaItem[];
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  image: string;
  imageAlt?: string;
  socialLinks: SocialLink[];
  memberType: 'executive' | 'cohort_founder' | 'advisory' | 'global_mentor';
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'website' | 'email';
  url: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  rating?: number;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  isPublished: boolean;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  caption?: string;
  thumbnailUrl?: string;
  order: number;
  createdAt: string;
  driveId?: string;
  mimeType?: string;
  storageType?: 'google_drive' | 'local';
}

export interface MediaLibraryItem extends MediaItem {
  filename: string;
  size: number;
  mimeType: string;
  folder?: string;
  tags: string[];
}

export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  totalTeamMembers: number;
  totalPrograms: number;
  totalTestimonials: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  contentType: string;
  contentTitle: string;
  user: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadResponse {
  url: string;
  thumbnailUrl?: string;
  metadata: {
    filename: string;
    size: number;
    mimeType: string;
  };
}
