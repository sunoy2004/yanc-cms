import { EventsService } from './events.service';
import { CreateEventDto } from '../../dtos/event.dto';
import { UpdateEventDto } from '../../dtos/event-update.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getPublicEvents(): Promise<any[]>;
    getUpcomingEvents(): Promise<any[]>;
    getPastEvents(): Promise<any[]>;
    getEventHighlights(): Promise<any[]>;
    getEventGalleryDeprecated(): Promise<any[]>;
    getEventsByYear(year: string): Promise<any[]>;
    createEvent(createEventDto: CreateEventDto): Promise<any[]>;
    updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<any[]>;
    deleteEvent(id: string): Promise<boolean>;
    togglePublish(id: string, published: boolean): Promise<any[]>;
}
