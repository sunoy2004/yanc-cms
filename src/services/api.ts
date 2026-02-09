// Production API Service for YANC CMS
const API_BASE_URL = 'http://localhost:3001/api'; // Production absolute URL

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
  driveUrl: string;
  storageType: 'google_drive' | 'local';
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
    const allowedKeys = ['title', 'subtitle', 'ctaText', 'ctaLink', 'published', 'mediaIds'];
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
}

export const apiService = new ApiService();