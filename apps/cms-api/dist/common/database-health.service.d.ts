import { OnModuleInit } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
export declare class DatabaseHealthService implements OnModuleInit {
    private supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    onModuleInit(): Promise<void>;
    private validateDatabaseConnection;
    isDatabaseHealthy(): Promise<boolean>;
}
