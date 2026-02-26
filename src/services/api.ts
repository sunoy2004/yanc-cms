// Production API Service for YANC CMS
import { getApiBase } from '@/lib/api';

// Ensure we always talk to the same backend base used elsewhere (AuthContext, stats, etc.)
const API_BASE_URL = (() => {
  const base = getApiBase();
  return base.endsWith('/api') ? base : `${base}/api`;
})();

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

interface MediaUploadResponse {
  id: string;
  name: string;
  driveId: string;
  mimeType: string;
  url: string; // Supabase Storage URL
  storageType: 'supabase_storage' | 'google_drive';
  createdAt: string;
}

interface MediaItem {
  id: string;
  name: string;
  driveId: string;
  mimeType: string;
  createdAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token and build headers safely
    // Primary token used by AuthContext
    const primaryToken = localStorage.getItem('yanc_cms_token');
    // Fallback to any legacy token key if present
    const legacyToken = localStorage.getItem('access_token');
    const token = primaryToken || legacyToken || '';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Only add Authorization header if token exists and is valid
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error, use the default message
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Production Media Upload API
  async uploadMedia(file: File, folder: string = 'uploads'): Promise<MediaUploadResponse> {
    // Client-side validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Create FormData with proper structure
    const formData = new FormData();
    formData.append('file', file, file.name); // Explicit filename
    formData.append('folder', folder);

    console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to folder: ${folder}`);

    try {
      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  async getMedia(): Promise<MediaItem[]> {
    return this.request<MediaItem[]>('/media');
  }

  async deleteMedia(id: string): Promise<void> {
    await this.request(`/media/${id}`, { method: 'DELETE' });
  }

  // Hero Content API - Production Implementation
  async getHeroContent(): Promise<any> {
    return this.request<any>('/hero');
  }

  async createHeroContent(data: any): Promise<any> {
    return this.request<any>('/hero', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHeroContent(id: string, data: any): Promise<any> {
    // Guardrail: Filter out forbidden keys that should not be sent in update requests
    const allowedKeys = ['title', 'subtitle', 'description', 'ctaText', 'ctaLink', 'published', 'mediaIds'];
    const filteredData: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedKeys.includes(key)) {
        filteredData[key] = value;
      } else {
        console.warn(`⚠️ Ignoring forbidden key in update payload: ${key}`);
      }
    }
    
    console.log('📤 Sending update payload:', filteredData); // Log payload for debugging
    
    return this.request<any>(`/hero/${id}`, {
      method: 'PUT',
      body: JSON.stringify(filteredData),
    });
  }

  async deleteHeroContent(id: string): Promise<void> {
    await this.request(`/hero/${id}`, { method: 'DELETE' });
  }

  // Mentor Talks API
  async getMentorTalks(): Promise<any[]> {
    return this.request<any[]>('/mentor-talks');
  }

  async getPublicMentorTalks(): Promise<any[]> {
    return this.request<any[]>('/mentor-talks/public');
  }

  async createMentorTalk(data: any): Promise<any> {
    return this.request<any>('/mentor-talks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMentorTalk(id: string, data: any): Promise<any> {
    return this.request<any>(`/mentor-talks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMentorTalk(id: string): Promise<void> {
    await this.request(`/mentor-talks/${id}`, { method: 'DELETE' });
  }

  async toggleMentorTalkPublish(id: string, published: boolean): Promise<any> {
    return this.request<any>(`/mentor-talks/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ published }),
    });
  }

  // Programs API
  async getPrograms(): Promise<any[]> {
    return this.request<any[]>('/programs');
  }

  async createProgram(data: any): Promise<any[]> {
    return this.request<any[]>('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProgram(id: string, data: any): Promise<any[]> {
    return this.request<any[]>(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProgram(id: string): Promise<void> {
    await this.request(`/programs/${id}`, { method: 'DELETE' });
  }

  async toggleProgramPublish(id: string, published: boolean): Promise<any[]> {
    return this.request<any[]>(`/programs/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ published }),
    });
  }
}

export const apiService = new ApiService();