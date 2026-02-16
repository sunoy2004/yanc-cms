import { DatabaseHealthService } from './database-health.service';
export declare class HealthController {
    private databaseHealthService;
    private readonly logger;
    constructor(databaseHealthService: DatabaseHealthService);
    healthCheck(): {
        status: string;
        timestamp: string;
    };
    databaseHealth(): Promise<{
        database: string;
        timestamp: string;
    }>;
    environmentCheck(): {
        supabaseUrl: string;
        supabaseAnonKey: string;
        supabaseServiceRoleKey: string;
        googleProjectId: string;
        googleDriveRootFolder: string;
        googleSharedDrive: string;
        nodeEnv: string;
        port: string;
        timestamp: string;
    };
}
