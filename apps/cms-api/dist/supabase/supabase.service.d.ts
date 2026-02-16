import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly logger;
    private client;
    constructor();
    getClient(): SupabaseClient;
    healthCheck(): Promise<boolean>;
}
