import { SupabaseService } from '../../supabase/supabase.service';
import { CreateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
import { UpdateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
export declare class EventGalleryItemsService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getEventGalleryItems(): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createEventGalleryItem(dto: CreateEventGalleryItemDto): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    updateEventGalleryItem(id: string, dto: UpdateEventGalleryItemDto): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    deleteEventGalleryItem(id: string): Promise<boolean>;
    togglePublish(id: string, isActive: boolean): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
}
