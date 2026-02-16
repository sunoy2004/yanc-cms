export declare enum EventCategory {
    UPCOMING = "upcoming",
    PAST = "past"
}
export type EventCategoryType = 'upcoming' | 'past';
export declare class CreateEventDto {
    title: string;
    description?: string;
    speaker?: string;
    location?: string;
    eventDate?: string;
    category: 'upcoming' | 'past';
    published?: boolean;
    displayOrder?: number;
    mediaIds?: string[];
    highlights?: string[];
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    speaker?: string;
    location?: string;
    eventDate?: string;
    category?: 'upcoming' | 'past';
    published?: boolean;
    displayOrder?: number;
    mediaIds?: string[];
    highlights?: string[];
}
