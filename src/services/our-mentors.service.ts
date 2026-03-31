export interface OurMentor {
  id: string;
  name: string;
  image: { mediaId: string; url: string } | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOurMentorDto {
  name: string;
  mediaId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateOurMentorDto {
  name?: string;
  mediaId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export class OurMentorsService {
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

  static async listAdmin(): Promise<OurMentor[]> {
    return this.request<OurMentor[]>('/our-mentors');
  }

  static async create(dto: CreateOurMentorDto): Promise<OurMentor[]> {
    return this.request<OurMentor[]>('/our-mentors', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  static async update(id: string, dto: UpdateOurMentorDto): Promise<OurMentor[]> {
    return this.request<OurMentor[]>(`/our-mentors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  static async remove(id: string): Promise<boolean> {
    return this.request<boolean>(`/our-mentors/${id}`, {
      method: 'DELETE',
    });
  }
}

