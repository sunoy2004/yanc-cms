import { StatsService } from './stats.service';
export declare class StatsController {
    private stats;
    constructor(stats: StatsService);
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
