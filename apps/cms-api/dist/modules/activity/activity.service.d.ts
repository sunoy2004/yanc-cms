import { SupabaseService } from '../../supabase/supabase.service';
export declare class ActivityService {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    private client;
    getRecent(limit?: number): Promise<{
        id: any;
        action: string;
        contentType: string;
        contentTitle: any;
        user: string;
        timestamp: any;
    }[]>;
}
