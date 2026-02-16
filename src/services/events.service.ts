import { Event } from '@/types/cms';

enum EventCategory {
  UPCOMING = 'upcoming',
  PAST = 'past',
}

interface CreateEventDto {
  title: string;
  description?: string;
  speaker?: string;
  location?: string;
  eventDate?: string;
  published?: boolean;
  displayOrder?: number;
  mediaIds?: string[];
  category: 'upcoming' | 'past';
}

interface UpdateEventDto {
  title?: string;
  description?: string;
  speaker?: string;
  location?: string;
  eventDate?: string;
  published?: boolean;
  displayOrder?: number;
  mediaIds?: string[];
  category?: 'upcoming' | 'past';
}

/**
 * Service for managing upcoming events in the CMS
 * This service handles CRUD operations for events that are categorized as 'upcoming'
 */
export class EventsService {
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

  static async getEvents(): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>('/events/public');
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  static async getUpcomingEvents(): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>('/events/upcoming');
      console.log('UPCOMING EVENTS DATA:', events);
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  static async getPastEvents(): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>('/events/past');
      console.log('PAST EVENTS DATA:', events);
      return events;
    } catch (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }
  }


  static async createEvent(dto: CreateEventDto): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>('/events', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return events;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, dto: UpdateEventDto): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return events;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string): Promise<boolean> {
    try {
      await this.request(`/events/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  static async togglePublish(id: string, published: boolean): Promise<Event[]> {
    try {
      const events = await this.request<Event[]>(`/events/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ published }),
      });
      return events;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      throw error;
    }
  }
}