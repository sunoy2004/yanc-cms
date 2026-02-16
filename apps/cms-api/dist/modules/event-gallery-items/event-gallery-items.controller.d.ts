import { EventGalleryItemsService } from './event-gallery-items.service';
import { CreateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
import { UpdateEventGalleryItemDto } from '../../dtos/event-gallery-item.dto';
export declare class EventGalleryItemsController {
    private readonly eventGalleryItemsService;
    constructor(eventGalleryItemsService: EventGalleryItemsService);
    getPublicEventGalleryItems(): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createEventGalleryItem(createDto: CreateEventGalleryItemDto): Promise<{
        id: any;
        title: any;
        description: any;
        media: any;
        isActive: any;
        displayOrder: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    updateEventGalleryItem(id: string, updateDto: UpdateEventGalleryItemDto): Promise<{
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
