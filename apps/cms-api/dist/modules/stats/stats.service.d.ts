import { SupabaseService } from '../../supabase/supabase.service';
export declare class StatsService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    private client;
    countTable(table: string, publishedColumn?: string): Promise<{
        total: number;
        published: number;
    }>;
    getEventsTotal(): Promise<{
        total: number;
        published: number;
    }>;
    getStats(): Promise<{
        events: {
            total: number;
            published: number;
        };
        team: {
            total: number;
            published: number;
        };
        programs: {
            total: number;
            published: number;
        };
        testimonials: {
            total: number;
            published: number;
        };
    }>;
}
