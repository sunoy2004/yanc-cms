// Event Gallery Items Service - Strictly Isolated from Events
export interface EventGalleryItem {
  id: string;
  title?: string;
  description?: string;
  media: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    alt: string;
  }>;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventGalleryItemDto {
  title?: string;
  description?: string;
  mediaIds?: string[]; // Changed from mediaId to mediaIds array
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateEventGalleryItemDto {
  title?: string;
  description?: string;
  mediaIds?: string[]; // Changed from mediaId to mediaIds array
  isActive?: boolean;
  displayOrder?: number;
}

export class EventGalleryItemsService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const API_BASE_URL = import.meta.env.VITE_CMS_BASE_URL || 'http://localhost:3001';
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getEventGalleryItems(): Promise<EventGalleryItem[]> {
    try {
      const items = await this.request<EventGalleryItem[]>('/event-gallery-items/public');
      console.log('EVENT GALLERY DATA:', items);
      return items;
    } catch (error) {
      console.error('Error fetching event gallery items:', error);
      throw error;
    }
  }

  static async createEventGalleryItem(dto: CreateEventGalleryItemDto): Promise<EventGalleryItem[]> {
    try {
      const items = await this.request<EventGalleryItem[]>('/event-gallery-items', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return items;
    } catch (error) {
      console.error('Error creating event gallery item:', error);
      throw error;
    }
  }

  static async updateEventGalleryItem(id: string, dto: UpdateEventGalleryItemDto): Promise<EventGalleryItem[]> {
    try {
      const items = await this.request<EventGalleryItem[]>(`/event-gallery-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return items;
    } catch (error) {
      console.error('Error updating event gallery item:', error);
      throw error;
    }
  }

  static async deleteEventGalleryItem(id: string): Promise<boolean> {
    try {
      await this.request(`/event-gallery-items/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting event gallery item:', error);
      throw error;
    }
  }

  static async togglePublish(id: string, isActive: boolean): Promise<EventGalleryItem[]> {
    try {
      const items = await this.request<EventGalleryItem[]>(`/event-gallery-items/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      return items;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      throw error;
    }
  }
}