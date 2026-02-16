import { SupabaseService } from '../../supabase/supabase.service';
import { CreateEventDto } from '../../dtos/event.dto';
import { UpdateEventDto } from '../../dtos/event-update.dto';
export declare class EventsService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    getEvents(): Promise<any[]>;
    createEvent(dto: CreateEventDto): Promise<any[]>;
    updateEvent(id: string, dto: UpdateEventDto): Promise<any[]>;
    deleteEvent(id: string): Promise<boolean>;
}
